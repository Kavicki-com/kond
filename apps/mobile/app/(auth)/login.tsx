import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';

export default function LoginScreen() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Atenção', 'Preencha email e senha.');
            return;
        }

        setLoading(true);
        const { error } = await signIn(email.trim(), password);
        setLoading(false);

        if (error) {
            Alert.alert('Erro ao entrar', error.message);
        }
        // Auth context will handle redirect
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Logo / Branding */}
                <View style={styles.header}>
                    <Text style={styles.logo}>📦</Text>
                    <Text style={styles.title}>Kond</Text>
                    <Text style={styles.subtitle}>Gestão de Encomendas</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="seu@email.com"
                            placeholderTextColor={colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Senha</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.textPrimary} />
                        ) : (
                            <Text style={styles.buttonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer links */}
                <View style={styles.footer}>
                    <Link href="/(auth)/register" asChild>
                        <TouchableOpacity>
                            <Text style={styles.footerText}>
                                Não tem conta? <Text style={styles.footerLink}>Criar conta</Text>
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    <Link href="/(auth)/onboarding" asChild>
                        <TouchableOpacity style={styles.inviteLink}>
                            <Text style={styles.footerText}>
                                Tem um código de convite? <Text style={styles.footerLink}>Usar convite</Text>
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logo: {
        fontSize: 64,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: fontSize.hero,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    form: {
        gap: spacing.md,
    },
    inputContainer: {
        gap: spacing.xs,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
        ...shadows.lg,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    footerText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    footerLink: {
        color: colors.primaryLight,
        fontWeight: fontWeight.semibold,
    },
    inviteLink: {
        marginTop: spacing.xs,
    },
});
