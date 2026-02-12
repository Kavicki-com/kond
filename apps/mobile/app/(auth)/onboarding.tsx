import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import { Key, ClipboardList, ArrowLeft, Tag } from 'lucide-react-native';

type Step = 'code' | 'register';

interface InviteInfo {
    id: string;
    code: string;
    role: string;
    condominium_id: string;
    unit_id: string | null;
}

export default function OnboardingScreen() {
    const { user, signUp, refreshUserData } = useAuth();
    const [step, setStep] = useState<Step>('code');
    const [inviteCode, setInviteCode] = useState('');
    const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 1: Validate the invite code
    const handleValidateCode = async () => {
        if (!inviteCode.trim()) {
            Alert.alert('Atenção', 'Digite o código de convite.');
            return;
        }

        setLoading(true);
        try {
            // Use RPC to validate (works even without auth)
            const { data, error } = await supabase.rpc('validate_invite', {
                invite_code: inviteCode.trim().toUpperCase(),
            });

            if (error || !data?.valid) {
                Alert.alert(
                    'Código inválido',
                    'Verifique o código e tente novamente. O convite pode estar expirado ou já utilizado.'
                );
                return;
            }

            setInviteInfo(data as InviteInfo);

            // If user is already logged in, use the invite directly
            if (user) {
                await handleUseInviteDirectly();
            } else {
                // Go to registration step
                setStep('register');
            }
        } catch (err: any) {
            Alert.alert('Erro', err.message || 'Erro ao validar código.');
        } finally {
            setLoading(false);
        }
    };

    // Helper to redirect based on role
    const redirectBasedOnRole = (role: string) => {
        if (role === 'resident') {
            router.replace('/(resident)');
        } else if (['admin', 'doorman', 'janitor'].includes(role)) {
            router.replace('/(doorman)');
        } else {
            // Fallback
            router.replace('/');
        }
    };

    // Use invite for already logged-in users
    const handleUseInviteDirectly = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('use_invite', {
                invite_code: inviteCode.trim().toUpperCase(),
            });

            if (error) throw error;

            if (data?.error) {
                Alert.alert('Erro', data.error);
                return;
            }

            await refreshUserData();
            // User requested automatic redirect
            if (inviteInfo?.role) {
                redirectBasedOnRole(inviteInfo.role);
            } else {
                router.replace('/');
            }
        } catch (err: any) {
            console.error('Error using invite:', err);
            Alert.alert('Erro', err.message || 'Não foi possível usar o convite.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Register new account and use invite
    const handleRegisterAndUseInvite = async () => {
        if (!fullName.trim()) {
            Alert.alert('Atenção', 'Preencha seu nome completo.');
            return;
        }
        if (!email.trim()) {
            Alert.alert('Atenção', 'Preencha seu email.');
            return;
        }
        if (!password.trim() || password.length < 6) {
            Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            // 1. Register and use invite in a single server-side call
            const { data: result, error: rpcError } = await supabase.rpc('register_with_invite', {
                p_email: email.trim(),
                p_password: password,
                p_full_name: fullName.trim(),
                p_phone: phone.trim() || null,
                p_invite_code: inviteCode.trim().toUpperCase(),
            });

            if (rpcError) {
                console.error('RPC error:', rpcError);
                Alert.alert('Erro', rpcError.message || 'Erro ao criar conta.');
                return;
            }

            if (result?.error) {
                Alert.alert('Erro', result.error);
                return;
            }

            // 2. Now sign in to get a session
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (signInError) {
                Alert.alert('Erro', 'Conta criada, mas erro ao fazer login: ' + signInError.message);
                router.replace('/(auth)/login');
                return;
            }

            await refreshUserData();
            // User requested automatic redirect without manual interaction
            if (inviteInfo?.role) {
                redirectBasedOnRole(inviteInfo.role);
            } else {
                router.replace('/');
            }
        } catch (err: any) {
            console.error('Error in register + invite:', err);
            Alert.alert('Erro', err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'resident': return 'Morador';
            case 'doorman': return 'Porteiro';
            case 'janitor': return 'Zelador';
            case 'admin': return 'Administrador';
            default: return role;
        }
    };

    // === STEP 1: INVITE CODE ===
    if (step === 'code') {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Key size={56} color={colors.primary} style={{ marginBottom: spacing.md }} />
                        <Text style={styles.title}>Código de Convite</Text>
                        <Text style={styles.subtitle}>
                            Insira o código fornecido pelo síndico do seu condomínio
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            style={styles.codeInput}
                            placeholder="Ex: ABC123"
                            placeholderTextColor={colors.textMuted}
                            value={inviteCode}
                            onChangeText={(text) => setInviteCode(text.toUpperCase())}
                            autoCapitalize="characters"
                            maxLength={10}
                            textAlign="center"
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleValidateCode}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.textPrimary} />
                            ) : (
                                <Text style={styles.buttonText}>Validar Código</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {user && (
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => router.back()}
                        >
                            <ArrowLeft size={20} color={colors.textSecondary} style={{ marginRight: spacing.xs }} />
                            <Text style={styles.backText}>Voltar</Text>
                        </TouchableOpacity>
                    )}

                    {/* Always show login option as requested */}
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                            <Text style={styles.footerText}>
                                Já tem conta?{' '}
                                <Text style={styles.footerLink}>Entrar</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    // === STEP 2: REGISTER (only if not logged in) ===
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <ClipboardList size={56} color={colors.primary} style={{ marginBottom: spacing.md }} />
                    <Text style={styles.title}>Seus Dados</Text>
                    <Text style={styles.subtitle}>
                        Preencha seus dados para completar o cadastro
                    </Text>
                    {inviteInfo && (
                        <View style={styles.inviteBadge}>
                            <Text style={styles.inviteBadgeText}>
                                {getRoleLabel(inviteInfo.role)} • Código: {inviteInfo.code}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.form}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nome completo *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="João Silva"
                            placeholderTextColor={colors.textMuted}
                            value={fullName}
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email *</Text>
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
                        <Text style={styles.label}>Senha *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Mínimo 6 caracteres"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Telefone (opcional)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="(11) 99999-9999"
                            placeholderTextColor={colors.textMuted}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegisterAndUseInvite}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.textPrimary} />
                        ) : (
                            <Text style={styles.buttonText}>Criar Conta e Entrar</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setStep('code')}
                >
                    <ArrowLeft size={20} color={colors.textSecondary} style={{ marginRight: spacing.xs }} />
                    <Text style={styles.backText}>Voltar ao código</Text>
                </TouchableOpacity>
            </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
        lineHeight: 22,
    },
    inviteBadge: {
        backgroundColor: colors.primaryDark,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginTop: spacing.md,
    },
    inviteBadgeText: {
        color: colors.primaryLight,
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
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
    codeInput: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        fontSize: fontSize.xxl,
        color: colors.textPrimary,
        letterSpacing: 4,
        fontWeight: fontWeight.bold,
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
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    backText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    footerLink: {
        color: colors.primaryLight,
        fontWeight: fontWeight.semibold,
    },
});
