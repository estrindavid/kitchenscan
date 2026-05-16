import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Typography } from '../../components/ui';
import { colors, spacing } from '../../components/ui/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslate = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsTranslate, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.hero, { opacity: heroOpacity }]}>
        <Typography variant="h1" color={colors.primary}>KitchenScan</Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Scan your food. Discover recipes. Cook with confidence.
        </Typography>
      </Animated.View>
      <Animated.View
        style={[
          styles.actions,
          { opacity: buttonsOpacity, transform: [{ translateY: buttonsTranslate }] },
        ]}
      >
        <Button
          label="Get Started"
          onPress={() => router.push('/onboarding/diet')}
          fullWidth
          size="lg"
        />
        <Button
          label="I already have an account"
          variant="ghost"
          onPress={() => {}}
          fullWidth
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    padding: spacing['3xl'],
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  subtitle: { textAlign: 'center' },
  actions: { gap: spacing.sm },
});
