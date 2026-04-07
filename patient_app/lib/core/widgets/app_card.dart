import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final Color? color;
  final double? elevation;
  final BorderRadius? borderRadius;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
    this.color,
    this.elevation,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    final br = borderRadius ?? BorderRadius.circular(AppTheme.radiusLarge);
    final card = Container(
      margin: margin,
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
        padding: padding ?? const EdgeInsets.all(AppTheme.spacing16),
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

class InfoCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color? iconColor;
  final Color? backgroundColor;

  const InfoCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.iconColor,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: backgroundColor ?? AppTheme.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
            ),
            child: Icon(icon, color: iconColor ?? AppTheme.primary, size: 24),
          ),
          const SizedBox(width: AppTheme.spacing16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: AppTheme.spacing4),
                Text(value, style: Theme.of(context).textTheme.titleLarge),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
