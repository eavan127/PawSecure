import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Frosted/Icy Color Palette
/// Monochromatic–Analogous cool tones with low saturation and soft contrast
class AppColors {
  // Core Palette
  static const charcoal = Color(0xFF29353C); // Very dark blue-gray (anchor)
  static const deepSlate = Color(0xFF44576D); // Deep slate blue
  static const steelBlue = Color(0xFF768A96); // Muted steel blue
  static const pastelBlue = Color(0xFFAAC7D8); // Soft pastel blue
  static const icyBlue = Color(0xFFDFEBF6); // Very light icy blue
  static const neutralGray = Color(0xFFE6E6E6); // Light neutral gray

  // Semantic Colors
  static const primary = steelBlue;
  static const secondary = pastelBlue;
  static const surface = charcoal;
  static const background = charcoal;
  static const accent = deepSlate;
  
  // Status Colors (muted versions for consistency)
  static const success = Color(0xFF7A9D96); // Muted teal
  static const warning = Color(0xFFB89D7A); // Muted gold
  static const error = Color(0xFFB87A7A); // Muted red
  static const info = pastelBlue;
}

/// Material Design 3 Theme Configuration
class AppTheme {
  // Dark Theme (Primary)
  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.dark(
      primary: AppColors.steelBlue,
      onPrimary: AppColors.charcoal,
      primaryContainer: AppColors.deepSlate,
      onPrimaryContainer: AppColors.icyBlue,
      
      secondary: AppColors.pastelBlue,
      onSecondary: AppColors.charcoal,
      secondaryContainer: AppColors.deepSlate,
      onSecondaryContainer: AppColors.icyBlue,
      
      tertiary: AppColors.icyBlue,
      onTertiary: AppColors.charcoal,
      
      error: AppColors.error,
      onError: Colors.white,
      
      surface: AppColors.charcoal,
      onSurface: AppColors.icyBlue,
      surfaceContainerHighest: AppColors.deepSlate,
      
      background: AppColors.charcoal,
      onBackground: AppColors.icyBlue,
      
      outline: AppColors.steelBlue.withOpacity(0.3),
      outlineVariant: AppColors.steelBlue.withOpacity(0.1),
      
      shadow: Colors.black.withOpacity(0.3),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      
      // Typography
      textTheme: GoogleFonts.manropeTextTheme(
        ThemeData.dark().textTheme.apply(
          bodyColor: AppColors.icyBlue,
          displayColor: AppColors.icyBlue,
        ),
      ),
      
      // App Bar
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.charcoal.withOpacity(0.8),
        foregroundColor: AppColors.icyBlue,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.manrope(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.icyBlue,
        ),
      ),
      
      // Cards
      cardTheme: CardThemeData(
        color: AppColors.deepSlate,
        elevation: 2,
        shadowColor: Colors.black.withOpacity(0.2),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: AppColors.steelBlue.withOpacity(0.1),
            width: 1,
          ),
        ),
      ),
      
      // Elevated Buttons
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.steelBlue,
          foregroundColor: AppColors.charcoal,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.manrope(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      // Text Buttons
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.pastelBlue,
          textStyle: GoogleFonts.manrope(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.deepSlate.withOpacity(0.3),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: AppColors.steelBlue.withOpacity(0.3),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: AppColors.steelBlue.withOpacity(0.3),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: AppColors.steelBlue,
            width: 2,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: BorderSide(
            color: AppColors.error,
          ),
        ),
        labelStyle: GoogleFonts.manrope(
          color: AppColors.pastelBlue,
        ),
        hintStyle: GoogleFonts.manrope(
          color: AppColors.steelBlue.withOpacity(0.6),
        ),
      ),
      
      // Bottom Navigation Bar
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.charcoal.withOpacity(0.9),
        indicatorColor: AppColors.steelBlue.withOpacity(0.2),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.manrope(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: AppColors.steelBlue,
            );
          }
          return GoogleFonts.manrope(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: AppColors.steelBlue.withOpacity(0.6),
          );
        }),
        iconTheme: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return const IconThemeData(
              color: AppColors.steelBlue,
              size: 24,
            );
          }
          return IconThemeData(
            color: AppColors.steelBlue.withOpacity(0.6),
            size: 24,
          );
        }),
      ),
      
      // Floating Action Button
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: AppColors.steelBlue,
        foregroundColor: AppColors.charcoal,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      
      // Divider
      dividerTheme: DividerThemeData(
        color: AppColors.steelBlue.withOpacity(0.2),
        thickness: 1,
      ),
    );
  }

  // Light Theme (Frosted variant)
  static ThemeData get lightTheme {
    final colorScheme = ColorScheme.light(
      primary: AppColors.steelBlue,
      onPrimary: Colors.white,
      primaryContainer: AppColors.icyBlue,
      onPrimaryContainer: AppColors.charcoal,
      
      secondary: AppColors.pastelBlue,
      onSecondary: AppColors.charcoal,
      secondaryContainer: AppColors.icyBlue,
      onSecondaryContainer: AppColors.charcoal,
      
      tertiary: AppColors.deepSlate,
      onTertiary: Colors.white,
      
      error: AppColors.error,
      onError: Colors.white,
      
      surface: AppColors.icyBlue,
      onSurface: AppColors.charcoal,
      surfaceContainerHighest: AppColors.neutralGray,
      
      background: AppColors.neutralGray,
      onBackground: AppColors.charcoal,
      
      outline: AppColors.steelBlue.withOpacity(0.3),
      outlineVariant: AppColors.steelBlue.withOpacity(0.1),
      
      shadow: AppColors.charcoal.withOpacity(0.1),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      
      // Typography
      textTheme: GoogleFonts.manropeTextTheme(
        ThemeData.light().textTheme.apply(
          bodyColor: AppColors.charcoal,
          displayColor: AppColors.charcoal,
        ),
      ),
      
      // App Bar
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.icyBlue.withOpacity(0.8),
        foregroundColor: AppColors.charcoal,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.manrope(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: AppColors.charcoal,
        ),
      ),
      
      // Cards
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 1,
        shadowColor: AppColors.charcoal.withOpacity(0.1),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: AppColors.steelBlue.withOpacity(0.15),
            width: 1,
          ),
        ),
      ),
      
      // Buttons and other components follow similar pattern...
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.steelBlue,
          foregroundColor: Colors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: GoogleFonts.manrope(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
