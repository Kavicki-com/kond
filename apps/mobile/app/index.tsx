import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../lib/theme';

export default function Index() {
    const { session, role, loading } = useAuth();

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    // Not authenticated
    if (!session) {
        return <Redirect href="/(auth)/login" />;
    }

    // Route based on role
    if (role === 'admin' || role === 'doorman' || role === 'janitor') {
        return <Redirect href="/(doorman)" />;
    }

    if (role === 'resident') {
        return <Redirect href="/(resident)" />;
    }

    // Authenticated but no role — onboarding
    return <Redirect href="/(auth)/onboarding" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});
