export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const getNotificationPermissionState = (): NotificationPermission => {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// A professional notification chime
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const sendNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    try {
      // Fix: Cast options to any as properties like 'renotify' and 'silent' may not be in the default NotificationOptions type
      const n = new Notification(title, {
        body,
        icon: 'https://cdn-icons-png.flaticon.com/512/628/628283.png', 
        badge: 'https://cdn-icons-png.flaticon.com/512/628/628283.png',
        tag: 'jobmow-lead-alert',
        renotify: true,
        silent: false,
      } as any);

      // Play alert sound - browser might block this without prior user interaction
      const audio = new Audio(NOTIFICATION_SOUND_URL);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silently fail sound if blocked by autoplay policy
        console.debug('Notification sound playback blocked by browser policy.');
      });

      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch (e) {
      console.error("Failed to trigger browser notification:", e);
    }
  } else {
    console.warn('Notification permission not granted. Lead alert skipped.');
  }
};