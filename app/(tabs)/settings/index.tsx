import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  ScrollView,
  Animated,
  Platform,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight, Lock, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMantra } from '@/contexts/MantraContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { requestPermissions } from '@/utils/notifications';
import Colors from '@/constants/colors';

const FREQUENCY_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const PRO_FREQUENCY_OPTIONS = [15, 20, 25, 30];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MAX_CUSTOM_FREQUENCY = 100;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, updateSettings, isSaving } = useMantra();
  const { isPro } = useSubscription();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showCustomFreq, setShowCustomFreq] = useState<boolean>(false);
  const [customFreqDraft, setCustomFreqDraft] = useState<string>('');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const allPresets = isPro
    ? [...FREQUENCY_OPTIONS, ...PRO_FREQUENCY_OPTIONS]
    : FREQUENCY_OPTIONS;
  const isCustomValue = !allPresets.includes(settings.timesPerDay);
  const windowMinutes = Math.max(0, (settings.endHour - settings.startHour) * 60);
  const maxCustom = Math.min(MAX_CUSTOM_FREQUENCY, windowMinutes);

  const handleCustomFreqOpen = useCallback(() => {
    if (!isPro) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/paywall');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomFreqDraft(isCustomValue ? String(settings.timesPerDay) : '');
    setShowCustomFreq(true);
  }, [isPro, router, isCustomValue, settings.timesPerDay]);

  const handleCustomFreqSave = useCallback(() => {
    const val = parseInt(customFreqDraft, 10);
    if (isNaN(val) || val < 1) {
      setShowCustomFreq(false);
      return;
    }
    const clamped = Math.min(Math.max(1, val), maxCustom);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateSettings({ timesPerDay: clamped });
    setShowCustomFreq(false);
  }, [customFreqDraft, maxCustom, updateSettings]);

  const toggleSection = useCallback((section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection((prev) => (prev === section ? null : section));
  }, []);

  const handleToggleNotifications = useCallback(
    async (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (value && Platform.OS !== 'web') {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to receive mantra reminders.',
          );
          return;
        }
      }
      updateSettings({ notificationsEnabled: value });
    },
    [updateSettings],
  );

  const formatHour = (h: number): string => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageLabel}>SETTINGS</Text>
        <Text style={styles.title}>Configure your{'\n'}practice.</Text>

        {!isPro && (
          <Pressable
            style={({ pressed }) => [
              styles.proCard,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/paywall');
            }}
            testID="go-pro-btn"
          >
            <View>
              <Text style={styles.proTitle}>UPGRADE TO PRO</Text>
              <Text style={styles.proHint}>Unlock all premium mantras</Text>
            </View>
            <ChevronRight size={18} color={Colors.white} />
          </Pressable>
        )}

        {isPro && (
          <View style={styles.proActiveBadge}>
            <Text style={styles.proActiveText}>PRO ACTIVE</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingHint}>
              {settings.notificationsEnabled ? 'Reminders are active' : 'Reminders are paused'}
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: Colors.border, true: '#333333' }}
            thumbColor={Colors.white}
            testID="notifications-toggle"
          />
        </View>

        <View style={styles.divider} />

        <Pressable
          style={styles.settingRow}
          onPress={() => toggleSection('frequency')}
          testID="frequency-section"
        >
          <View>
            <Text style={styles.settingLabel}>Frequency</Text>
            <Text style={styles.settingHint}>{settings.timesPerDay} times per day</Text>
          </View>
          <ChevronRight
            size={16}
            color={Colors.textMuted}
            style={expandedSection === 'frequency' ? { transform: [{ rotate: '90deg' }] } : undefined}
          />
        </Pressable>

        {expandedSection === 'frequency' && (
          <View style={styles.optionsGrid}>
            {allPresets.map((n) => {
              const needsPro = n > 12 && !isPro;
              return (
                <Pressable
                  key={n}
                  style={[
                    styles.optionChip,
                    settings.timesPerDay === n && !isCustomValue && styles.optionChipActive,
                    needsPro && styles.optionChipLocked,
                  ]}
                  onPress={() => {
                    if (needsPro) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                      router.push('/paywall');
                      return;
                    }
                    Haptics.selectionAsync();
                    setShowCustomFreq(false);
                    updateSettings({ timesPerDay: n });
                  }}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      settings.timesPerDay === n && !isCustomValue && styles.optionChipTextActive,
                      needsPro && styles.optionChipTextLocked,
                    ]}
                  >
                    {n}x
                  </Text>
                  {needsPro && <Lock size={8} color={Colors.textMuted} />}
                </Pressable>
              );
            })}

            <Pressable
              style={[
                styles.optionChip,
                styles.customChip,
                isCustomValue && styles.optionChipActive,
                !isPro && styles.optionChipLocked,
              ]}
              onPress={handleCustomFreqOpen}
            >
              <Text
                style={[
                  styles.optionChipText,
                  isCustomValue && styles.optionChipTextActive,
                  !isPro && styles.optionChipTextLocked,
                ]}
              >
                {isCustomValue ? `${settings.timesPerDay}x` : 'Custom'}
              </Text>
              {!isPro && <Lock size={8} color={Colors.textMuted} />}
            </Pressable>

            {showCustomFreq && (
              <View style={styles.customFreqRow}>
                <TextInput
                  style={styles.customFreqInput}
                  value={customFreqDraft}
                  onChangeText={setCustomFreqDraft}
                  placeholder={`1\u2013${maxCustom}`}
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={3}
                  autoFocus
                  testID="custom-freq-input"
                />
                <Text style={styles.customFreqSuffix}>times/day</Text>
                <Pressable style={styles.customFreqSaveBtn} onPress={handleCustomFreqSave}>
                  <Check size={14} color={Colors.white} />
                </Pressable>
                <Pressable
                  style={styles.customFreqCancelBtn}
                  onPress={() => setShowCustomFreq(false)}
                >
                  <X size={14} color={Colors.textMuted} />
                </Pressable>
              </View>
            )}

            {showCustomFreq && (
              <Text style={styles.customFreqHint}>
                Max {maxCustom} for your {settings.endHour - settings.startHour}h window (1 per minute, 100 max)
              </Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        <Pressable
          style={styles.settingRow}
          onPress={() => toggleSection('hours')}
          testID="hours-section"
        >
          <View>
            <Text style={styles.settingLabel}>Active Hours</Text>
            <Text style={styles.settingHint}>
              {formatHour(settings.startHour)} – {formatHour(settings.endHour)}
            </Text>
          </View>
          <ChevronRight
            size={16}
            color={Colors.textMuted}
            style={expandedSection === 'hours' ? { transform: [{ rotate: '90deg' }] } : undefined}
          />
        </Pressable>

        {expandedSection === 'hours' && (
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursLabel}>START</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.hoursRow}>
                {HOURS.filter((h) => h < settings.endHour).map((h) => (
                  <Pressable
                    key={`start-${h}`}
                    style={[
                      styles.hourChip,
                      settings.startHour === h && styles.hourChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateSettings({ startHour: h });
                    }}
                  >
                    <Text
                      style={[
                        styles.hourChipText,
                        settings.startHour === h && styles.hourChipTextActive,
                      ]}
                    >
                      {formatHour(h)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text style={[styles.hoursLabel, { marginTop: 16 }]}>END</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.hoursRow}>
                {HOURS.filter((h) => h > settings.startHour).map((h) => (
                  <Pressable
                    key={`end-${h}`}
                    style={[
                      styles.hourChip,
                      settings.endHour === h && styles.hourChipActive,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateSettings({ endHour: h });
                    }}
                  >
                    <Text
                      style={[
                        styles.hourChipText,
                        settings.endHour === h && styles.hourChipTextActive,
                      ]}
                    >
                      {formatHour(h)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.infoBlock}>
          <Text style={styles.infoText}>
            Notifications are spread evenly across your active hours. Changing settings will
            reschedule all reminders automatically.
          </Text>
        </View>

        {isSaving && (
          <Animated.View style={[styles.savingBadge, { opacity: fadeAnim }]}>
            <Text style={styles.savingText}>SAVING...</Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  pageLabel: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '300' as const,
    color: Colors.text,
    lineHeight: 44,
    letterSpacing: -0.5,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
    marginBottom: 32,
  },
  proCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  pressed: {
    opacity: 0.7,
  },
  proTitle: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: 4,
  },
  proHint: {
    fontSize: 14,
    color: '#999999',
  },
  proActiveBadge: {
    alignSelf: 'flex-start' as const,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 24,
  },
  proActiveText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.primary,
    letterSpacing: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  settingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 20,
  },
  settingLabel: {
    fontSize: 17,
    fontWeight: '400' as const,
    color: Colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  settingHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  optionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    paddingBottom: 20,
  },
  optionChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  optionChipTextActive: {
    color: Colors.white,
  },
  hoursContainer: {
    paddingBottom: 20,
  },
  hoursLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    marginBottom: 10,
    letterSpacing: 2,
  },
  hoursRow: {
    flexDirection: 'row' as const,
    gap: 6,
  },
  hourChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hourChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  hourChipText: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  hourChipTextActive: {
    color: Colors.white,
  },
  infoBlock: {
    paddingVertical: 24,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  savingBadge: {
    alignSelf: 'flex-start' as const,
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  savingText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 2,
  },
  optionChipLocked: {
    borderStyle: 'dashed' as const,
  },
  optionChipTextLocked: {
    color: Colors.textMuted,
  },
  customChip: {
    borderStyle: 'dashed' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  customFreqRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    width: '100%' as const,
    paddingTop: 8,
  },
  customFreqInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
    minWidth: 70,
    textAlign: 'center' as const,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'Courier, monospace' }),
  },
  customFreqSuffix: {
    fontSize: 13,
    color: Colors.textMuted,
    letterSpacing: 0.3,
    flex: 1,
  },
  customFreqSaveBtn: {
    backgroundColor: Colors.primary,
    width: 34,
    height: 34,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  customFreqCancelBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    width: 34,
    height: 34,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  customFreqHint: {
    fontSize: 11,
    color: Colors.textMuted,
    letterSpacing: 0.2,
    marginTop: 6,
    width: '100%' as const,
  },
});
