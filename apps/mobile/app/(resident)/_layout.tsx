import React, { useEffect } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs, useRouter } from 'expo-router';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
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

        // Push notifications are handled via remote push (FCM/APNs) 
        // We don't need a local subscription for packages as it causes duplicates

        // Listen for notification interactions (taps)
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log('🔔 Notification Tapped:', data);
            // Navigate to resident packages screen
            // We use 'replace' to ensure we reload the screen or use a specific param to force refresh if needed
            router.replace('/(resident)');
        });

        return () => {
            // supabase.removeChannel(subscription); // subscription was removed above
            responseListener.remove();
        };
    }, [user, resident]);

    return (
        <Tabs
            tabBar={(props) => (
                <BottomTabBar {...props} insets={{ ...props.insets, bottom: 0 }} />
            )}
            screenOptions={{
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.textPrimary,
                headerTitleStyle: { fontWeight: '600' },
                headerTitleAlign: 'left',
                tabBarLabelPosition: 'below-icon',
                tabBarButton: (props: any) => (
                    <TouchableOpacity
                        {...props}
                        activeOpacity={0.7}
                        style={[props.style, { height: '100%' }]}
                    />
                ),
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    height: Platform.OS === 'ios' ? 95 : 85,
                    borderTopWidth: 1,
                    paddingBottom: 0,
                },
                tabBarItemStyle: {
                    paddingTop: 8,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="(tabs)/index"
                options={{
                    title: 'Encomendas',
                    headerTitle: 'Minhas Encomendas',
                    tabBarIcon: ({ color, size }) => (
                        <View pointerEvents="none">
                            <Package size={28} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="(tabs)/qrcode"
                options={{
                    title: 'Retirar',
                    headerTitle: 'QR Code',
                    tabBarIcon: ({ color, size }) => (
                        <View pointerEvents="none">
                            <QrCode size={28} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Configurações',
                    headerTitle: 'Configurações',
                    tabBarIcon: ({ color, size }) => (
                        <View pointerEvents="none">
                            <Settings size={28} color={color} />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}
