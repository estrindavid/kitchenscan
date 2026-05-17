import { useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated from 'react-native-reanimated';
import {
  MemphisBackground,
  PantryShelfScene,
  RecipePlateScene,
  ScannerHeroScene,
  usePopInStyle,
} from '../../components/brand';
import { Typography } from '../../components/ui';
import { brandColors, colors, radii, spacing } from '../../components/ui/theme';

const SLIDES = [
  {
    eyebrow: 'Scan the fridge',
    title: 'Turn your kitchen into a living pantry.',
    body: 'Point your phone at ingredients and KitchenScan starts organizing what you already own.',
    cta: 'Next',
    Scene: ScannerHeroScene,
    tone: 'sky' as const,
  },
  {
    eyebrow: 'Know what you have',
    title: 'A pantry that updates before food gets forgotten.',
    body: 'Fresh food, cans, leftovers, and staples become one clean list for the week.',
    cta: 'Next',
    Scene: PantryShelfScene,
    tone: 'peach' as const,
  },
  {
    eyebrow: 'Cook smarter',
    title: 'Recipes built around what is already home.',
    body: 'Get meals that fit your pantry, preferences, and real life without another grocery run.',
    cta: 'Start scanning',
    Scene: RecipePlateScene,
    tone: 'cream' as const,
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const contentStyle = usePopInStyle({ delay: 120 });
  const slideWidth = Math.max(width, 320);
  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setActiveIndex(Math.min(Math.max(nextIndex, 0), SLIDES.length - 1));
  };

  const goToSlide = (index: number) => {
    Haptics.selectionAsync();
    scrollRef.current?.scrollTo({ x: slideWidth * index, animated: true });
    setActiveIndex(index);
  };

  const handlePrimary = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isLastSlide) {
      router.push('/onboarding/diet');
      return;
    }
    goToSlide(activeIndex + 1);
  };

  return (
    <View style={styles.root}>
      <MemphisBackground variant={SLIDES[activeIndex].tone} density="high" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <View style={styles.logoMark}>
            <Ionicons name="restaurant" size={20} color={brandColors.ink} />
          </View>
          <Text style={styles.logoText}>KitchenScan</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip intro"
            onPress={() => router.push('/onboarding/diet')}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          style={styles.carousel}
        >
          {SLIDES.map(({ Scene, title, body, eyebrow }, index) => (
            <View key={title} style={[styles.slide, { width: slideWidth }]}>
              <Scene animated={activeIndex === index} style={styles.scene} />
              <Animated.View style={[styles.copyPanel, contentStyle]}>
                <Text style={styles.eyebrow}>{eyebrow}</Text>
                <Typography variant="h1" color={brandColors.ink} style={styles.title}>
                  {title}
                </Typography>
                <Typography variant="body" color={colors.textSecondary} style={styles.body}>
                  {body}
                </Typography>
              </Animated.View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((slide, index) => (
              <Pressable
                key={slide.title}
                accessibilityRole="button"
                accessibilityLabel={`Go to intro slide ${index + 1}`}
                onPress={() => goToSlide(index)}
                style={[styles.dot, activeIndex === index && styles.dotActive]}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={SLIDES[activeIndex].cta}
            onPress={handlePrimary}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText}>{SLIDES[activeIndex].cta}</Text>
            <Ionicons name={isLastSlide ? 'scan' : 'arrow-forward'} size={20} color={brandColors.white} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brandColors.cream,
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    minHeight: 58,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: brandColors.white,
    borderWidth: 3,
    borderColor: brandColors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    flex: 1,
    color: brandColors.ink,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '800',
  },
  skipButton: {
    minHeight: 38,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    color: brandColors.ink,
    fontSize: 14,
    fontWeight: '700',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    justifyContent: 'center',
  },
  scene: {
    flex: 1,
    minHeight: 310,
    maxHeight: 380,
  },
  copyPanel: {
    backgroundColor: brandColors.white,
    borderWidth: 4,
    borderColor: brandColors.ink,
    borderRadius: radii.md,
    padding: spacing.xl,
    shadowColor: brandColors.ink,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  eyebrow: {
    color: brandColors.sky,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.md,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: brandColors.ink,
    backgroundColor: brandColors.white,
  },
  dotActive: {
    width: 34,
    backgroundColor: brandColors.ink,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radii.md,
    backgroundColor: brandColors.ink,
    borderWidth: 3,
    borderColor: brandColors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  primaryButtonText: {
    color: brandColors.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
  },
});
