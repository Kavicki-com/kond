import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../../lib/theme';
import { X } from 'lucide-react-native';

interface PrivacyModalProps {
    visible: boolean;
    onClose: () => void;
}

export function PrivacyModal({ visible, onClose }: PrivacyModalProps) {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Política de Privacidade</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.scrollView}>
                        <Text style={styles.text}>
                            Sua privacidade é importante para nós. É política do Kond respeitar a sua privacidade em relação a qualquer informação que possamos coletar no aplicativo Kond.
                            {'\n\n'}
                            Solicitamos informações pessoais, como nome, e-mail e telefone, apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.
                            {'\n\n'}
                            Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
                            {'\n\n'}
                            Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
                        </Text>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        height: '80%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: fontSize.lg,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    closeButton: {
        padding: spacing.xs,
    },
    scrollView: {
        flex: 1,
    },
    text: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
});
