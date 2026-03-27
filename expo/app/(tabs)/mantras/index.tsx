import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Alert,
  Platform,
  Switch,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Check, ChevronRight, Plus, X, ChevronDown, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMantra, getDateKey } from '@/contexts/MantraContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { requestPermissions } from '@/utils/notifications';
import { MANTRA_CATEGORIES, MantraCategory } from '@/mocks/mantras';
import Colors from '@/constants/colors';

const FREQUENCY_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const PRO_FREQUENCY_OPTIONS = [15, 20, 25, 30];
const MAX_ADDITIONAL_MANTRAS = 3;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MAX_CUSTOM_FREQUENCY = 100;
const UPCOMING_DAYS_COUNT = 7;

function getUpcomingDays(): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 1; i <= UPCOMING_DAYS_COUNT; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatShortDate(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

export default function MantrasScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    settings,
    updateSettings,
    addAdditionalMantra,
    removeAdditionalMantra,
    updateAdditionalMantra,
    setScheduledMantra,
    removeScheduledMantra,
  } = useMantra();
  const { isPro } = useSubscription();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [slotDraft, setSlotDraft] = useState<string>('');
  const [showCustomFreq, setShowCustomFreq] = useState<boolean>(false);
  const [customFreqDraft, setCustomFreqDraft] = useState<string>('');
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [dayDraft, setDayDraft] = useState<string>('');

  const upcomingDays = useMemo(() => getUpcomingDays(), []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleSelectMantra = useCallback(
    (mantra: string, category: MantraCategory) => {
      if (category.isPremium && !isPro) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Premium Mantra',
          'Upgrade to Pro to unlock all premium mantras.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/paywall') },
          ],
        );
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateSettings({ mantra });
      Alert.alert('Mantra Set', `"${mantra}" is now your daily mantra.`);
    },
    [isPro, router, updateSettings],
  );

  const toggleCategory = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCategory((prev) => (prev === id ? null : id));
  }, []);

  const toggleSection = useCallback((section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection((prev) => (prev === section ? null : section));
  }, []);

  const handleAddSlot = useCallback(() => {
    if (!isPro) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Pro Feature',
        'Additional mantras are available for Pro subscribers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
        ],
      );
      return;
    }
    if (settings.additionalMantras.length >= MAX_ADDITIONAL_MANTRAS) {
      Alert.alert('Limit Reached', 'You can have up to 3 additional mantras.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingSlot(settings.additionalMantras.length);
    setSlotDraft('');
  }, [isPro, router, settings.additionalMantras.length]);

  const handleSaveSlot = useCallback(() => {
    if (!slotDraft.trim()) {
      setEditingSlot(null);
      return;
    }
    if (editingSlot !== null && editingSlot >= settings.additionalMantras.length) {
      addAdditionalMantra(slotDraft.trim());
    } else if (editingSlot !== null) {
      updateAdditionalMantra(editingSlot, slotDraft.trim());
    }
    setEditingSlot(null);
    setSlotDraft('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [slotDraft, editingSlot, settings.additionalMantras.length, addAdditionalMantra, updateAdditionalMantra]);

  const handleRemoveSlot = useCallback(
    (index: number) => {
      Alert.alert('Remove Mantra', 'Remove this additional mantra?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeAdditionalMantra(index);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]);
    },
    [removeAdditionalMantra],
  );

  const handleEditSlot = useCallback(
    (index: number) => {
      setEditingSlot(index);
      setSlotDraft(settings.additionalMantras[index]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [settings.additionalMantras],
  );

  const handleToggleNotifications = useCallback(
    async (value: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (value && Platform.OS !== 'web') {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Enable notifications in your device settings to receive mantra reminders.',
          );
          return;
        }
      }
      updateSettings({ notificationsEnabled: value });
    },
    [updateSettings],
  );

  const handleEditDay = useCallback(
    (dateKey: string) => {
      if (!isPro) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Pro Feature',
          'Schedule mantras for upcoming days with Pro.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/paywall') },
          ],
        );
        return;
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setEditingDay(dateKey);
      setDayDraft(settings.scheduledMantras[dateKey] ?? '');
    },
    [isPro, router, settings.scheduledMantras],
  );

  const handleSaveDay = useCallback(() => {
    if (editingDay) {
      setScheduledMantra(editingDay, dayDraft.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setEditingDay(null);
    setDayDraft('');
  }, [editingDay, dayDraft, setScheduledMantra]);

  const handleRemoveDay = useCallback(
    (dateKey: string) => {
      removeScheduledMantra(dateKey);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [removeScheduledMantra],
  );

  const formatHour = (h: number): string => {
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };

  const allFrequencies = isPro
    ? [...FREQUENCY_OPTIONS, ...PRO_FREQUENCY_OPTIONS]
    : FREQUENCY_OPTIONS;

  const windowMinutes = Math.max(0, (settings.endHour - settings.startHour) * 60);
  const maxCustom = Math.min(MAX_CUSTOM_FREQUENCY, windowMinutes);
  const isCustomValue = !allFrequencies.includes(settings.timesPerDay);

  const handleCustomFreqOpen = useCallback(() => {
    if (!isPro) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.pageLabel}>MANTRAS</Text>
          <Text style={styles.title}>Your mantras{'\n'}& schedule.</Text>

          {/* UPCOMING DAYS */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Calendar size={14} color={Colors.textMuted} />
              <Text style={styles.sectionTitle}>UPCOMING DAYS</Text>
              {!isPro && (
                <View style={styles.proBadgeSmall}>
                  <Lock size={9} color={Colors.textMuted} />
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={styles.sectionSubtitle}>
              {isPro
                ? 'Set a unique mantra for each upcoming day.'
                : 'Upgrade to schedule different mantras for upcoming days. Otherwise, today\'s mantra repeats.'}
            </Text>

            {upcomingDays.map((d) => {
              const key = getDateKey(d);
              const scheduled = settings.scheduledMantras[key];
              const isEditingThis = editingDay === key;

              return (
                <View key={key} style={styles.dayCard}>
                  <View style={styles.dayCardHeader}>
                    <Text style={styles.dayCardDate}>{formatShortDate(d)}</Text>
                    {scheduled && !isEditingThis && (
                      <View style={styles.dayCardActions}>
                        <Pressable onPress={() => handleEditDay(key)} hitSlop={8}>
                          <Text style={styles.dayCardAction}>EDIT</Text>
                        </Pressable>
                        <Pressable onPress={() => handleRemoveDay(key)} hitSlop={8}>
                          <X size={13} color={Colors.textMuted} />
                        </Pressable>
                      </View>
                    )}
                  </View>

                  {isEditingThis ? (
                    <View style={styles.dayEditRow}>
                      <TextInput
                        style={styles.dayInput}
                        value={dayDraft}
                        onChangeText={setDayDraft}
                        placeholder="Type a mantra for this day..."
                        placeholderTextColor={Colors.textMuted}
                        multiline
                        maxLength={200}
                        autoFocus
                      />
                      <View style={styles.dayEditActions}>
                        <Pressable style={styles.dayEditSave} onPress={handleSaveDay}>
                          <Check size={13} color={Colors.white} />
                        </Pressable>
                        <Pressable
                          style={styles.dayEditCancel}
                          onPress={() => setEditingDay(null)}
                        >
                          <X size={13} color={Colors.textMuted} />
                        </Pressable>
                      </View>
                    </View>
                  ) : scheduled ? (
                    <Text style={styles.dayMantra} numberOfLines={2}>{scheduled}</Text>
                  ) : (
                    <Pressable onPress={() => handleEditDay(key)}>
                      <Text style={styles.dayPlaceholder}>
                        {isPro ? 'Tap to set' : 'Repeats today\'s mantra'}
                      </Text>
                    </Pressable>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.dividerThick} />

          {/* ACTIVE MANTRAS */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>ACTIVE MANTRAS</Text>

            <View style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <Text style={styles.slotIndex}>01</Text>
                <Text style={styles.slotLabel}>PRIMARY</Text>
              </View>
              <Text style={styles.slotMantra} numberOfLines={2}>
                {settings.mantra || 'Not set — tap on home to set'}
              </Text>
            </View>

            {settings.additionalMantras.map((m, i) => (
              <View key={i} style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <Text style={styles.slotIndex}>{String(i + 2).padStart(2, '0')}</Text>
                  <Text style={styles.slotLabel}>ADDITIONAL</Text>
                  <View style={styles.slotActions}>
                    <Pressable onPress={() => handleEditSlot(i)} hitSlop={8}>
                      <Text style={styles.slotActionText}>EDIT</Text>
                    </Pressable>
                    <Pressable onPress={() => handleRemoveSlot(i)} hitSlop={8}>
                      <X size={14} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                </View>
                {editingSlot === i ? (
                  <View style={styles.slotEditRow}>
                    <TextInput
                      style={styles.slotInput}
                      value={slotDraft}
                      onChangeText={setSlotDraft}
                      placeholder="Type your mantra..."
                      placeholderTextColor={Colors.textMuted}
                      multiline
                      maxLength={200}
                      autoFocus
                    />
                    <Pressable style={styles.slotSaveBtn} onPress={handleSaveSlot}>
                      <Check size={14} color={Colors.white} />
                    </Pressable>
                  </View>
                ) : (
                  <Text style={styles.slotMantra} numberOfLines={2}>{m}</Text>
                )}
              </View>
            ))}

            {editingSlot !== null && editingSlot >= settings.additionalMantras.length && (
              <View style={styles.slotCard}>
                <View style={styles.slotHeader}>
                  <Text style={styles.slotIndex}>
                    {String(settings.additionalMantras.length + 2).padStart(2, '0')}
                  </Text>
                  <Text style={styles.slotLabel}>NEW</Text>
                </View>
                <View style={styles.slotEditRow}>
                  <TextInput
                    style={styles.slotInput}
                    value={slotDraft}
                    onChangeText={setSlotDraft}
                    placeholder="Type your mantra..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    maxLength={200}
                    autoFocus
                  />
                  <View style={styles.slotEditActions}>
                    <Pressable style={styles.slotSaveBtn} onPress={handleSaveSlot}>
                      <Check size={14} color={Colors.white} />
                    </Pressable>
                    <Pressable
                      style={styles.slotCancelBtn}
                      onPress={() => setEditingSlot(null)}
                    >
                      <X size={14} color={Colors.textMuted} />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}

            {settings.additionalMantras.length < MAX_ADDITIONAL_MANTRAS &&
              editingSlot === null && (
                <Pressable
                  style={({ pressed }) => [
                    styles.addSlotBtn,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleAddSlot}
                >
                  <Plus size={14} color={isPro ? Colors.text : Colors.textMuted} />
                  <Text
                    style={[
                      styles.addSlotText,
                      !isPro && styles.addSlotTextLocked,
                    ]}
                  >
                    ADD MANTRA
                  </Text>
                  {!isPro && (
                    <View style={styles.proBadgeSmall}>
                      <Lock size={9} color={Colors.textMuted} />
                      <Text style={styles.proBadgeText}>PRO</Text>
                    </View>
                  )}
                </Pressable>
              )}
          </View>

          <View style={styles.dividerThick} />

          {/* NOTIFICATIONS */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Reminders</Text>
                <Text style={styles.settingHint}>
                  {settings.notificationsEnabled ? 'Active' : 'Paused'}
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: Colors.border, true: Colors.primary }}
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
                <Text style={styles.settingHint}>{settings.timesPerDay}x per day</Text>
              </View>
              <ChevronDown
                size={16}
                color={Colors.textMuted}
                style={expandedSection === 'frequency' ? { transform: [{ rotate: '180deg' }] } : undefined}
              />
            </Pressable>

            {expandedSection === 'frequency' && (
              <View style={styles.optionsGrid}>
                {allFrequencies.map((n) => {
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
                      placeholder={`1–${maxCustom}`}
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
              <ChevronDown
                size={16}
                color={Colors.textMuted}
                style={expandedSection === 'hours' ? { transform: [{ rotate: '180deg' }] } : undefined}
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
          </View>

          <View style={styles.dividerThick} />

          {/* MANTRA COLLECTION */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>MANTRA COLLECTION</Text>
            <Text style={styles.sectionSubtitle}>
              Browse and set your daily affirmation.
            </Text>

            {!isPro && (
              <Pressable
                style={({ pressed }) => [
                  styles.proBanner,
                  pressed && styles.pressed,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/paywall');
                }}
              >
                <Text style={styles.proBannerText}>UNLOCK ALL MANTRAS</Text>
                <ChevronRight size={14} color={Colors.white} />
              </Pressable>
            )}

            {MANTRA_CATEGORIES.map((category) => {
              const isLocked = category.isPremium && !isPro;
              const isExpanded = expandedCategory === category.id;

              return (
                <View key={category.id} style={styles.categoryBlock}>
                  <Pressable
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <View style={styles.categoryLeft}>
                      <Text style={styles.categoryTitle}>{category.title}</Text>
                      <Text style={styles.categoryCount}>
                        {category.mantras.length} mantras
                      </Text>
                    </View>
                    <View style={styles.categoryRight}>
                      {isLocked && (
                        <View style={styles.lockBadge}>
                          <Lock size={9} color={Colors.textMuted} />
                          <Text style={styles.lockText}>PRO</Text>
                        </View>
                      )}
                      <ChevronRight
                        size={14}
                        color={Colors.textMuted}
                        style={isExpanded ? { transform: [{ rotate: '90deg' }] } : undefined}
                      />
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.mantraList}>
                      {category.mantras.map((mantra, idx) => {
                        const isActive = settings.mantra === mantra;
                        return (
                          <Pressable
                            key={idx}
                            style={({ pressed }) => [
                              styles.mantraItem,
                              pressed && styles.mantraItemPressed,
                            ]}
                            onPress={() => handleSelectMantra(mantra, category)}
                          >
                            <Text
                              style={[
                                styles.mantraItemText,
                                isActive && styles.mantraItemTextActive,
                                isLocked && styles.mantraItemTextLocked,
                              ]}
                              numberOfLines={2}
                            >
                              {isLocked ? blurText(mantra) : mantra}
                            </Text>
                            {isActive && !isLocked && (
                              <Check size={14} color={Colors.primary} strokeWidth={2.5} />
                            )}
                            {isLocked && <Lock size={11} color={Colors.textMuted} />}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}

                  <View style={styles.divider} />
                </View>
              );
            })}
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoText}>
              Notifications rotate through your active mantras. Scheduled day mantras override your default for that day.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function blurText(text: string): string {
  const words = text.split(' ');
  return words
    .map((word, i) => (i < 2 ? word : word.replace(/./g, '•')))
    .join(' ');
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
    letterSpacing: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '300' as const,
    color: Colors.text,
    lineHeight: 40,
    letterSpacing: -0.3,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
    marginBottom: 32,
  },
  sectionBlock: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 2.5,
    marginBottom: 0,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  dayCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  dayCardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 6,
  },
  dayCardDate: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  dayCardActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  dayCardAction: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  dayMantra: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text,
    lineHeight: 22,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  dayPlaceholder: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic' as const,
  },
  dayEditRow: {
    gap: 10,
  },
  dayInput: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
    padding: 0,
    minHeight: 36,
  },
  dayEditActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  dayEditSave: {
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dayEditCancel: {
    borderWidth: 1,
    borderColor: Colors.border,
    width: 30,
    height: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  slotCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  slotHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 6,
  },
  slotIndex: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'Courier, monospace' }),
  },
  slotLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    flex: 1,
  },
  slotActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  slotActionText: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  slotMantra: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text,
    lineHeight: 22,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  slotEditRow: {
    gap: 10,
  },
  slotInput: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
    padding: 0,
    minHeight: 36,
  },
  slotEditActions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  slotSaveBtn: {
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  slotCancelBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    width: 30,
    height: 30,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  addSlotBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed' as const,
    marginTop: 2,
  },
  addSlotText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.text,
    letterSpacing: 2,
  },
  addSlotTextLocked: {
    color: Colors.textMuted,
  },
  proBadgeSmall: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  proBadgeText: {
    fontSize: 8,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerThick: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  settingRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  settingHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  optionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    paddingBottom: 16,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  optionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionChipLocked: {
    borderStyle: 'dashed' as const,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  optionChipTextActive: {
    color: Colors.white,
  },
  optionChipTextLocked: {
    color: Colors.textMuted,
  },
  hoursContainer: {
    paddingBottom: 16,
  },
  hoursLabel: {
    fontSize: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hourChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  hourChipText: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  hourChipTextActive: {
    color: Colors.white,
  },
  proBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  proBannerText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  categoryBlock: {
    marginBottom: 0,
  },
  categoryHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 14,
  },
  categoryLeft: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  categoryCount: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  categoryRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  lockBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  lockText: {
    fontSize: 9,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  mantraList: {
    paddingBottom: 8,
  },
  mantraItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 11,
    paddingLeft: 14,
    gap: 12,
  },
  mantraItemPressed: {
    opacity: 0.6,
  },
  mantraItemText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
  },
  mantraItemTextActive: {
    fontWeight: '600' as const,
  },
  mantraItemTextLocked: {
    color: Colors.textMuted,
  },
  infoBlock: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  customChip: {
    borderStyle: 'dashed' as const,
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
