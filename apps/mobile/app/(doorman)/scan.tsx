import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Package } from '../../lib/types';
import { router } from 'expo-router';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../lib/theme';

type ScanStep = 'scanning' | 'confirming';

export default function ScanScreen() {
    const { condominium } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [step, setStep] = useState<ScanStep>('scanning');
    const [packages, setPackages] = useState<Package[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [unitInfo, setUnitInfo] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [scanned, setScanned] = useState(false);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);

        try {
            // Parse QR code — expect JSON with unit_id
            let unitId: string;
            try {
                const parsed = JSON.parse(data);
                unitId = parsed.unit_id;
            } catch {
                // Fallback: try as plain unit_id
                unitId = data;
            }

            if (!unitId) {
                Alert.alert('QR inválido', 'Código QR não reconhecido.');
                setScanned(false);
                return;
            }

            // Load pending packages for this unit
            const { data: pkgs, error } = await supabase
                .from('packages')
                .select(`
          *,
          unit:units(
            *,
            block:blocks(*)
          )
        `)
                .eq('unit_id', unitId)
                .eq('status', 'pending')
                .order('registered_at', { ascending: false });

            if (error) throw error;

            if (!pkgs || pkgs.length === 0) {
                Alert.alert('Nenhuma encomenda', 'Não há encomendas pendentes para esta unidade.', [
                    { text: 'OK', onPress: () => setScanned(false) },
                ]);
                return;
            }

            setPackages(pkgs);
            setSelectedIds(new Set(pkgs.map((p) => p.id))); // Select all by default
            setUnitInfo(`${pkgs[0].unit?.block?.name} - ${pkgs[0].unit?.number}`);
            setStep('confirming');
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Falha ao processar QR code.');
            setScanned(false);
        }
    };

    const togglePackage = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const handleConfirmDelivery = async () => {
        if (selectedIds.size === 0) {
            Alert.alert('Atenção', 'Selecione pelo menos uma encomenda.');
            return;
        }

        setLoading(true);
        try {
            const now = new Date().toISOString();
            const { error } = await supabase
                .from('packages')
                .update({
                    status: 'picked_up',
                    picked_up_at: now,
                })
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            Alert.alert(
                '✅ Entrega Confirmada!',
                `${selectedIds.size} encomenda(s) entregue(s).`,
                [{
                    text: 'OK', onPress: () => {
                        resetScan();
                        // Redirect to package list or dashboard
                        // using replace to clear the current stack and go back to main screen
                        router.replace('/(doorman)');
                    }
                }]
            );
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Falha ao confirmar entrega.');
        } finally {
            setLoading(false);
        }
    };

    const resetScan = () => {
        setStep('scanning');
        setPackages([]);
        setSelectedIds(new Set());
        setUnitInfo('');
        setScanned(false);
    };

    if (!permission) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.permissionEmoji}>📷</Text>
                <Text style={styles.permissionTitle}>Permissão de Câmera</Text>
                <Text style={styles.permissionText}>
                    Precisamos da câmera para escanear o QR Code do morador.
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (step === 'scanning') {
        return (
            <View style={styles.container}>
                <CameraView
                    style={styles.camera}
                    barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
                    <View style={styles.scanOverlay}>
                        <View style={styles.scanFrame} />
                        <Text style={styles.scanText}>Aponte para o QR Code do morador</Text>
                    </View>
                </CameraView>
            </View>
        );
    }

    // Confirming step
    return (
        <View style={styles.container}>
            <View style={styles.confirmHeader}>
                <Text style={styles.confirmTitle}>📦 {unitInfo}</Text>
                <Text style={styles.confirmSubtitle}>
                    {selectedIds.size} de {packages.length} selecionada(s)
                </Text>
            </View>

            <FlatList
                data={packages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.confirmCard,
                            selectedIds.has(item.id) && styles.confirmCardSelected,
                        ]}
                        onPress={() => togglePackage(item.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.checkbox}>
                            {selectedIds.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <View style={styles.confirmInfo}>
                            <Text style={styles.confirmCarrier}>{item.carrier || 'Sem remetente'}</Text>
                            <Text style={styles.confirmDate}>
                                Chegou em {new Date(item.registered_at).toLocaleDateString('pt-BR')}
                            </Text>
                            {item.recipient_name && (
                                <Text style={styles.confirmRecipient}>Para: {item.recipient_name}</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                contentContainerStyle={styles.confirmList}
            />

            <View style={styles.confirmFooter}>
                <TouchableOpacity style={styles.cancelButton} onPress={resetScan}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.deliverButton, loading && styles.deliverDisabled]}
                    onPress={handleConfirmDelivery}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textPrimary} />
                    ) : (
                        <Text style={styles.deliverText}>Confirmar Entrega ({selectedIds.size})</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    camera: {
        flex: 1,
    },
    scanOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: colors.primary,
        borderRadius: borderRadius.lg,
        backgroundColor: 'transparent',
    },
    scanText: {
        color: colors.textPrimary,
        fontSize: fontSize.md,
        marginTop: spacing.lg,
        fontWeight: fontWeight.medium,
    },
    permissionEmoji: {
        fontSize: 56,
        marginBottom: spacing.md,
    },
    permissionTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    permissionText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: 22,
    },
    permissionButton: {
        backgroundColor: colors.primary,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        ...shadows.lg,
    },
    permissionButtonText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    confirmHeader: {
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    confirmTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    confirmSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    confirmList: {
        padding: spacing.md,
    },
    confirmCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    confirmCardSelected: {
        borderColor: colors.success,
        backgroundColor: colors.surfaceLight,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: borderRadius.sm,
        borderWidth: 2,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    checkmark: {
        color: colors.success,
        fontSize: 18,
        fontWeight: fontWeight.bold,
    },
    confirmInfo: {
        flex: 1,
    },
    confirmCarrier: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    confirmDate: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: 2,
    },
    confirmRecipient: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
    confirmFooter: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    deliverButton: {
        flex: 2,
        backgroundColor: colors.success,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
        ...shadows.md,
    },
    deliverDisabled: {
        opacity: 0.7,
    },
    deliverText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
});
