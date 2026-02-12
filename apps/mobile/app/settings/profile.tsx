import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, fontSize, spacing, borderRadius } from '../../lib/theme';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Mail, Phone, Lock, Save, ArrowLeft } from 'lucide-react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, profile, refreshUserData } = useAuth();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
        }
        if (user) {
            setEmail(user.email || '');
        }
    }, [profile, user]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Update Profile (Name & Phone) - Use upsert to create if missing
            const updates = {
                id: user.id,
                full_name: fullName,
                phone: phone,
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(updates)
                .select();

            if (profileError) throw profileError;

            // 2. Update Email (if changed)


            // 3. Update Password (if provided)
            if (password) {
                const { error: passwordError } = await supabase.auth.updateUser({ password });
                if (passwordError) throw passwordError;
            }

            // Refresh local state
            await refreshUserData();

            Alert.alert(
                'Sucesso',
                'Perfil atualizado.',
                [{ text: 'OK', onPress: () => router.back() }]
            );

        } catch (error: any) {
            console.error('Error updating profile:', error);
            Alert.alert('Erro', error.message || 'Falha ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Excluir conta',
            'Tem certeza que deseja excluir sua conta? Essa ação é irreversível.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            if (!user) return;

                            // 1. Delete profile data
                            const { error } = await supabase
                                .from('profiles')
                                .delete()
                                .eq('id', user.id);

                            if (error) throw error;

                            // 2. Sign out
                            await supabase.auth.signOut();
                            router.replace('/');
                            Alert.alert('Conta excluída', 'Sua conta foi excluída com sucesso.');
                        } catch (error: any) {
                            console.error('Error deleting account:', error);
                            Alert.alert('Erro', 'Não foi possível excluir sua conta. Tente novamente mais tarde.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen
                options={{
                    title: 'Editar Perfil',
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.textPrimary,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                            <ArrowLeft color={colors.textPrimary} size={24} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.formSection}>
                    <Text style={styles.label}>Nome Completo</Text>
                    <View style={styles.inputContainer}>
                        <User size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Seu nome completo"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    <Text style={styles.label}>Telefone</Text>
                    <View style={styles.inputContainer}>
                        <Phone size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Seu telefone"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <Text style={styles.label}>E-mail</Text>
                    <View style={styles.inputContainer}>
                        <Mail size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.inputDisabled]}
                            value={email}
                            editable={false}
                            placeholder="Seu e-mail"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>

                    <Text style={styles.label}>Nova Senha (opcional)</Text>
                    <View style={styles.inputContainer}>
                        <Lock size={20} color={colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Deixe em branco para manter a atual"
                            placeholderTextColor={colors.textMuted}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Salvar Alterações</Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.deleteButton, loading && styles.buttonDisabled]}
                    onPress={handleDeleteAccount}
                    disabled={loading}
                >
                    <Text style={styles.deleteButtonText}>Excluir conta</Text>
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
        padding: spacing.lg,
    },
    formSection: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.lg,
        height: 50,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: fontSize.md,
        height: '100%',
    },
    inputDisabled: {
        color: colors.textMuted,
        opacity: 0.7,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        height: 56,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    deleteButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        backgroundColor: 'transparent',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        fontSize: fontSize.md,
        fontWeight: 'bold',
    },
    deleteButtonText: {
        color: colors.danger,
        fontSize: fontSize.md,
        fontWeight: 'bold',
    },
});
