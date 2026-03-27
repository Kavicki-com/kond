import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs, useRouter } from 'expo-router';
import { Package, QrCode, Settings } from 'lucide-react-native';
import { colors, fontSize } from '../../lib/theme';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { scheduleLocalNotification, registerForPushNotificationsAsync, savePushToken } from '../../lib/notifications';
import * as Notifications from 'expo-notifications';

export default function ResidentLayout() {
    const { user, resident } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!user || !resident?.unit_id) return;

        // Register and save push token so the backend can send notifications
        // even when the app is closed
        registerForPushNotificationsAsync().then((token) => {
            if (token) savePushToken(user.id, token);
        });

        // Subscribe to NEW packages for this resident's unit
        const subscription = supabase
            .channel('public:packages:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'packages',
                },
                async (payload) => {
                    if (payload.new && payload.new.unit_id === resident.unit_id) {
                        await scheduleLocalNotification(
                            'Nova Encomenda! 📦',
                            'Uma nova encomenda chegou para você.'
                        );
                    }
                }
            )
            .subscribe();

        // Listen for notification interactions (taps)
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log('🔔 Notification Tapped:', data);
            // Navigate to resident packages screen
            // We use 'replace' to ensure we reload the screen or use a specific param to force refresh if needed
            router.replace('/(resident)');
        });

        return () => {
            supabase.removeChannel(subscription);
            responseListener.remove();
        };
    }, [user, resident]);

    return (
        <Tabs
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '600' },
                headerTitleAlign: 'left',
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    ...(Platform.OS === 'android' && {
                        height: 64 + insets.bottom,
                        paddingBottom: insets.bottom + 10,
                        paddingTop: 8,
                    }),
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="(tabs)/index"
                options={{
                    title: 'Encomendas',
                    headerTitle: 'Minhas Encomendas',
                    tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="(tabs)/qrcode"
                options={{
                    title: 'Retirar',
                    headerTitle: 'QR Code',
                    tabBarIcon: ({ color, size }) => <QrCode size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Configurações',
                    headerTitle: 'Configurações',
                    tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
