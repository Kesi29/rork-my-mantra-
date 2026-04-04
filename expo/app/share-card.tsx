import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Share,
  Platform,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Share2,
  MessageCircle,
  Copy,
  MoreHorizontal,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ShareCardView } from '@/components/ShareCardView';
import { GradientMesh } from '@/components/GradientMesh';
import { CARD_STYLES, getStyleById } from '@/utils/cardStyles';
import { getPreferredStyle, setPreferredStyle } from '@/utils/arrivalTracker';
import type { CardStyle } from '@/utils/cardStyles';

// ViewShot is used for capturing the card as a PNG.
// Install with: bun add react-native-view-shot
// then rebuild native (npx expo run:ios)
let ViewShot: any = null;
try {
  ViewShot = require('react-native-view-shot').default;
} catch {
  // Package not installed — share falls back to text-only
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// The capture view renders at 360×640 logical units.
// At 3× DPI (modern iPhone) this produces 1080×1920 physical pixels.
const CAPTURE_W = 360;
const CAPTURE_H = 640;

// Preview: maintain 9:16, ~55% of screen width
const PREVIEW_W = Math.round(SCREEN_WIDTH * 0.55);
const PREVIEW_H = Math.round(PREVIEW_W * (16 / 9));

const SHARE_BUTTONS = [
  {
    id: 'stories',
    label: 'Stories',
    Icon: Share2,
    color: 'rgba(255,255,255,0.85)',
  },
  {
    id: 'message',
    label: 'Message',
    Icon: MessageCircle,
    color: 'rgba(255,255,255,0.85)',
  },
  {
    id: 'copy',
    label: 'Copy',
    Icon: Copy,
    color: 'rgba(255,255,255,0.85)',
  },
  {
    id: 'more',
    label: 'More',
    Icon: MoreHorizontal,
    color: 'rgba(255,255,255,0.85)',
  },
] as const;

export default function ShareCardScreen() {
  const insets = useSafeAreaInsets();
  const { mantraText = '', arrivedAt = '' } = useLocalSearchParams<{
    mantraText: string;
    arrivedAt: string;
  }>();
  const captureRef = useRef<any>(null);

  const [selectedStyle, setSelectedStyle] = useState<CardStyle>(() =>
    getStyleById('ember'),
  );
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    getPreferredStyle().then((id) => setSelectedStyle(getStyleById(id)));
  }, []);

  const handleStyleSelect = async (style: CardStyle) => {
    Haptics.selectionAsync();
    setSelectedStyle(style);
    await setPreferredStyle(style.id);
  };

  /** Capture the hidden full-res card → file URI (or null if ViewShot unavailable) */
  const captureCard = async (): Promise<string | null> => {
    if (!ViewShot || !captureRef.current) return null;
    try {
      return await captureRef.current.capture({
        format: 'png',
        quality: 1.0,
        result: 'file',
      });
    } catch (e) {
      console.warn('[ShareCard] Capture failed:', e);
      return null;
    }
  };

  const handleShare = async (
    action: 'stories' | 'message' | 'copy' | 'more',
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSharing(true);

    try {
      const fileUri = await captureCard();

      if (action === 'stories' && fileUri) {
        // Try to open Instagram Stories directly; fall through to share sheet if not installed
        const igUrl = 'instagram-stories://share';
        const canOpen = await Linking.canOpenURL(igUrl).catch(() => false);
        if (canOpen) {
          // Full IG Stories pasteboard integration requires a native module.
          // For now, open the native share sheet so the user can pick IG Stories.
          await Share.share({ url: fileUri, title: mantraText });
        } else {
          await Share.share({ url: fileUri, title: mantraText });
        }
        return;
      }

      if (action === 'copy') {
        // Share just the mantra text; user can copy from the native sheet
        await Share.share({ message: mantraText });
        return;
      }

      // message / more — share image if available, otherwise text
      if (fileUri) {
        await Share.share({ url: fileUri, title: mantraText });
      } else {
        await Share.share({ message: mantraText });
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <ChevronLeft size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Share Card</Text>
        {/* Spacer to balance the back button */}
        <View style={styles.topBarSpacer} />
      </View>

      {/* ── Preview ─────────────────────────────────────────── */}
      <View style={styles.previewArea}>
        <View
          style={[
            styles.previewShadow,
            { width: PREVIEW_W, height: PREVIEW_H },
          ]}
        >
          <ShareCardView
            cardStyle={selectedStyle}
            mantraText={mantraText}
            arrivedAt={arrivedAt}
            width={PREVIEW_W}
            height={PREVIEW_H}
          />
        </View>
      </View>

      {/* ── Style selector ──────────────────────────────────── */}
      <View style={styles.styleSection}>
        <Text style={styles.styleLabel}>STYLE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.styleRow}
        >
          {CARD_STYLES.map((s) => {
            const isSelected = s.id === selectedStyle.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => handleStyleSelect(s)}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <View
                  style={[
                    styles.thumbnailWrapper,
                    isSelected && styles.thumbnailSelected,
                  ]}
                >
                  <GradientMesh cardStyle={s} width={48} height={48} />
                </View>
                <Text
                  style={[
                    styles.thumbnailLabel,
                    isSelected && styles.thumbnailLabelActive,
                  ]}
                >
                  {s.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Share tray ──────────────────────────────────────── */}
      <View style={styles.shareTray}>
        {sharing ? (
          <ActivityIndicator color="rgba(255,255,255,0.7)" />
        ) : (
          SHARE_BUTTONS.map(({ id, label, Icon }) => (
            <Pressable
              key={id}
              style={({ pressed }) => [
                styles.shareButton,
                pressed && styles.pressed,
              ]}
              onPress={() => handleShare(id)}
            >
              <View style={styles.shareIconCircle}>
                <Icon size={20} color="rgba(255,255,255,0.85)" />
              </View>
              <Text style={styles.shareButtonLabel}>{label}</Text>
            </Pressable>
          ))
        )}
      </View>

      {/* ── Hidden full-res capture view ────────────────────── */}
      {/* Positioned to the right of the visible screen — still renders/draws */}
      {ViewShot && (
        <View
          style={{
            position: 'absolute',
            left: SCREEN_WIDTH + 20,
            top: 0,
          }}
          pointerEvents="none"
        >
          <ViewShot ref={captureRef} style={{ width: CAPTURE_W, height: CAPTURE_H }}>
            <ShareCardView
              cardStyle={selectedStyle}
              mantraText={mantraText}
              arrivedAt={arrivedAt}
              width={CAPTURE_W}
              height={CAPTURE_H}
            />
          </ViewShot>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  topBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    minWidth: 64,
  },
  backText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.2,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      web: 'sans-serif',
    }),
  },
  title: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.5,
    textAlign: 'center' as const,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      web: 'sans-serif',
    }),
  },
  topBarSpacer: {
    minWidth: 64,
  },
  pressed: {
    opacity: 0.6,
  },
  previewArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  previewShadow: {
    borderRadius: 4,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  styleSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  styleLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 3,
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      web: 'monospace',
    }),
  },
  styleRow: {
    gap: 12,
    paddingRight: 20,
  },
  thumbnailWrapper: {
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden' as const,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#fff',
  },
  thumbnailLabel: {
    marginTop: 6,
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center' as const,
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      web: 'sans-serif',
    }),
  },
  thumbnailLabelActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  shareTray: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    minHeight: 88,
  },
  shareButton: {
    alignItems: 'center' as const,
    gap: 8,
    flex: 1,
  },
  shareIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  shareButtonLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
    fontFamily: Platform.select({
      ios: 'Helvetica Neue',
      android: 'sans-serif',
      web: 'sans-serif',
    }),
  },
});
