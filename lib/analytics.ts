const SITE_ID = 'fcmUHjFamMemKuynmcnb';

export function trackEvent(eventName: string, properties?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams();
    params.append('site', SITE_ID);
    params.append('name', eventName);

    if (properties) {
      params.append('props', JSON.stringify(properties));
    }

    // Send beacon to Tinylytics
    navigator.sendBeacon(`https://tinylytics.app/api/event`, params);
  } catch (error) {
    // Silently fail if analytics doesn't work
    console.warn('Analytics tracking failed:', error);
  }
}
