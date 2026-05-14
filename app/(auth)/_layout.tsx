import { Stack } from 'expo-router';
import { colors } from '../../theme/colors';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.minimalist.bgLight },
            }}
        >
            <Stack.Screen name="landing" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="login" />
        </Stack>
    );
}
