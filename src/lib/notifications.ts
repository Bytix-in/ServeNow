// Unified notification helper for staff (cook/waiter/manager) panels
// Uses service worker notifications on Android if available, otherwise falls back to Notification API

export interface StaffNotificationOptions {
  body: string;
  tag: string;
  icon?: string;
  badge?: string;
  vibrate?: number[];
  actions?: Array<{ action: string; title: string }>;
}

export async function showStaffNotification(
  title: string,
  options: StaffNotificationOptions
) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const isAndroid = /Android/i.test(navigator.userAgent);
  const swOpts = {
    ...options,
    requireInteraction: false,
    silent: false,
    vibrate: options.vibrate || [200, 100, 200],
    icon: options.icon || '/vite.svg',
    badge: options.badge || '/favicon.ico',
    actions: options.actions || [],
  };

  // Prefer service worker notifications on Android
  if (isAndroid && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, swOpts);
      return;
    } catch (err) {
      // Fallback to regular notification
    }
  }

  try {
    const notification = new Notification(title, swOpts);
    notification.onclick = function () {
      window.focus();
      this.close();
    };
    // Auto-close notification after 8 seconds on Android
    if (isAndroid) {
      setTimeout(() => notification.close(), 8000);
    }
  } catch (error) {
    // Fallback: do nothing
  }
} 