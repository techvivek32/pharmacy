import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color primary = Color(0xFF3D6B4F);
  static const Color primaryLight = Color(0xFF6B9E7E);
  static const Color primaryDark = Color(0xFF1B5E20);
  static const Color secondary = Color(0xFF8B6914);
  static const Color accent = Color(0xFFC49A3C);

  static const Color background = Color(0xFFF2ECD8);
  static const Color surface = Color(0xFFFAF5E8);
  static const Color cardBorder = Color(0xFFB8956A);
  static const Color navBar = Color(0xFF2C1F0E);

  static const Color error = Color(0xFFB71C1C);
  static const Color success = Color(0xFF2E7D32);
  static const Color warning = Color(0xFFF57F17);
  static const Color info = Color(0xFF0277BD);

  static const Color textPrimary = Color(0xFF1A1208);
  static const Color textSecondary = Color(0xFF5C4A2A);
  static const Color textHint = Color(0xFFA08060);
  static const Color divider = Color(0xFFD4B896);

  static const double spacing4 = 4.0;
  static const double spacing8 = 8.0;
  static const double spacing12 = 12.0;
  static const double spacing16 = 16.0;
  static const double spacing20 = 20.0;
  static const double spacing24 = 24.0;
  static const double spacing32 = 32.0;
  static const double spacing48 = 48.0;

  static const double radiusSmall = 8.0;
  static const double radiusMedium = 12.0;
  static const double radiusLarge = 16.0;
  static const double radiusXLarge = 24.0;

  static const double elevationLow = 2.0;
  static const double elevationMedium = 4.0;
  static const double elevationHigh = 8.0;

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: const ColorScheme.light(
        primary: primary,
        secondary: secondary,
        surface: surface,
        error: error,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textPrimary,
        onError: Colors.white,
      ),
      scaffoldBackgroundColor: background,
      textTheme: GoogleFonts.latoTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(fontSize: 32, fontWeight: FontWeight.bold, color: textPrimary, height: 1.2),
        displayMedium: GoogleFonts.playfairDisplay(fontSize: 28, fontWeight: FontWeight.bold, color: textPrimary, height: 1.2),
        displaySmall: GoogleFonts.playfairDisplay(fontSize: 24, fontWeight: FontWeight.w600, color: textPrimary, height: 1.3),
        headlineMedium: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.w600, color: textPrimary, height: 1.3),
        titleLarge: GoogleFonts.playfairDisplay(fontSize: 18, fontWeight: FontWeight.w600, color: textPrimary, height: 1.4),
        titleMedium: GoogleFonts.lato(fontSize: 16, fontWeight: FontWeight.w700, color: textPrimary, height: 1.4),
        bodyLarge: GoogleFonts.lato(fontSize: 16, fontWeight: FontWeight.normal, color: textPrimary, height: 1.5),
        bodyMedium: GoogleFonts.lato(fontSize: 14, fontWeight: FontWeight.normal, color: textSecondary, height: 1.5),
        bodySmall: GoogleFonts.lato(fontSize: 12, fontWeight: FontWeight.normal, color: textSecondary, height: 1.5),
        labelLarge: GoogleFonts.lato(fontSize: 14, fontWeight: FontWeight.w600, color: textPrimary, height: 1.4),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: textPrimary),
        titleTextStyle: GoogleFonts.playfairDisplay(fontSize: 20, fontWeight: FontWeight.w600, color: textPrimary),
        surfaceTintColor: Colors.transparent,
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(radiusLarge),
          side: const BorderSide(color: cardBorder, width: 1.5),
        ),
        margin: const EdgeInsets.all(0),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: spacing32, vertical: spacing16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusMedium)),
          textStyle: GoogleFonts.lato(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primary,
          padding: const EdgeInsets.symmetric(horizontal: spacing32, vertical: spacing16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusMedium)),
          side: const BorderSide(color: primary, width: 1.5),
          textStyle: GoogleFonts.lato(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primary,
          padding: const EdgeInsets.symmetric(horizontal: spacing16, vertical: spacing12),
          textStyle: GoogleFonts.lato(fontSize: 14, fontWeight: FontWeight.w600),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(radiusMedium), borderSide: const BorderSide(color: cardBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(radiusMedium), borderSide: const BorderSide(color: cardBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(radiusMedium), borderSide: const BorderSide(color: primary, width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(radiusMedium), borderSide: const BorderSide(color: error, width: 1)),
        focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(radiusMedium), borderSide: const BorderSide(color: error, width: 2)),
        contentPadding: const EdgeInsets.symmetric(horizontal: spacing16, vertical: spacing16),
        hintStyle: GoogleFonts.lato(fontSize: 14, color: textHint),
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: navBar,
        selectedItemColor: accent,
        unselectedItemColor: const Color(0xFF8B7355),
        selectedLabelStyle: GoogleFonts.lato(fontSize: 12, fontWeight: FontWeight.w600),
        unselectedLabelStyle: GoogleFonts.lato(fontSize: 12),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      dividerTheme: const DividerThemeData(color: divider, thickness: 1, space: 1),
      chipTheme: ChipThemeData(
        backgroundColor: background,
        selectedColor: primary.withValues(alpha: 0.15),
        labelStyle: GoogleFonts.lato(fontSize: 12, fontWeight: FontWeight.w500),
        padding: const EdgeInsets.symmetric(horizontal: spacing12, vertical: spacing8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(radiusSmall)),
      ),
    );
  }
}
