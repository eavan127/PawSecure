// Fintech-style Dark Theme Color Palette
export const colors = {
  // Base colors - Deep charcoal and dark green
  background: '#065645',        // Dark green from HTML
  backgroundAlt: '#05483A',     // Slightly darker
  surface: '#FFFFFF',           // White cards
  surfaceAlt: '#F9FBF9',        // Light background from HTML
  surfaceDark: '#0B3B2D',       // Dark green surface for dark mode equivalents

  // Glassmorphism overlays
  glassLight: 'rgba(26, 47, 42, 0.6)',
  glassDark: 'rgba(15, 20, 25, 0.8)',
  glassAccent: 'rgba(255, 180, 162, 0.1)',

  // Gradient colors
  peach: '#FFB4A2',
  coral: '#FF8882',
  softOrange: '#FFA07A',
  lightTeal: '#6DD5D5',
  mint: '#89E4D2',
  roseGold: '#FFB6C1',
  sunset: '#FF8A95',

  // Primary gradient (warm)
  gradientStart: '#FFB4A2',
  gradientMid: '#FF8882',
  gradientEnd: '#FFA07A',

  // Secondary gradient (cool)
  gradientCoolStart: '#6DD5D5',
  gradientCoolEnd: '#89E4D2',

  // Text colors - High contrast
  textPrimary: '#FFFFFF',       // Pure white
  textSecondary: '#B8C5D0',     // Light gray
  textMuted: '#6B7A8F',         // Soft gray
  textAccent: '#FFB4A2',        // Warm accent
  textInverse: '#FFFFFF',
  textDark: '#0F1419',          // Dark text for light backgrounds

  // Green accent colors (for feature cards and highlights)
  greenPrimary: '#2D7A5E',      // Primary green
  greenLight: '#3D9A7E',        // Lighter green
  greenDark: '#1A4D3E',         // Dark green
  greenSurface: '#1E5545',      // Green surface

  // Glass borders
  borderGlass: 'rgba(255, 255, 255, 0.1)',
  borderGlassHover: 'rgba(255, 255, 255, 0.2)',
  borderGradient: 'rgba(255, 180, 162, 0.3)',

  // Status colors
  primary: '#40bf75',
  success: '#4ECDC4',
  warning: '#FFB347',
  danger: '#FF6B9D',
  info: '#6DD5D5',

  // Overlay & backdrop
  overlay: 'rgba(0, 0, 0, 0.7)',
  backdropBlur: 'rgba(15, 20, 25, 0.95)',

  // Accent colors for icons
  iconPeach: '#FFB4A2',
  iconCoral: '#FF8882',
  iconTeal: '#6DD5D5',
  iconMint: '#89E4D2',
  iconRose: '#FFB6C1',

  // Neutral grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Minimalist Theme Colors (for new UI redesign)
  minimalist: {
    // Neutral base
    white: '#FFFFFF',
    offWhite: '#FAFAF9',
    warmGray: '#F5F5F4',
    bgLight: '#F9FAFB',

    // Warm accents (main palette)
    softRed: '#EF4444',
    mutedOrange: '#F59E0B',
    orange: '#F59E0B', // Alias for mutedOrange or consistent naming
    gentleYellow: '#FDE68A',
    coral: '#F5A491',
    peach: '#FFB4A2',
    peachLight: '#FFD7D0', // Added for backgrounds/highlights

    // Status colors (soft, humane)
    successGreen: '#10B981',
    green: '#10B981', // Alias
    greenDark: '#065F46', // Darker green for status
    warningOrange: '#F59E0B',
    errorRed: '#EF4444',
    redDark: '#DC2626', // Dark red for disaster alerts and high priority
    infoBlue: '#3B82F6',
    blue: '#3B82F6', // Alias

    // Special states
    vaccinated: '#10B981',
    neutered: '#6366F1',
    atRisk: '#EF4444',
    lost: '#F59E0B',
    found: '#10B981',

    // Text colors
    textDark: '#1C1917',
    textMedium: '#78716C',
    textLight: '#A8A29E',

    // Borders
    border: '#E7E5E4',
    borderLight: '#F5F5F4',

    // Disaster Mode Colors
    disasterRed: '#DC2626',
    disasterRedLight: '#FEE2E2',
    disasterOrange: '#F97316',
    disasterOrangeLight: '#FFEDD5',
    disasterGray: '#6B7280',
    disasterGrayLight: '#F3F4F6',
    disasterDark: '#1C1917',
  },
};

// Gradient definitions
export const gradients = {
  primary: [colors.peach, colors.coral, colors.softOrange] as const,
  secondary: [colors.lightTeal, colors.mint] as const,
  tertiary: [colors.roseGold, colors.sunset] as const,
  warm: [colors.peach, colors.softOrange] as const,
  cool: [colors.lightTeal, colors.mint] as const,
  accent: [colors.coral, colors.sunset] as const,
  glass: ['rgba(255, 180, 162, 0.15)', 'rgba(109, 213, 213, 0.15)'] as const,
};

// Gradient positions for LinearGradient
export const gradientPositions = {
  horizontal: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
  vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  diagonalAlt: { start: { x: 1, y: 0 }, end: { x: 0, y: 1 } },
  radial: { start: { x: 0.5, y: 0.5 }, end: { x: 1, y: 1 } },
};

export type ColorKey = keyof typeof colors;
export type GradientKey = keyof typeof gradients;
