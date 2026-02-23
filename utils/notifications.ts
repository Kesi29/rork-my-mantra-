import { Platform, Alert as RNAlert } from 'react-native';
import * as Notifications from 'expo-notifications';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function requestPermissionsWithWarning(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }
  const granted = await requestPermissions();
  if (!granted) {
    RNAlert.alert(
      'Notifications Are Essential',
      'My Māntra uses notifications to deliver your mantras throughout the day. Without them, you won\'t receive your daily affirmations.\n\nPlease enable notifications in your device settings to get the full experience.',
      [
        { text: 'I Understand', style: 'cancel' },
      ],
    );
  }
  return granted;
}

export async function scheduleMantraNotifications(
  mantras: string[],
  timesPerDay: number,
  startHour: number,
  endHour: number,
  enabled: boolean,
): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform — skipping scheduling');
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const validMantras = mantras.filter((m) => m.trim().length > 0);
  if (!enabled || validMantras.length === 0 || timesPerDay <= 0) {
    console.log('[Notifications] Cancelled all — disabled or no mantras');
    return;
  }

  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    console.log('[Notifications] No permission');
    return;
  }

  const totalHours = endHour - startHour;
  if (totalHours <= 0) return;

  const interval = totalHours / timesPerDay;
  const MAX_JITTER_MINUTES = 10;

  for (let i = 0; i < timesPerDay; i++) {
    const mantraText = validMantras[i % validMantras.length];
    const rawHour = startHour + interval * i + interval / 2;

    const jitterMinutes = Math.round((Math.random() * 2 - 1) * MAX_JITTER_MINUTES);
    const totalMinutes = Math.floor(rawHour * 60) + jitterMinutes;

    const clampedMinutes = Math.max(startHour * 60, Math.min(endHour * 60 - 1, totalMinutes));
    const hour = Math.floor(clampedMinutes / 60);
    const minute = clampedMinutes % 60;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Mantra',
        body: mantraText,
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    console.log(`[Notifications] Scheduled "${mantraText.substring(0, 30)}..." at ${hour}:${String(minute).padStart(2, '0')} (jitter: ${jitterMinutes}m)`);
  }
}
