import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Package } from '../../../lib/types';
import {
    colors, spacing, borderRadius, fontSize, fontWeight, shadows,
} from '../../../lib/theme';
import {
    Package as PackageIcon,
    Inbox,
    CheckCircle,
    Clock,
    Sparkles,
    History,
    LogOut,
    Box,
    Mail,
    ShoppingBag,
    FileText,
    Cylinder
} from 'lucide-react-native';

type Tab = 'pending' | 'history';

export default function ResidentPackagesScreen() {
    const { resident, profile, signOut } = useAuth();
    const [tab, setTab] = useState<Tab>('pending');
    const [pendingPackages, setPendingPackages] = useState<Package[]>([]);
    const [historyPackages, setHistoryPackages] = useState<Package[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        if (!resident) return;

        try {
            // Pending
            const { data: pending } = await supabase
                .from('packages')
                .select('*')
                .eq('unit_id', resident.unit_id)
                .eq('status', 'pending')
                .order('registered_at', { ascending: false });

            setPendingPackages(pending || []);

            // History
            const { data: history } = await supabase
                .from('packages')
                .select('*')
                .eq('unit_id', resident.unit_id)
                .eq('status', 'picked_up')
                .order('picked_up_at', { ascending: false })
                .limit(50);

            setHistoryPackages(history || []);
        } catch (error) {
            console.error('Error loading packages:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();

            // Realtime subscription to update list automatically
            if (!resident?.unit_id) return;

            const subscription = supabase
                .channel('resident-packages-list')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'packages',
                    },
                    (payload) => {
                        if (payload.new && payload.new.unit_id === resident.unit_id) {
                            loadData();
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }, [resident?.unit_id])
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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatRelative = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
        if (diffHours > 0) return `há ${diffHours}h`;
        return 'agora mesmo';
    };

    const data = tab === 'pending' ? pendingPackages : historyPackages;

    const VolumeIcon = ({ type, size = 24, color = colors.textPrimary }: { type: string, size?: number, color?: string }) => {
        switch (type) {
            case 'envelope': return <Mail size={size} color={color} />;
            case 'bag': return <ShoppingBag size={size} color={color} />;
            case 'tube': return <Cylinder size={size} color={color} />;
            case 'other': return <FileText size={size} color={color} />;
            default: return <Box size={size} color={color} />;
        }
    };

    const renderPackage = ({ item }: { item: Package }) => (
        <View style={[
            styles.card,
            tab === 'pending' && styles.cardPending,
            tab === 'history' && styles.cardHistory,
        ]}>
            <View style={styles.cardRow}>
                {item.photo_url ? (
                    <Image
                        source={{ uri: item.photo_url }}
                        style={styles.thumbnail}
                        onError={(e) => console.log('Image Load Error:', e.nativeEvent.error, item.photo_url)}
                    />
                ) : (
                    <View style={styles.thumbnailPlaceholder}>
                        <VolumeIcon type={item.volume_type} size={28} color={colors.textSecondary} />
                    </View>
                )}

                <View style={styles.cardInfo}>
                    <Text style={styles.cardCarrier}>{item.carrier || 'Encomenda'}</Text>

                    {tab === 'pending' ? (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} color={colors.textSecondary} />
                                <Text style={styles.cardDate}>{formatRelative(item.registered_at)}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>Na Portaria</Text>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} color={colors.textSecondary} />
                                <Text style={styles.cardDate}>
                                    {formatDate(item.registered_at)}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={12} color={colors.textSecondary} />
                                <Text style={styles.cardDate}>
                                    Retirado {formatDate(item.picked_up_at!)}
                                </Text>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Welcome */}
            <View style={styles.welcomeRow}>
                <Text style={styles.welcomeText}>
                    Olá, {profile?.full_name?.split(' ')[0] || 'Morador'}
                </Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.logoutText}>Sair</Text>
                </TouchableOpacity>
            </View>

            {/* Pending count */}
            {pendingPackages.length > 0 && (
                <View style={styles.pendingBanner}>
                    <Text style={styles.pendingCount}>{pendingPackages.length}</Text>
                    <Text style={styles.pendingLabel}>
                        encomenda{pendingPackages.length > 1 ? 's' : ''} na portaria
                    </Text>
                </View>
            )}

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'pending' && styles.tabActive]}
                    onPress={() => setTab('pending')}
                >
                    <Text style={[styles.tabText, tab === 'pending' && styles.tabTextActive]}>
                        Aguardando ({pendingPackages.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'history' && styles.tabActive]}
                    onPress={() => setTab('history')}
                >
                    <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
                        Histórico
                    </Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderPackage}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {tab === 'pending' ? (
                            <Sparkles size={48} color={colors.primaryLight} style={{ marginBottom: spacing.md }} />
                        ) : (
                            <History size={48} color={colors.textSecondary} style={{ marginBottom: spacing.md }} />
                        )}
                        <Text style={styles.emptyText}>
                            {tab === 'pending'
                                ? 'Nenhuma encomenda pendente'
                                : 'Nenhuma encomenda retirada'}
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    welcomeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
    },
    welcomeText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
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
    pendingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        gap: spacing.sm,
        ...shadows.lg,
    },
    pendingCount: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    pendingLabel: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
        fontWeight: fontWeight.medium,
    },
    tabRow: {
        flexDirection: 'row',
        marginHorizontal: spacing.md,
        marginTop: spacing.lg,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.xs,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: borderRadius.sm,
    },
    tabActive: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    tabTextActive: {
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderLeftWidth: 3,
        ...shadows.sm,
    },
    cardPending: {
        borderLeftColor: colors.packagePending,
    },
    cardHistory: {
        borderLeftColor: colors.packagePickedUp,
    },
    cardRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.sm,
    },
    thumbnailPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailEmoji: {
        fontSize: 28,
    },
    cardInfo: {
        flex: 1,
        gap: 2,
    },
    cardCarrier: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    cardDate: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.packagePending + '30',
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        marginTop: 4,
    },
    statusText: {
        fontSize: fontSize.xs,
        color: colors.packagePending,
        fontWeight: fontWeight.semibold,
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
