import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTALL_DATE_KEY = 'arrival_installDate';
const OPEN_COUNT_KEY = 'arrival_openCount';
const PREFERRED_STYLE_KEY = 'arrival_preferredStyle';

/**
 * Records this notification open and returns whether the Share button
 * should be shown this time.
 * - First 7 days after first open: always show
 * - After 7 days: show every 3rd open
 */
export async function recordArrivalAndCheckShare(): Promise<boolean> {
  const now = new Date();
  const [installDateStr, countStr] = await Promise.all([
    AsyncStorage.getItem(INSTALL_DATE_KEY),
    AsyncStorage.getItem(OPEN_COUNT_KEY),
  ]);

  let installDate: Date;
  let count: number;

  if (!installDateStr) {
    installDate = now;
    count = 1;
    await AsyncStorage.setItem(INSTALL_DATE_KEY, now.toISOString());
  } else {
    installDate = new Date(installDateStr);
    count = parseInt(countStr ?? '0', 10) + 1;
  }

  await AsyncStorage.setItem(OPEN_COUNT_KEY, count.toString());

  const daysSinceInstall =
    (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24);

  return daysSinceInstall <= 7 || count % 3 === 0;
}

export async function getPreferredStyle(): Promise<string> {
  return (await AsyncStorage.getItem(PREFERRED_STYLE_KEY)) ?? 'ember';
}

export async function setPreferredStyle(styleId: string): Promise<void> {
  await AsyncStorage.setItem(PREFERRED_STYLE_KEY, styleId);
}
