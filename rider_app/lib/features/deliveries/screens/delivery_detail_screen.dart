import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../providers/delivery_provider.dart';

class DeliveryDetailScreen extends StatelessWidget {
  final dynamic delivery;

  const DeliveryDetailScreen({super.key, required this.delivery});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Delivery Details'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildOrderInfo(context),
            const SizedBox(height: AppTheme.spacing16),
            _buildLocationInfo(context),
            const SizedBox(height: AppTheme.spacing16),
            _buildEarningsInfo(context),
            const SizedBox(height: AppTheme.spacing24),
            PrimaryButton(
              text: 'Accept Delivery',
              onPressed: () => _acceptDelivery(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderInfo(BuildContext context) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Order Information',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppTheme.spacing12),
            _buildInfoRow(Icons.receipt, 'Order', delivery.orderNumber ?? 'N/A'),
          ],
        ),
      ),
    );
  }

  Widget _buildLocationInfo(BuildContext context) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Locations',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppTheme.spacing12),
            _buildInfoRow(Icons.store, 'Pickup', delivery.pickupAddress ?? 'N/A'),
            _buildInfoRow(Icons.location_on, 'Delivery', delivery.deliveryAddress ?? 'N/A'),
            _buildInfoRow(Icons.straighten, 'Distance', '${delivery.distance ?? 0} km'),
          ],
        ),
      ),
    );
  }

  Widget _buildEarningsInfo(BuildContext context) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Delivery Fee',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              '${delivery.deliveryFee ?? 0} MAD',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    color: AppTheme.primary,
                  ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.textSecondary),
          const SizedBox(width: AppTheme.spacing8),
          Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w500)),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  Future<void> _acceptDelivery(BuildContext context) async {
    final success = await context.read<DeliveryProvider>().acceptDelivery(delivery.orderId);

    if (success && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Delivery accepted!'),
          backgroundColor: AppTheme.success,
        ),
      );
      Navigator.pushReplacementNamed(
        context,
        '/navigation',
        arguments: delivery,
      );
    } else if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.read<DeliveryProvider>().error ?? 'Failed to accept delivery'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }
}
