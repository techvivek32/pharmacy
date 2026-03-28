import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../providers/delivery_provider.dart';

class NavigationScreen extends StatefulWidget {
  final dynamic delivery;

  const NavigationScreen({super.key, required this.delivery});

  @override
  State<NavigationScreen> createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  String _currentStatus = 'accepted';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Navigation'),
      ),
      body: Column(
        children: [
          Expanded(
            child: _buildMapPlaceholder(),
          ),
          _buildBottomSheet(),
        ],
      ),
    );
  }

  Widget _buildMapPlaceholder() {
    return Container(
      color: AppTheme.background,
      child: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.map, size: 64, color: AppTheme.textHint),
            SizedBox(height: AppTheme.spacing8),
            Text('Map navigation coming soon'),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomSheet() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: const BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(AppTheme.radiusXLarge),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildStatusInfo(),
          const SizedBox(height: AppTheme.spacing16),
          _buildActionButton(),
        ],
      ),
    );
  }

  Widget _buildStatusInfo() {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _getStatusTitle(),
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Icon(
                  _getStatusIcon(),
                  color: AppTheme.primary,
                ),
              ],
            ),
            const SizedBox(height: AppTheme.spacing8),
            Text(
              _getStatusDescription(),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton() {
    return PrimaryButton(
      text: _getButtonText(),
      onPressed: _handleAction,
    );
  }

  String _getStatusTitle() {
    switch (_currentStatus) {
      case 'accepted':
        return 'Navigate to Pharmacy';
      case 'picked_up':
        return 'Navigate to Patient';
      case 'delivered':
        return 'Delivery Complete';
      default:
        return 'In Progress';
    }
  }

  String _getStatusDescription() {
    switch (_currentStatus) {
      case 'accepted':
        return 'Pick up the order from the pharmacy';
      case 'picked_up':
        return 'Deliver the order to the patient';
      case 'delivered':
        return 'Great job! Delivery completed successfully';
      default:
        return '';
    }
  }

  IconData _getStatusIcon() {
    switch (_currentStatus) {
      case 'accepted':
        return Icons.store;
      case 'picked_up':
        return Icons.person;
      case 'delivered':
        return Icons.check_circle;
      default:
        return Icons.local_shipping;
    }
  }

  String _getButtonText() {
    switch (_currentStatus) {
      case 'accepted':
        return 'Confirm Pickup';
      case 'picked_up':
        return 'Confirm Delivery';
      case 'delivered':
        return 'Back to Home';
      default:
        return 'Continue';
    }
  }

  Future<void> _handleAction() async {
    if (_currentStatus == 'delivered') {
      Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false);
      return;
    }

    final nextStatus = _currentStatus == 'accepted' ? 'picked_up' : 'delivered';
    
    final success = await context.read<DeliveryProvider>().updateDeliveryStatus(
      widget.delivery.orderId,
      nextStatus,
    );

    if (success) {
      setState(() => _currentStatus = nextStatus);
      
      if (_currentStatus == 'delivered' && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Delivery completed successfully!'),
            backgroundColor: AppTheme.success,
          ),
        );
      }
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.read<DeliveryProvider>().error ?? 'Failed to update status'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }
}
