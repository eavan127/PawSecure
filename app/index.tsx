import { Redirect } from 'expo-router';

// Root index redirects to Landing page
export default function Index() {
    return <Redirect href="/(auth)/landing" />;
}
