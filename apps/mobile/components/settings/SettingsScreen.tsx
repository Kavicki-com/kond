import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Shield, HelpCircle, FileText, Lock, ChevronRight, LogOut } from 'lucide-react-native';
import { colors, fontSize, spacing, borderRadius } from '../../lib/theme';
import { useAuth } from '../../contexts/AuthContext';
import { TermsModal } from './TermsModal';
import { PrivacyModal } from './PrivacyModal';

export default function SettingsScreen() {
    const router = useRouter();
    const { signOut, user, profile } = useAuth();
    const [termsVisible, setTermsVisible] = useState(false);
    const [privacyVisible, setPrivacyVisible] = useState(false);

    const handleSupport = async () => {
        const email = 'design@kavicki.com';
        const subject = 'Suporte Kond App';
        const url = `mailto:${email}?subject=${encodeURIComponent(subject)}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Erro', 'Não foi possível abrir o aplicativo de e-mail.');
            }
        } catch (error) {
            console.error('Error opening email:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir o e-mail.');
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Sair',
            'Tem certeza que deseja sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Sair',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.name}>{profile?.full_name || 'Usuário'}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conta</Text>

                <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => router.push('/settings/profile')}
                >
                    <View style={styles.menuIcon}>
                        <User size={20} color={colors.primary} />
                    </View>
                    <Text style={styles.menuText}>Editar Perfil</Text>
                    <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sobre</Text>

                <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
                    <View style={styles.menuIcon}>
                        <HelpCircle size={20} color={colors.info} />
                    </View>
                    <Text style={styles.menuText}>Suporte</Text>
                    <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setTermsVisible(true)}>
                    <View style={styles.menuIcon}>
                        <FileText size={20} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.menuText}>Termos de Uso</Text>
                    <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setPrivacyVisible(true)}>
                    <View style={styles.menuIcon}>
                        <Lock size={20} color={colors.textSecondary} />
                    </View>
                    <Text style={styles.menuText}>Política de Privacidade</Text>
                    <ChevronRight size={20} color={colors.textMuted} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
                    <View style={[styles.menuIcon, styles.logoutIcon]}>
                        <LogOut size={20} color={colors.danger} />
                    </View>
                    <Text style={[styles.menuText, styles.logoutText]}>Sair</Text>
                </TouchableOpacity>
            </View>

            <TermsModal visible={termsVisible} onClose={() => setTermsVisible(false)} />
            <PrivacyModal visible={privacyVisible} onClose={() => setPrivacyVisible(false)} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.md,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.lg,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarText: {
        fontSize: fontSize.xl,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    email: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    section: {
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
    },
    sectionTitle: {
        fontSize: fontSize.sm,
        fontWeight: '600',
        color: colors.textMuted,
        marginTop: spacing.md,
        marginLeft: spacing.lg,
        marginBottom: spacing.xs,
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    menuIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuText: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    logoutButton: {
        borderBottomWidth: 0,
    },
    logoutIcon: {
        backgroundColor: 'rgba(225, 112, 85, 0.1)',
    },
    logoutText: {
        color: colors.danger,
    },
});
