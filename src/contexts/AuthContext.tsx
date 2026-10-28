import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  type User,
} from '../lib/firebase';
import { UserRole, GuestProfile, UserProfileData, UserTourPreferences } from '../types';
import { getStoredGuestProfile, saveStoredGuestProfile } from '../utils/storage';

export type { UserProfileData, UserTourPreferences };

interface AuthContextType {
  user: User | null;
  profile: UserProfileData | null;
  tourPreferences: UserTourPreferences | null;
  loading: boolean;
  signInWithGoogle: (preferredRole?: UserRole) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateCloudProfile: (data: Partial<UserProfileData>) => Promise<void>;
  updateTourPreferences: (prefs: Partial<UserTourPreferences>) => Promise<void>;
  isCloudConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const deriveNameFromEmail = (mail: string): string => {
  if (!mail || !mail.includes('@')) return 'Kiwi Traveler';
  const prefix = mail.split('@')[0];
  const words = prefix.split(/[._\-+0-9]+/).filter(Boolean);
  if (words.length === 0) return 'Kiwi Traveler';
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [tourPreferences, setTourPreferences] = useState<UserTourPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const pendingRoleRef = React.useRef<UserRole>('guest');

  // Sync auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          // 1. Fetch Core User Account Identity
          const userDocRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDocRef);

          let userProfile: UserProfileData;
          if (docSnap.exists()) {
            userProfile = docSnap.data() as UserProfileData;
          } else {
            // First time login - seed initial core user identity in users collection
            userProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || deriveNameFromEmail(currentUser.email || ''),
              photoURL: currentUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, userProfile, { merge: true });
          }
          setProfile(userProfile);

          // Clean up any stale fallback stubs with the same email
          if (currentUser.email) {
            try {
              const q = query(collection(db, 'users'), where('email', '==', currentUser.email.toLowerCase().trim()));
              const snap = await getDocs(q);
              for (const d of snap.docs) {
                if (d.id !== currentUser.uid && d.id.startsWith('usr_')) {
                  await deleteDoc(doc(db, 'users', d.id));
                  await deleteDoc(doc(db, 'tour_preferences', d.id)).catch(() => {});
                }
              }
            } catch (err) {
              console.warn('Could not clean up duplicate user stub:', err);
            }
          }

          // 2. Fetch Dedicated Tour & Roadtrip Preferences
          const prefDocRef = doc(db, 'tour_preferences', currentUser.uid);
          const prefSnap = await getDoc(prefDocRef);

          let userTourPrefs: UserTourPreferences;
          if (prefSnap.exists()) {
            userTourPrefs = prefSnap.data() as UserTourPreferences;
          } else {
            const localGuest = getStoredGuestProfile();
            userTourPrefs = {
              userId: currentUser.uid,
              travelStyle: localGuest.travelStyle || 'Self-Contained Campervan',
              homeRegion: localGuest.homeRegion || 'Aotearoa NZ',
              dietaryNotes: localGuest.dietaryNotes || '',
              groupName: localGuest.groupName || '',
              partyMembers: localGuest.partyMembers || [],
              seedSwapOfferings: localGuest.seedSwapOfferings || '',
              updatedAt: new Date().toISOString(),
            };
            await setDoc(prefDocRef, userTourPrefs, { merge: true });
          }
          setTourPreferences(userTourPrefs);

          // Sync to local guest profile representation for seamless UI display
          saveStoredGuestProfile({
            id: currentUser.uid,
            name: userProfile.displayName || currentUser.displayName || 'Kiwi Traveler',
            email: userProfile.email || currentUser.email || '',
            phone: userProfile.phone || '',
            dietaryNotes: userTourPrefs.dietaryNotes || '',
            groupName: userTourPrefs.groupName,
            partyMembers: userTourPrefs.partyMembers || [],
            travelStyle: (userTourPrefs.travelStyle as any) || 'Self-Contained Campervan',
            homeRegion: userTourPrefs.homeRegion || 'Auckland (Tāmaki Makaurau)',
            seedSwapOfferings: userTourPrefs.seedSwapOfferings,
            avatar: userProfile.photoURL || currentUser.photoURL || undefined,
          });

          setIsCloudConnected(true);
        } catch (err) {
          console.warn('Could not read user profile or tour preferences from cloud Firestore:', err);
          setIsCloudConnected(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setTourPreferences(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (preferredRole?: UserRole) => {
    if (preferredRole) {
      pendingRoleRef.current = preferredRole;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google Sign-In status:', err?.message || err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!pass) {
      throw new Error('Please enter your password.');
    }

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        throw new Error('Email & Password sign-in is not enabled on this project. Please click "Continue with Google" to sign in securely.');
      }
      if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, _role?: UserRole) => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!pass || pass.length < 6) {
      throw new Error('Firebase: Password should be at least 6 characters (auth/weak-password).');
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const newProfile: UserProfileData = {
        uid: cred.user.uid,
        email: cred.user.email || cleanEmail,
        displayName: name || deriveNameFromEmail(cleanEmail),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile, { merge: true });
      setProfile(newProfile);
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        throw new Error('Email registration is not enabled on this project. Please click "Continue with Google" to create your account securely.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {}
    setUser(null);
    setProfile(null);
    setTourPreferences(null);
  };

  // Update Core User Account Identity Profile
  const updateCloudProfile = async (data: Partial<UserProfileData>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const cleanData = { ...data, updatedAt: new Date().toISOString() };
      await setDoc(userDocRef, cleanData, { merge: true });
      setProfile((prev) => (prev ? { ...prev, ...cleanData } : null));

      // Also update local representation
      const localGuest = getStoredGuestProfile();
      saveStoredGuestProfile({
        ...localGuest,
        name: data.displayName || localGuest.name,
        email: data.email || localGuest.email,
        phone: data.phone !== undefined ? data.phone : localGuest.phone,
        avatar: data.photoURL || localGuest.avatar,
      });
    } catch (err) {
      console.warn('Failed to update cloud profile:', err);
      throw err;
    }
  };

  // Update Dedicated Tour Preferences
  const updateTourPreferences = async (prefs: Partial<UserTourPreferences>) => {
    if (!user) return;
    try {
      const prefDocRef = doc(db, 'tour_preferences', user.uid);
      const cleanPrefs = { ...prefs, userId: user.uid, updatedAt: new Date().toISOString() };
      await setDoc(prefDocRef, cleanPrefs, { merge: true });
      setTourPreferences((prev) =>
        prev ? { ...prev, ...cleanPrefs } : (cleanPrefs as UserTourPreferences)
      );

      // Also update local representation
      const localGuest = getStoredGuestProfile();
      saveStoredGuestProfile({
        ...localGuest,
        dietaryNotes: prefs.dietaryNotes !== undefined ? prefs.dietaryNotes : localGuest.dietaryNotes,
        groupName: prefs.groupName !== undefined ? prefs.groupName : localGuest.groupName,
        partyMembers: prefs.partyMembers !== undefined ? prefs.partyMembers : localGuest.partyMembers,
        homeRegion: prefs.homeRegion !== undefined ? prefs.homeRegion : localGuest.homeRegion,
        travelStyle: prefs.travelStyle !== undefined ? prefs.travelStyle : localGuest.travelStyle,
        seedSwapOfferings: prefs.seedSwapOfferings !== undefined ? prefs.seedSwapOfferings : localGuest.seedSwapOfferings,
        emergencyContact: prefs.emergencyContact !== undefined ? prefs.emergencyContact : localGuest.emergencyContact,
        bookOnBehalfAllowed: prefs.bookOnBehalfAllowed !== undefined ? prefs.bookOnBehalfAllowed : localGuest.bookOnBehalfAllowed,
      });
    } catch (err) {
      console.warn('Failed to update tour preferences:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        tourPreferences,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        updateCloudProfile,
        updateTourPreferences,
        isCloudConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
