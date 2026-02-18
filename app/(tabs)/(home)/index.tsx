import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pencil, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useMantra, getMantraForDate, getDateKey } from '@/contexts/MantraContext';
import { getMantraImage } from '@/utils/mantraImages';
import Colors from '@/constants/colors';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = Math.min(110, SCREEN_WIDTH * 0.26);

function getWeekDays(today: Date): Date[] {
  const dayOfWeek = today.getDay();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - dayOfWeek);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    days.push(d);
  }
  return days;
}

const FALLBACK_IMAGE = { uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/iwvag21z5m37l2hbo3qfk' };

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useMantra();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [draft, setDraft] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const calendarAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getDateKey(today), [today]);
  const weekDays = useMemo(() => getWeekDays(today), [today]);
  const selectedKey = useMemo(() => getDateKey(selectedDate), [selectedDate]);
  const isToday = selectedKey === todayKey;

  const displayMantra = useMemo(
    () => getMantraForDate(settings, selectedDate),
    [settings, selectedDate],
  );
  const imageSource = useMemo(() => {
    try {
      const img = getMantraImage(displayMantra);
      console.log('[HomeScreen] imageSource resolved for mantra:', displayMantra, '→', img);
      if (!img) {
        console.warn('[HomeScreen] getMantraImage returned falsy, using fallback');
        return FALLBACK_IMAGE;
      }
      return img;
    } catch (e) {
      console.warn('[HomeScreen] Error getting mantra image, using fallback', e);
      return FALLBACK_IMAGE;
    }
  }, [displayMantra]);

  useEffect(() => {
    setImageError(false);
  }, [displayMantra]);

  const actualImageSource = imageError ? FALLBACK_IMAGE : imageSource;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, imageAnim]);

  const handleEdit = () => {
    setDraft(displayMantra);
    setIsEditing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (isToday) {
      updateSettings({ mantra: trimmed });
    }
    setIsEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleCalendar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = calendarOpen ? 0 : 1;
    setCalendarOpen(!calendarOpen);
    Animated.timing(calendarAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handleDayPress = (date: Date) => {
    Haptics.selectionAsync();
    setSelectedDate(date);
    setIsEditing(false);
  };

  const hasMantra = displayMantra.trim().length > 0;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.topBar}>
              <Text style={styles.appName}>MY MĀNTRA</Text>
              <Pressable onPress={toggleCalendar} hitSlop={12} testID="toggle-calendar">
                <Text style={styles.todayLabel}>
                  {isToday ? 'TODAY' : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                  {calendarOpen ? ' ▲' : ' ▼'}
                </Text>
              </Pressable>
            </View>

            <Animated.View
              style={[
                styles.daySelector,
                {
                  maxHeight: calendarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 50],
                  }),
                  opacity: calendarAnim,
                  marginBottom: calendarAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 32],
                  }),
                },
              ]}
            >
              {weekDays.map((d, i) => {
                const key = getDateKey(d);
                const isSelected = key === selectedKey;
                const isDayToday = key === todayKey;
                return (
                  <Pressable
                    key={key}
                    style={styles.dayItem}
                    onPress={() => handleDayPress(d)}
                    testID={`day-${DAY_LABELS[i]}`}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextActive,
                        !isSelected && isDayToday && styles.dayTextToday,
                      ]}
                    >
                      {DAY_LABELS[i]}
                    </Text>
                    {isSelected && <View style={styles.dayUnderline} />}
                  </Pressable>
                );
              })}
            </Animated.View>

            {!isEditing && (
              <View style={styles.imageRow}>
                <Animated.View
                  style={[
                    styles.imageContainer,
                    {
                      opacity: imageAnim,
                      transform: [
                        {
                          scale: imageAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Image
                    source={actualImageSource}
                    style={[
                      styles.mantraImage,
                      Platform.OS === 'web'
                        ? ({ filter: 'grayscale(100%) contrast(1.3) brightness(0.95)' } as any)
                        : { opacity: 0.85 },
                    ]}
                    resizeMode="cover"
                    onError={() => {
                      console.warn('[HomeScreen] Image failed to load, switching to fallback');
                      setImageError(true);
                    }}
                    testID="mantra-image"
                  />
                  {Platform.OS !== 'web' && <View style={styles.bwOverlay} />}
                  <View style={styles.contrastOverlay} />
                  <Image
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Noise_salt_and_pepper.png/220px-Noise_salt_and_pepper.png' }}
                    style={styles.grainImage}
                    resizeMode="cover"
                  />
                  <View style={styles.grainTintOverlay} />
                </Animated.View>
              </View>
            )}

            {isEditing && <View style={styles.imageRowPlaceholder} />}

            <View style={styles.mantraSection}>
              <Text style={styles.sectionLabel}>YOUR DAILY MANTRA</Text>

              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    ref={inputRef}
                    style={styles.mantraInput}
                    value={draft}
                    onChangeText={setDraft}
                    placeholder="I am at peace with myself..."
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    maxLength={200}
                    testID="mantra-input"
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.saveBtn,
                      pressed && styles.btnPressed,
                    ]}
                    onPress={handleSave}
                    testID="save-mantra-btn"
                  >
                    <Check size={14} color={Colors.white} />
                    <Text style={styles.saveBtnText}>SAVE</Text>
                  </Pressable>
                </View>
              ) : hasMantra ? (
                <Pressable onPress={isToday ? handleEdit : undefined} testID="edit-mantra-btn">
                  <Text style={styles.mantraText}>{displayMantra}</Text>
                </Pressable>
              ) : (
                <Pressable onPress={isToday ? handleEdit : undefined} testID="edit-mantra-btn">
                  <Text style={styles.placeholderText}>
                    Tap to set your{'\n'}daily mantra.
                  </Text>
                  <Text style={styles.placeholderHint}>
                    Choose words that ground you.
                  </Text>
                </Pressable>
              )}
            </View>

            {hasMantra && !isEditing && isToday && (
              <Animated.View style={[styles.editRow, { opacity: fadeAnim }]}>
                <Pressable
                  style={({ pressed }) => [
                    styles.editBtn,
                    pressed && styles.btnPressed,
                  ]}
                  onPress={handleEdit}
                >
                  <Pencil size={12} color={Colors.textMuted} />
                  <Text style={styles.editBtnText}>EDIT</Text>
                </Pressable>
              </Animated.View>
            )}

            {!isToday && !hasMantra && (
              <View style={styles.futureHint}>
                <Text style={styles.futureHintText}>
                  No mantra scheduled. Your current mantra will repeat.
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  appName: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.text,
    letterSpacing: 3.5,
  },
  todayLabel: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  daySelector: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    paddingHorizontal: 0,
    overflow: 'hidden' as const,
  },
  dayItem: {
    alignItems: 'center' as const,
    paddingVertical: 4,
    minWidth: 32,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  dayTextActive: {
    color: Colors.text,
    fontWeight: '500' as const,
  },
  dayTextToday: {
    color: Colors.textSecondary,
  },
  dayUnderline: {
    width: 16,
    height: 1.5,
    backgroundColor: Colors.text,
    marginTop: 6,
  },
  imageRow: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    alignItems: 'flex-end' as const,
    marginBottom: 36,
    paddingRight: 8,
  },
  imageRowPlaceholder: {
    height: 48,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    overflow: 'hidden' as const,
    backgroundColor: '#888',
  },
  mantraImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  bwOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgb(55,55,55)',
    opacity: 0.55,
  },
  contrastOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  grainImage: {
    ...StyleSheet.absoluteFillObject,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    opacity: 0.15,
  },
  grainTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(55,55,55,0.12)',
  },
  mantraSection: {
    marginBottom: 28,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    letterSpacing: 3.5,
    marginBottom: 20,
  },
  mantraText: {
    fontSize: 30,
    fontWeight: '300' as const,
    color: Colors.text,
    lineHeight: 42,
    letterSpacing: -0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  placeholderText: {
    fontSize: 30,
    fontWeight: '300' as const,
    color: Colors.textMuted,
    lineHeight: 42,
    letterSpacing: -0.2,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  placeholderHint: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 16,
    letterSpacing: 0.2,
  },
  editContainer: {
    gap: 20,
  },
  mantraInput: {
    fontSize: 28,
    fontWeight: '300' as const,
    color: Colors.text,
    lineHeight: 40,
    letterSpacing: -0.3,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
    padding: 0,
    minHeight: 100,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  saveBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    alignSelf: 'flex-start' as const,
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.white,
    letterSpacing: 2,
  },
  editRow: {
    marginBottom: 24,
  },
  editBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingVertical: 8,
    alignSelf: 'flex-start' as const,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  btnPressed: {
    opacity: 0.6,
  },
  futureHint: {
    marginTop: 8,
  },
  futureHintText: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 21,
    letterSpacing: 0.2,
  },
});
