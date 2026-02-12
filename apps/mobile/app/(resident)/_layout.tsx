import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Package, QrCode } from 'lucide-react-native';
import { colors, fontSize } from '../../lib/theme';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { scheduleLocalNotification } from '../../lib/notifications';
import * as Notifications from 'expo-notifications';

export default function ResidentLayout() {
    const { user, resident } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user || !resident?.unit_id) return;

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
                    height: 86,
                    paddingBottom: 24,
                    paddingTop: 8,
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
        </Tabs>
    );
}
