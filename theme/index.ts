// Export all theme modules
import { colors, gradients, gradientPositions } from './colors';
import type { ColorKey, GradientKey } from './colors';

import { spacing, layout } from './spacing';
import type { SpacingKey } from './spacing';

import { typography, textStyles, normalize } from './typography';
import type { TextStyleKey } from './typography';

import { radius, borderRadius } from './radius';
import type { RadiusKey } from './radius';

import { shadows, coloredShadows, glassEffect } from './shadows';
import type { ShadowKey, ColoredShadowKey } from './shadows';

// Re-export all modules
export { colors, gradients, gradientPositions };
export type { ColorKey, GradientKey };

export { spacing, layout };
export type { SpacingKey };

export { typography, textStyles, normalize };
export type { TextStyleKey };

export { radius, borderRadius };
export type { RadiusKey };

export { shadows, coloredShadows, glassEffect };
export type { ShadowKey, ColoredShadowKey };

// Unified theme object
export const theme = {
    colors: colors,
    gradients: gradients,
    gradientPositions: gradientPositions,
    spacing: spacing,
    layout: layout,
    typography: typography,
    textStyles: textStyles,
    normalize: normalize,
    radius: radius,
    borderRadius: borderRadius,
    shadows: shadows,
    coloredShadows: coloredShadows,
    glassEffect: glassEffect,
} as const;

export type Theme = typeof theme;
