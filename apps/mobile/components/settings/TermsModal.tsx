import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../../lib/theme';
import { X } from 'lucide-react-native';

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
}

export function TermsModal({ visible, onClose }: TermsModalProps) {
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
                        <Text style={styles.title}>Termos de Uso</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.scrollView}>
                        <Text style={styles.text}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                            {'\n\n'}
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            {'\n\n'}
                            1. Aceitação dos Termos{'\n'}
                            Ao acessar e usar este aplicativo, você aceita e concorda em estar vinculado aos termos e disposições deste acordo.
                            {'\n\n'}
                            2. Modificações{'\n'}
                            Reservamo-nos o direito de modificar estes termos a qualquer momento. Você deve revisar esta página periodicamente.
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
