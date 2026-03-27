import { Platform, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, PackagePlus, Scan, Settings } from 'lucide-react-native';
import { colors, fontSize } from '../../lib/theme';

export default function DoormanLayout() {
    const insets = useSafeAreaInsets();
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
                name="index"
                options={{
                    title: 'Início',
                    headerTitle: 'Central de encomendas',
                    tabBarIcon: ({ color, size }) => (
                        <View pointerEvents="none">
                            <LayoutDashboard size={28} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="register"
                options={{
                    title: 'Nova Encomenda',
                    tabBarIcon: ({ color, size }) => (
                        <View pointerEvents="none">
                            <PackagePlus size={28} color={color} />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Entregar',
                    tabBarIcon: ({ color, size }) => (
                        <View pointerEvents="none">
                            <Scan size={28} color={color} />
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
