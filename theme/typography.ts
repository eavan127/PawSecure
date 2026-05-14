import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Scaling disabled to force standard sizes
export function normalize(size: number) {
    return size;
}

// Typography scale (Dynamically Scaled)
export const typography = {
    // Font sizes (optimized for mobile)
    fontSize: {
        xs: 10,
        sm: 11,   // Reduced from 12
        base: 12, // Reduced from 14
        lg: 14,   // Reduced from 16
        xl: 16,   // Reduced from 18
        xxl: 18,  // Reduced from 20
        xxxl: 20, // Reduced from 22
        huge: 22, // Reduced from 24
        massive: 24, // Reduced from 26
        giant: 26, // Reduced from 28
    },

    // Font weights
    fontWeight: {
        light: '300' as const,
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

// Predefined text styles
export const textStyles = {
    h1: {
        fontSize: typography.fontSize.giant,
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight,
    },
    h2: {
        fontSize: typography.fontSize.massive,
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight,
    },
    h3: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.tight,
    },
    h4: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.normal,
    },
    body: {
        fontSize: 13, // Slightly reduced from base (14)
        fontWeight: typography.fontWeight.regular,
        lineHeight: typography.lineHeight.normal,
    },
    bodyLarge: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.regular,
        lineHeight: typography.lineHeight.normal,
    },
    caption: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        lineHeight: typography.lineHeight.normal,
    },
    small: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        lineHeight: typography.lineHeight.normal,
    },
    button: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.tight,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        lineHeight: typography.lineHeight.normal,
    },
};

// Minimalist serif typography (Playfair Display)
export const serifTextStyles = {
    serifHero: {
        fontSize: typography.fontSize.giant,
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight * typography.fontSize.giant,
    },
    serifHeading: {
        fontSize: typography.fontSize.xxxl,
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.lineHeight.tight * typography.fontSize.xxxl,
    },
    serifSubheading: {
        fontSize: typography.fontSize.xxl,
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.lineHeight.normal * typography.fontSize.xxl,
    },
};

export type TextStyleKey = keyof typeof textStyles;
export type SerifStyleKey = keyof typeof serifTextStyles;
