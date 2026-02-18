import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../../contexts/AuthContext';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../../lib/theme';
import { Package, Timer, RefreshCw, KeyRound } from 'lucide-react-native';

const QR_VALIDITY_SECONDS = 300; // 5 minutes

export default function QRCodeScreen() {
    const { resident, profile } = useAuth();
    const [qrData, setQrData] = useState<string>('');
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isGenerated, setIsGenerated] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const generateQR = () => {
        if (!resident) return;

        const expiresAt = Date.now() + QR_VALIDITY_SECONDS * 1000;

        const payload = JSON.stringify({
            unit_id: resident.unit_id,
            resident_id: resident.id,
            profile_id: resident.profile_id,
            exp: expiresAt,
        });

        setQrData(payload);
        setSecondsLeft(QR_VALIDITY_SECONDS);
        setIsGenerated(true);

        // Start countdown
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setIsGenerated(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = secondsLeft / QR_VALIDITY_SECONDS;
    const timerColor = progressPercent > 0.3 ? colors.success : colors.danger;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {isGenerated ? (
                    <>
                        {/* QR Code Display */}
                        <View style={styles.qrContainer}>
                            <View style={styles.qrCard}>
                                <QRCode
                                    value={qrData}
                                    size={220}
                                    backgroundColor={colors.textPrimary}
                                    color={colors.background}
                                />
                            </View>

                            <Text style={styles.nameText}>{profile?.full_name}</Text>

                            {/* Timer */}
                            <View style={styles.timerContainer}>
                                <View style={styles.timerBarBg}>
                                    <View
                                        style={[
                                            styles.timerBar,
                                            {
                                                width: `${progressPercent * 100}%`,
                                                backgroundColor: timerColor,
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.timerRow}>
                                    <Timer size={16} color={timerColor} style={{ marginRight: 6 }} />
                                    <Text style={[styles.timerText, { color: timerColor }]}>
                                        {formatTime(secondsLeft)}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.instructionText}>
                                Mostre este QR Code para o porteiro
                            </Text>
                        </View>

                        {/* Regenerate */}
                        <TouchableOpacity
                            style={styles.regenerateButton}
                            onPress={generateQR}
                            activeOpacity={0.8}
                        >
                            <RefreshCw size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
                            <Text style={styles.regenerateText}>Gerar Novo QR</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {/* Initial State */}
                        <View style={styles.initialContainer}>
                            <View style={styles.iconContainer}>
                                <Package size={48} color={colors.primary} />
                            </View>
                            <Text style={styles.mainTitle}>Retirar Encomenda</Text>
                            <Text style={styles.mainSubtitle}>
                                Gere o QR Code e mostre na portaria para retirar suas encomendas
                            </Text>

                            <TouchableOpacity
                                style={styles.generateButton}
                                onPress={generateQR}
                                activeOpacity={0.8}
                            >
                                <KeyRound size={22} color={colors.textPrimary} style={{ marginRight: 10 }} />
                                <Text style={styles.generateText}>Gerar QR Code</Text>
                            </TouchableOpacity>

                            <Text style={styles.validityNote}>
                                O QR Code é válido por 5 minutos
                            </Text>
                        </View>
                    </>
                )}
            </View>
        </View>
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
    // Initial state
    initialContainer: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.primaryDark,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    mainTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    mainSubtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xxl,
        ...shadows.lg,
    },
    generateText: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    validityNote: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.md,
    },
    // QR generated state
    qrContainer: {
        alignItems: 'center',
    },
    qrCard: {
        backgroundColor: colors.textPrimary,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        ...shadows.md,
    },
    nameText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginTop: spacing.lg,
    },
    timerContainer: {
        width: '100%',
        alignItems: 'center',
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    timerBarBg: {
        width: '80%',
        height: 6,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    timerBar: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
    },
    instructionText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.md,
    },
    regenerateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        marginTop: spacing.xl,
    },
    regenerateText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
});
