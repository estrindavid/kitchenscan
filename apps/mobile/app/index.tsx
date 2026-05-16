import { Redirect } from 'expo-router';
import { usePrefsStore } from '../stores/prefsStore';

export default function Index() {
  const isOnboarded = usePrefsStore((s) => s.isOnboarded);

  if (!isOnboarded) {
    return <Redirect href="/onboarding/welcome" />;
  }

  return <Redirect href="/(tabs)/pantry" />;
}
