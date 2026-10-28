import { PropertyStop } from '../types';

function formatICSDate(dateStr: string, timeStr?: string): string {
  // dateStr is YYYY-MM-DD
  const cleanDate = dateStr.replace(/-/g, '');
  if (!timeStr) {
    return `${cleanDate}T090000`;
  }
  const cleanTime = timeStr.replace(':', '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

export function generateCombinedICS(properties: PropertyStop[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The Great Kiwi Permaculture Tour 2027//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:The Great Kiwi Permaculture Tour 2027 Itinerary',
    'X-WR-TIMEZONE:Pacific/Auckland',
  ];

  properties.forEach(prop => {
    // If has event components, create calendar event for each component on start date
    if (prop.eventComponents && prop.eventComponents.length > 0) {
      prop.eventComponents.forEach(comp => {
        const uid = `perma-${prop.id}-${comp.id}-2027@greatkiwipermatour.nz`;
        const dtStart = formatICSDate(prop.startDate, comp.startTime);
        const dtEnd = formatICSDate(prop.startDate, comp.endTime);
        const summary = `${comp.title} (${prop.name})`;
        const description = `${comp.description}\\n\\nHost: ${prop.hostName} (${prop.hostPhone})\\nPricing: ${comp.pricingType} ${comp.priceAmount ? '$' + comp.priceAmount : ''}\\nArrival: ${prop.addressDescription}`;
        const location = `${prop.district}, ${prop.region}, New Zealand`;

        lines.push(
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTSTART:${dtStart}`,
          `DTEND:${dtEnd}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          `LOCATION:${location}`,
          `GEO:${prop.coordinates.lat};${prop.coordinates.lng}`,
          'STATUS:CONFIRMED',
          'END:VEVENT'
        );
      });
    } else {
      // General full-day event for the stop
      const uid = `perma-${prop.id}-general-2027@greatkiwipermatour.nz`;
      const dtStart = formatICSDate(prop.startDate, '09:00');
      const dtEnd = formatICSDate(prop.endDate, '17:00');
      const summary = `Kiwi Permaculture Tour: ${prop.name}`;
      const description = `Permaculture stop in ${prop.district}, ${prop.region}.\\nHost: ${prop.hostName}\\nFeatures: ${prop.features.join(', ')}`;
      const location = `${prop.district}, ${prop.region}, New Zealand`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART:${dtStart}`,
        `DTEND:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `GEO:${prop.coordinates.lat};${prop.coordinates.lng}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    }
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICSFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
