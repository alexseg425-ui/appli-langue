// Point d'entrée : onboarding au premier lancement, puis le chemin.
import { Redirect } from 'expo-router';
import { useUserStore } from '../store/userStore';

export default function Index() {
  const onboardingDone = useUserStore((state) => state.onboardingDone);
  return <Redirect href={onboardingDone ? '/(tabs)/path' : '/onboarding/interface-language'} />;
}
