import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final VoidCallback? onTap;
  final Color? color;
  final BorderRadius? borderRadius;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.color,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final br = borderRadius ?? BorderRadius.circular(AppTheme.radiusLarge);
    final card = Container(
      decoration: BoxDecoration(
        color: color ?? AppTheme.surface,
        borderRadius: br,
        border: Border.all(color: AppTheme.cardBorder, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppTheme.secondary.withValues(alpha: 0.08),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: padding ?? EdgeInsets.zero,
        child: child,
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: br,
        child: card,
      );
    }

    return card;
  }
}
