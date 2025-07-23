import { useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isSignedIn } = useUser();

  if (isSignedIn) return <Redirect href="/(root)/dashboard" />;

  if (!!isSignedIn) return <Redirect href="/(root)/(auth)/login" />;
}
