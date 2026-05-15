import { Stack } from 'expo-router';
import { Providers } from './_providers';
import { colors } from '../theme/colors';

export default function RootLayout() {
    return (
        <Providers>
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.minimalist.bgLight },
                }}
            >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="complete-profile" options={{ headerShown: false }} />
                <Stack.Screen name="animal-profile" options={{ presentation: 'card' }} />
                <Stack.Screen name="ngo-reports" options={{ presentation: 'card' }} />
                <Stack.Screen name="ngo-report-detail" options={{ presentation: 'card' }} />
                <Stack.Screen name="edit-profile" options={{ presentation: 'card' }} />
                <Stack.Screen name="app-settings" options={{ presentation: 'card' }} />
                <Stack.Screen name="help-support" options={{ presentation: 'card' }} />
            </Stack>
        </Providers>
    );
}
