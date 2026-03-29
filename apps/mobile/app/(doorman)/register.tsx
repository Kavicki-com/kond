import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Block, Unit, CarrierSuggestion, VolumeType } from '../../lib/types';
import {
    colors, spacing, borderRadius, fontSize, fontWeight, shadows,
    volumeTypeLabels,
} from '../../lib/theme';
import { sendPushNotification } from '../../lib/notifications';
import {
    Package,
    Mail,
    ShoppingBag,
    Scroll,
    Archive,
    Camera,
    Bell,
    Check,
} from 'lucide-react-native';

const volumeIcons: Record<VolumeType, React.ReactNode> = {
    box_s: <Package size={24} color={colors.primary} />,
    box_m: <Package size={28} color={colors.primary} />,
    box_l: <Package size={32} color={colors.primary} />,
    envelope: <Mail size={24} color={colors.primary} />,
    bag: <ShoppingBag size={24} color={colors.primary} />,
    tube: <Scroll size={24} color={colors.primary} />,
    other: <Archive size={24} color={colors.primary} />,
};

export default function RegisterPackageScreen() {
    const { condominium, user } = useAuth();

    // Form state
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [carriers, setCarriers] = useState<CarrierSuggestion[]>([]);
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [recipientName, setRecipientName] = useState('');
    const [carrier, setCarrier] = useState('');
    const [volumeType, setVolumeType] = useState<VolumeType>('box_m');
    const [trackingCode, setTrackingCode] = useState('');
    const [notes, setNotes] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [unitSearch, setUnitSearch] = useState('');

    useEffect(() => {
        loadCarriers();
    }, []);

    useEffect(() => {
        if (condominium) {
            loadBlocks();
        }
    }, [condominium]);

    useEffect(() => {
        if (selectedBlock) {
            loadUnits(selectedBlock.id);
        }
    }, [selectedBlock]);

    const loadBlocks = async () => {
        if (!condominium) return;
        const { data } = await supabase
            .from('blocks')
            .select('*')
            .eq('condominium_id', condominium.id)
            .order('sort_order');
        setBlocks(data || []);
    };

    const loadUnits = async (blockId: string) => {
        const { data } = await supabase
            .from('units')
            .select('*')
            .eq('block_id', blockId)
            .order('sort_order');
        setUnits(data || []);
        setSelectedUnit(null);
    };

    const loadCarriers = async () => {
        const { data } = await supabase
            .from('carrier_suggestions')
            .select('*')
            .order('sort_order');
        setCarriers(data || []);
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos da câmera para fotografar a encomenda.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsEditing: false,
        });

        if (!result.canceled && result.assets[0]) {
            // Resize image to avoid upload limits (max width 1080px, 70% quality)
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 1080 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            setPhotoUri(manipResult.uri);
        }
    };

    const uploadPhoto = async (): Promise<string | null> => {
        if (!photoUri) return null;

        const fileName = `${Date.now()}.jpg`;
        const filePath = `${condominium?.id}/${fileName}`;

        const response = await fetch(photoUri);
        const blob = await response.blob();
        const arrayBuffer = await new Response(blob).arrayBuffer();

        const { error } = await supabase.storage
            .from('package-photos')
            .upload(filePath, arrayBuffer, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            return null;
        }

        const { data: urlData } = supabase.storage
            .from('package-photos')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    };

    const handleSubmit = async () => {
        if (!selectedUnit) {
            Alert.alert('Atenção', 'Selecione o bloco e a unidade.');
            return;
        }
        if (!carrier.trim()) {
            Alert.alert('Atenção', 'Informe a transportadora.');
            return;
        }

        setLoading(true);
        try {
            // Upload photo first
            const photoUrl = await uploadPhoto();

            // Create package
            const { error } = await supabase
                .from('packages')
                .insert({
                    unit_id: selectedUnit.id,
                    registered_by: user!.id,
                    recipient_name: recipientName.trim() || null,
                    carrier: carrier.trim(),
                    volume_type: volumeType,
                    tracking_code: trackingCode.trim() || null,
                    notes: notes.trim() || null,
                    photo_url: photoUrl,
                    status: 'pending',
                });

            if (error) throw error;

            if (error) throw error;
            
            Alert.alert('✅ Encomenda Registrada!', 'Moradores serão notificados.', [
                {
                    text: 'OK', onPress: () => {
                        // Reset form
                        setSelectedUnit(null);
                        setRecipientName('');
                        setCarrier('');
                        setVolumeType('box_m');
                        setTrackingCode('');
                        setNotes('');
                        setPhotoUri(null);
                        router.push('/(doorman)');
                    }
                },
            ]);
        } catch (error: any) {
            Alert.alert('Erro', error.message || 'Não foi possível registrar a encomenda.');
        } finally {
            setLoading(false);
        }
    };

    const filteredUnits = unitSearch
        ? units.filter((u) => u.number.includes(unitSearch))
        : units;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Block Selection */}
            <Text style={styles.sectionTitle}>1. Bloco</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {blocks.map((block) => (
                    <TouchableOpacity
                        key={block.id}
                        style={[
                            styles.chip,
                            selectedBlock?.id === block.id && styles.chipSelected,
                        ]}
                        onPress={() => setSelectedBlock(block)}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                selectedBlock?.id === block.id && styles.chipTextSelected,
                            ]}
                        >
                            {block.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Unit Selection */}
            {selectedBlock && (
                <>
                    <Text style={styles.sectionTitle}>2. Unidade</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar unidade (ex: 101)"
                        placeholderTextColor={colors.textMuted}
                        value={unitSearch}
                        onChangeText={setUnitSearch}
                        keyboardType="numeric"
                    />
                    <View style={styles.unitsGrid}>
                        {filteredUnits.map((unit) => (
                            <TouchableOpacity
                                key={unit.id}
                                style={[
                                    styles.unitChip,
                                    selectedUnit?.id === unit.id && styles.chipSelected,
                                ]}
                                onPress={() => setSelectedUnit(unit)}
                            >
                                <Text
                                    style={[
                                        styles.unitChipText,
                                        selectedUnit?.id === unit.id && styles.chipTextSelected,
                                    ]}
                                >
                                    {unit.number}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* Recipient Name */}
            <Text style={styles.sectionTitle}>3. Nome no Rótulo (opcional)</Text>
            <TextInput
                style={styles.input}
                placeholder="Nome que aparece na caixa"
                placeholderTextColor={colors.textMuted}
                value={recipientName}
                onChangeText={setRecipientName}
            />

            {/* Carrier */}
            <Text style={styles.sectionTitle}>4. Transportadora</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {carriers.map((c) => (
                    <TouchableOpacity
                        key={c.id}
                        style={[
                            styles.chip,
                            carrier === c.name && styles.chipSelected,
                        ]}
                        onPress={() => setCarrier(c.name)}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                carrier === c.name && styles.chipTextSelected,
                            ]}
                        >
                            {c.icon} {c.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <TextInput
                style={[styles.input, { marginTop: spacing.sm }]}
                placeholder="Ou digite manualmente..."
                placeholderTextColor={colors.textMuted}
                value={carrier}
                onChangeText={setCarrier}
            />

            {/* Volume Type */}
            <Text style={styles.sectionTitle}>5. Tipo de Volume</Text>
            <View style={styles.volumeGrid}>
                {(Object.keys(volumeTypeLabels) as VolumeType[]).map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[
                            styles.volumeChip,
                            volumeType === type && styles.chipSelected,
                        ]}
                        onPress={() => setVolumeType(type)}
                    >
                        <View style={styles.volumeIconContainer}>
                            {React.cloneElement(volumeIcons[type] as React.ReactElement<{ color: string }>, {
                                color: volumeType === type ? colors.textPrimary : colors.textSecondary
                            })}
                        </View>
                        <Text
                            style={[
                                styles.volumeText,
                                volumeType === type && styles.chipTextSelected,
                            ]}
                        >
                            {volumeTypeLabels[type]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tracking Code */}
            <Text style={styles.sectionTitle}>6. Rastreio (últimos 4 dígitos)</Text>
            <TextInput
                style={styles.input}
                placeholder="Ex: A1B2"
                placeholderTextColor={colors.textMuted}
                value={trackingCode}
                onChangeText={setTrackingCode}
                maxLength={4}
                autoCapitalize="characters"
            />

            {/* Notes */}
            <Text style={styles.sectionTitle}>7. Observações</Text>
            <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Ex: Caixa amassada, veio aberto..."
                placeholderTextColor={colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
            />

            {/* Photo */}
            <Text style={styles.sectionTitle}>8. Foto da Encomenda</Text>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                ) : (
                    <View style={styles.photoPlaceholder}>
                        <Camera size={42} color={colors.textSecondary} style={{ marginBottom: spacing.sm }} />
                        <Text style={styles.photoText}>Tirar Foto</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
            >
                {loading ? (
                    <ActivityIndicator color={colors.textPrimary} />
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Bell size={24} color={colors.textPrimary} style={{ marginRight: 8 }} />
                        <Text style={styles.submitText}>Registrar e Notificar</Text>
                    </View>
                )}
            </TouchableOpacity>
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
        paddingBottom: spacing.xxl * 2,
    },
    sectionTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    chipScroll: {
        flexGrow: 0,
    },
    chip: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.full,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    chipTextSelected: {
        color: colors.textPrimary,
        fontWeight: fontWeight.semibold,
    },
    searchInput: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    unitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    unitChip: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.sm,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        minWidth: 60,
        alignItems: 'center',
    },
    unitChipText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
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
    volumeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    volumeChip: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        minWidth: 90,
    },
    volumeIconContainer: {
        marginBottom: 8,
    },
    volumeText: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        fontWeight: fontWeight.medium,
    },
    photoButton: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        overflow: 'hidden',
        height: 200,
    },
    photoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    photoPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    submitButton: {
        backgroundColor: colors.success,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        marginTop: spacing.xl,
        ...shadows.md,
    },
    submitDisabled: {
        opacity: 0.7,
    },
    submitText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
});
