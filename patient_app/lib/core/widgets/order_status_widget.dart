import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class OrderStatusWidget extends StatelessWidget {
  final String status;
  final bool showIcon;

  const OrderStatusWidget({
    super.key,
    required this.status,
    this.showIcon = true,
  });

  @override
  Widget build(BuildContext context) {
    final statusInfo = _getStatusInfo(status);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppTheme.spacing12,
        vertical: AppTheme.spacing8,
      ),
      decoration: BoxDecoration(
        color: statusInfo.color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showIcon) ...[
            Icon(
              statusInfo.icon,
              size: 16,
              color: statusInfo.color,
            ),
            const SizedBox(width: AppTheme.spacing4),
          ],
          Text(
            statusInfo.label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: statusInfo.color,
            ),
          ),
        ],
      ),
    );
  }

  _StatusInfo _getStatusInfo(String status) {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return _StatusInfo(
          label: 'Confirmed',
          color: AppTheme.info,
          icon: Icons.check_circle_outline,
        );
      case 'preparing':
        return _StatusInfo(
          label: 'Preparing',
          color: AppTheme.warning,
          icon: Icons.hourglass_empty,
        );
      case 'ready':
        return _StatusInfo(
          label: 'Ready',
          color: AppTheme.success,
          icon: Icons.done_all,
        );
      case 'assigned':
        return _StatusInfo(
          label: 'Rider Assigned',
          color: AppTheme.info,
          icon: Icons.person_outline,
        );
      case 'picked_up':
        return _StatusInfo(
          label: 'Picked Up',
          color: AppTheme.primary,
          icon: Icons.local_shipping_outlined,
        );
      case 'in_transit':
        return _StatusInfo(
          label: 'On the Way',
          color: AppTheme.primary,
          icon: Icons.delivery_dining,
        );
      case 'delivered':
        return _StatusInfo(
          label: 'Delivered',
          color: AppTheme.success,
          icon: Icons.check_circle,
        );
      case 'cancelled':
        return _StatusInfo(
          label: 'Cancelled',
          color: AppTheme.error,
          icon: Icons.cancel_outlined,
        );
      default:
        return _StatusInfo(
          label: 'Pending',
          color: AppTheme.textSecondary,
          icon: Icons.pending_outlined,
        );
    }
  }
}

class _StatusInfo {
  final String label;
  final Color color;
  final IconData icon;

  _StatusInfo({
    required this.label,
    required this.color,
    required this.icon,
  });
}
