import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  static const List<Map<String, dynamic>> _orders = [
    {
      'orderNumber': 'ORD-001',
      'status': 'delivered',
      'pickupAddress': 'City Pharmacy, Main St',
      'deliveryAddress': '123 Main St, Casablanca',
      'deliveryFee': 10.0,
      'date': '2024-01-15',
    },
    {
      'orderNumber': 'ORD-002',
      'status': 'in_progress',
      'pickupAddress': 'Green Pharmacy, Bd Hassan II',
      'deliveryAddress': '45 Rue Ibn Battouta',
      'deliveryFee': 15.0,
      'date': '2024-01-16',
    },
  ];

  Color _statusColor(String status) {
    switch (status) {
      case 'delivered':
        return AppTheme.success;
      case 'in_progress':
        return AppTheme.warning;
      case 'cancelled':
        return AppTheme.error;
      default:
        return AppTheme.textSecondary;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in_progress':
        return 'In Progress';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: _orders.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.receipt_long, size: 80, color: AppTheme.textSecondary.withOpacity(0.4)),
                  const SizedBox(height: AppTheme.spacing16),
                  Text('No orders yet', style: Theme.of(context).textTheme.titleLarge),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              itemCount: _orders.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppTheme.spacing12),
              itemBuilder: (context, index) {
                final order = _orders[index];
                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(AppTheme.spacing16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(order['orderNumber'], style: Theme.of(context).textTheme.titleMedium),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppTheme.spacing12,
                                vertical: AppTheme.spacing4,
                              ),
                              decoration: BoxDecoration(
                                color: _statusColor(order['status']).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                              ),
                              child: Text(
                                _statusLabel(order['status']),
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: _statusColor(order['status']),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppTheme.spacing12),
                        _AddressRow(icon: Icons.store, label: 'Pickup', address: order['pickupAddress']),
                        const SizedBox(height: AppTheme.spacing8),
                        _AddressRow(icon: Icons.location_on, label: 'Delivery', address: order['deliveryAddress']),
                        const Divider(height: AppTheme.spacing24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(order['date'], style: Theme.of(context).textTheme.bodySmall),
                            Text(
                              '${order['deliveryFee']} MAD',
                              style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.success),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}

class _AddressRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String address;

  const _AddressRow({required this.icon, required this.label, required this.address});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppTheme.primary),
        const SizedBox(width: AppTheme.spacing8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: Theme.of(context).textTheme.bodySmall),
              Text(address, style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
        ),
      ],
    );
  }
}
