import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package } from '../../lib/types';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';
import {
    Package as PackageIcon,
    Inbox,
    AlertTriangle,
    PackagePlus,
    Scan,
    Sparkles,
    LogOut
} from 'lucide-react-native';

export default function DoormanDashboard() {
    const { condominium, profile, signOut } = useAuth();
    const [pendingPackages, setPendingPackages] = useState<Package[]>([]);
    const [stats, setStats] = useState({ pending: 0, today: 0, overdue: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!condominium) return;

        try {
            // Get all pending packages for this condominium
            const { data: packages } = await supabase
                .from('packages')
                .select(`
          *,
          unit:units(
            *,
            block:blocks!inner(*)
          )
        `)
                .eq('status', 'pending')
                .eq('unit.block.condominium_id', condominium.id)
                .order('registered_at', { ascending: false });

            const pkgs = packages || [];
            setPendingPackages(pkgs);

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            setStats({
                pending: pkgs.length,
                today: pkgs.filter((p) => new Date(p.registered_at) >= todayStart).length,
                overdue: pkgs.filter((p) => new Date(p.registered_at) <= sevenDaysAgo).length,
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [condominium?.id])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleLogout = async () => {
        router.replace('/(auth)/login');
        await signOut();
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `há ${diffDays}d`;
        if (diffHours > 0) return `há ${diffHours}h`;
        return 'agora';
    };

    const StatCard = ({ label, value, color: cardColor, icon }: {
        label: string; value: number; color: string; icon: React.ReactNode;
    }) => (
        <View style={[styles.statCard, { borderLeftColor: cardColor }]}>
            <View style={{ marginBottom: spacing.xs }}>
                {icon}
            </View>
            <Text style={[styles.statValue, { color: cardColor }]}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    const renderPackage = ({ item }: { item: Package }) => (
        <View style={styles.packageCard}>
            <View style={styles.packageHeader}>
                <Text style={styles.packageCarrier}>{item.carrier || 'Sem remetente'}</Text>
                <Text style={styles.packageTime}>{formatTime(item.registered_at)}</Text>
            </View>
            <Text style={styles.packageUnit}>
                {item.unit?.block?.name} - {item.unit?.number}
            </Text>
            {item.recipient_name && (
                <Text style={styles.packageRecipient}>Para: {item.recipient_name}</Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={pendingPackages}
                keyExtractor={(item) => item.id}
                renderItem={renderPackage}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListHeaderComponent={
                    <View>
                        {/* Welcome */}
                        {/* Welcome */}
                        <View style={styles.welcomeRow}>
                            <View>
                                <Text style={styles.welcomeText}>
                                    Olá, {profile?.full_name?.split(' ')[0] || 'Porteiro'}
                                </Text>
                                <Text style={styles.condoName}>{condominium?.name}</Text>
                            </View>
                            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                                <LogOut size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                                <Text style={styles.logoutText}>Sair</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <StatCard
                                label="Pendentes"
                                value={stats.pending}
                                color={colors.packagePending}
                                icon={<PackageIcon size={24} color={colors.packagePending} />}
                            />
                            <StatCard
                                label="Hoje"
                                value={stats.today}
                                color={colors.info}
                                icon={<Inbox size={24} color={colors.info} />}
                            />
                            <StatCard
                                label="Atrasadas"
                                value={stats.overdue}
                                color={colors.danger}
                                icon={<AlertTriangle size={24} color={colors.danger} />}
                            />
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                                onPress={() => router.push('/(doorman)/register')}
                                activeOpacity={0.8}
                            >
                                <PackagePlus size={32} color={colors.textPrimary} style={{ marginBottom: spacing.xs }} />
                                <Text style={styles.actionText}>Nova Encomenda</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.accent }]}
                                onPress={() => router.push('/(doorman)/scan')}
                                activeOpacity={0.8}
                            >
                                <Scan size={32} color={colors.textPrimary} style={{ marginBottom: spacing.xs }} />
                                <Text style={styles.actionText}>Escanear QR</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Section header */}
                        <Text style={styles.sectionTitle}>Encomendas Pendentes</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Sparkles size={48} color={colors.primaryLight} style={{ marginBottom: spacing.md }} />
                        <Text style={styles.emptyText}>Nenhuma encomenda pendente</Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    welcomeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    welcomeText: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    condoName: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    logoutBtn: {
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.sm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderLeftWidth: 3,
        alignItems: 'center',
        ...shadows.sm,
    },
    statEmoji: {
        fontSize: 20,
        marginBottom: spacing.xs,
    },
    statValue: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    actionButton: {
        flex: 1,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        ...shadows.md,
    },
    actionEmoji: {
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    actionText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    packageCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: colors.packagePending,
        ...shadows.sm,
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    packageCarrier: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    packageTime: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
    },
    packageUnit: {
        fontSize: fontSize.sm,
        color: colors.primaryLight,
        fontWeight: fontWeight.medium,
    },
    packageRecipient: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginTop: 2,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
});
