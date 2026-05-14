export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    giant: 32,
    mega: 40,
} as const;

// Layout constants - increased for better mobile UX
// Layout constants - increased for better mobile UX
export const layout = {
    screenPadding: spacing.xl,      // 16px
    cardPadding: spacing.lg,        // 12px
    sectionSpacing: spacing.xxxl,   // 24px
    iconSize: 20,
    iconSizeLarge: 24,
    minTouchTarget: 40,             // Minimum touch target size
    headerHeight: 48,
    tabBarHeight: 56,
} as const;

export type SpacingKey = keyof typeof spacing;
