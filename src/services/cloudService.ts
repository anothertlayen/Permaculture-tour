import {
  db,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { Booking, PropertyStop, BookingStatus, ChatMessage } from '../types';
import { isDemoBooking, isDemoChatMessage } from '../utils/storage';

// Real-time listener for all bookings (or filtered by guest email)
export function subscribeToCloudBookings(
  onUpdate: (bookings: Booking[]) => void,
  userEmail?: string,
  isDemoDataOn: boolean = true
) {
  try {
    const bookingsColl = collection(db, 'bookings');
    let q = query(bookingsColl);

    if (userEmail) {
      q = query(bookingsColl, where('guestEmail', '==', userEmail.toLowerCase().trim()));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudBookings: Booking[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Booking;
          const booking: Booking = {
            ...data,
            id: docSnap.id,
          };
          if (!isDemoDataOn && isDemoBooking(booking)) {
            return;
          }
          cloudBookings.push(booking);
        });
        onUpdate(cloudBookings);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'bookings');
    return () => {};
  }
}

// Save or sync booking to Firestore
export async function syncBookingToCloud(booking: Booking, userId?: string): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', booking.id);
    await setDoc(
      docRef,
      {
        ...booking,
        userId: userId || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `bookings/${booking.id}`);
  }
}

// Update booking status in Firestore
export async function updateCloudBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      status,
      confirmedAt: status === 'Confirmed' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
  }
}

// Save roadtrip itinerary to Firestore
export async function syncItineraryToCloud(userId: string, stopIds: string[]): Promise<void> {
  try {
    const docRef = doc(db, 'itineraries', userId);
    await setDoc(
      docRef,
      {
        userId,
        stopIds,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `itineraries/${userId}`);
  }
}

// Sync chat messages
export function subscribeToCloudChats(
  onUpdate: (messages: ChatMessage[]) => void,
  isDemoDataOn: boolean = true
) {
  try {
    const chatsColl = collection(db, 'chats');
    const unsubscribe = onSnapshot(
      chatsColl,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const msg: ChatMessage = {
            ...(docSnap.data() as ChatMessage),
            id: docSnap.id,
          };
          if (!isDemoDataOn && isDemoChatMessage(msg)) {
            return;
          }
          msgs.push(msg);
        });
        // Sort chronologically
        msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        onUpdate(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'chats');
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'chats');
    return () => {};
  }
}

export async function sendCloudChatMessage(msg: ChatMessage): Promise<void> {
  try {
    const docRef = doc(db, 'chats', msg.id);
    await setDoc(docRef, msg, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `chats/${msg.id}`);
  }
}

// Clean all sample/demo data documents from Cloud Firestore
export async function deleteCloudDemoData(): Promise<void> {
  try {
    const demoBookingIds = ['bkg-101', 'bkg-102', 'bkg-103', 'bkg-104'];
    const demoChatIds = [
      'msg-1',
      'msg-2',
      'msg-3',
      'msg-4',
      'msg-5',
      'msg-6',
      'msg-7',
      'msg-8',
    ];

    const promises: Promise<void>[] = [];

    for (const id of demoBookingIds) {
      promises.push(
        deleteDoc(doc(db, 'bookings', id)).catch(err => {
          console.warn(`Could not remove demo booking ${id} from cloud:`, err);
        })
      );
    }

    for (const id of demoChatIds) {
      promises.push(
        deleteDoc(doc(db, 'chats', id)).catch(err => {
          console.warn(`Could not remove demo chat ${id} from cloud:`, err);
        })
      );
    }

    await Promise.all(promises);
  } catch (err) {
    console.warn('Error while clearing cloud demo data:', err);
  }
}

// Sync property stop details & all of its scheduled event sessions to Firestore
export async function syncPropertyToCloud(property: PropertyStop): Promise<void> {
  try {
    const docRef = doc(db, 'properties', property.id);
    const hostUserId = property.hostUserId || property.ownerUserId || null;
    await setDoc(
      docRef,
      {
        ...property,
        hostUserId,
        ownerUserId: hostUserId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Also persist each event session into the dedicated 'events' collection
    if (Array.isArray(property.eventComponents)) {
      const eventPromises = property.eventComponents.map(comp => {
        const eventId = comp.id || `${property.id}_${comp.startTime.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const eventDocRef = doc(db, 'events', eventId);
        return setDoc(
          eventDocRef,
          {
            id: eventId,
            propertyId: property.id,
            propertyName: property.name,
            title: comp.title,
            activityType: comp.activityType,
            pricingType: comp.pricingType,
            priceAmount: comp.priceAmount || 0,
            description: comp.description || '',
            capacity: comp.capacity,
            spotsRemaining: comp.spotsRemaining,
            startTime: comp.startTime,
            endTime: comp.endTime,
            hostName: property.hostName,
            hostEmail: property.hostEmail,
            region: property.region,
            district: property.district,
            datesText: property.datesText,
            createdAt: property.startDate || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      });
      await Promise.all(eventPromises);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `properties/${property.id}`);
  }
}

// Real-time listener for community & user-entered permaculture properties and events
export function subscribeToCloudProperties(
  onUpdate: (properties: PropertyStop[]) => void
) {
  try {
    const propsColl = collection(db, 'properties');
    const unsubscribe = onSnapshot(
      propsColl,
      (snapshot) => {
        const cloudProps: PropertyStop[] = [];
        snapshot.forEach((docSnap) => {
          cloudProps.push({
            ...(docSnap.data() as PropertyStop),
            id: docSnap.id,
          });
        });
        onUpdate(cloudProps);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'properties');
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'properties');
    return () => {};
  }
}

// Bulk sync any locally stored user-registered properties/events to Cloud Firestore
export async function syncAllCustomPropertiesToCloud(properties: PropertyStop[]): Promise<void> {
  const customProps = (properties || []).filter(
    p => p.isUserOwned || p.id.startsWith('prop-custom-') || Boolean(p.createdByEmail)
  );
  for (const prop of customProps) {
    try {
      await syncPropertyToCloud(prop);
    } catch (e) {
      console.warn('Could not sync custom property to cloud:', prop.id, e);
    }
  }
}


