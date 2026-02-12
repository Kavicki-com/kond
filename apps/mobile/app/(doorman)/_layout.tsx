import { Tabs } from 'expo-router';
import { LayoutDashboard, PackagePlus, Scan, Settings } from 'lucide-react-native';
import { colors, fontSize } from '../../lib/theme';

export default function DoormanLayout() {
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
                name="index"
                options={{
                    title: 'Início',
                    headerTitle: 'Central de encomendas',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="register"
                options={{
                    title: 'Nova Encomenda',
                    tabBarIcon: ({ color, size }) => <PackagePlus size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="scan"
                options={{
                    title: 'Entregar',
                    tabBarIcon: ({ color, size }) => <Scan size={size} color={color} />,
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
