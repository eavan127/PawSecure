// Increased border radius for modern fintech feel
export const radius = {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    full: 9999,
} as const;

// Common border radius usage patterns
export const borderRadius = {
    button: radius.lg,        // 16px
    card: radius.xxl,         // 24px
    input: radius.md,         // 12px
    chip: radius.xl,          // 20px
    badge: radius.sm,         // 8px
    modal: radius.xxl,        // 24px
    avatar: radius.full,      // Full circle
    roleCard: radius.xxxl,    // 32px - Extra large for role selection
} as const;

export type RadiusKey = keyof typeof radius;
