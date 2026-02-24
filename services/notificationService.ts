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

// Local assets
const NOTIFICATION_SOUND_URL = '/assets/notifications/chime.mp3';
const NOTIFICATION_ICON_URL = '/assets/notifications/bell-icon.png';

let audioContextUnlocked = false;

/**
 * Browsers block audio until a user interaction occurs.
 * This function can be called on the first click to "unlock" audio capability.
 */
export const unlockAudio = () => {
  if (audioContextUnlocked) return;

  const audio = new Audio(NOTIFICATION_SOUND_URL);
  audio.volume = 0; // Silent play to unlock
  audio.play()
    .then(() => {
      audioContextUnlocked = true;
      console.debug('Notification audio context unlocked.');
    })
    .catch((err) => {
      console.debug('Audio unlock failed:', err);
    });
};

export const sendNotification = (title: string, body: string) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(title, {
        body,
        icon: NOTIFICATION_ICON_URL,
        badge: NOTIFICATION_ICON_URL,
        tag: 'jobmow-lead-alert',
        renotify: true,
        silent: false,
      } as any);

      // Play alert sound
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