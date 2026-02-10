// ============================================
// Kond Design Tokens
// ============================================

export const colors = {
    // Primary palette
    primary: '#6c5ce7',
    primaryLight: '#a29bfe',
    primaryDark: '#5a4bd1',

    // Accent
    accent: '#00cec9',
    accentLight: '#81ecec',

    // Semantic
    success: '#00b894',
    warning: '#fdcb6e',
    danger: '#e17055',
    info: '#74b9ff',

    // Neutrals
    background: '#0f0f1a',
    surface: '#1a1a2e',
    surfaceLight: '#252542',
    surfaceElevated: '#2d2d4a',
    border: '#3d3d5c',
    borderLight: '#4a4a6a',

    // Text
    textPrimary: '#ffffff',
    textSecondary: '#b2b2cc',
    textMuted: '#6c6c8a',
    textInverse: '#0f0f1a',

    // Status
    packagePending: '#fdcb6e',
    packagePickedUp: '#00b894',
    packageExpired: '#e17055',
} as const;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
} as const;

export const fontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
    hero: 36,
} as const;

export const fontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#6c5ce7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
};

export const volumeTypeIcons: Record<string, string> = {
    box_s: '📦',
    box_m: '📦',
    box_l: '📦',
    envelope: '✉️',
    bag: '🛍️',
    tube: '📐',
    other: '📋',
};

export const volumeTypeLabels: Record<string, string> = {
    box_s: 'Caixa P',
    box_m: 'Caixa M',
    box_l: 'Caixa G',
    envelope: 'Envelope',
    bag: 'Sacola',
    tube: 'Tubo',
    other: 'Outro',
};
