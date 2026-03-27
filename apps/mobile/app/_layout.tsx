import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Slot, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(resident)" />
                    <Stack.Screen name="(doorman)" />
                    <Stack.Screen
                        name="settings/profile"
                        options={{
                            presentation: 'card',
                            headerShown: true,
                        }}
                    />
                </Stack>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
