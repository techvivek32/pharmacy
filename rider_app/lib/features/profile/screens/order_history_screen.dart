import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class OrderHistoryScreen extends StatelessWidget {
  const OrderHistoryScreen({super.key});

  static const List<Map<String, dynamic>> _history = [
    {
      'orderNumber': 'ORD-001',
      'status': 'delivered',
      'deliveryFee': 10.0,
      'date': '2024-01-15',
      'address': '123 Main St, Casablanca',
    },
    {
      'orderNumber': 'ORD-002',
      'status': 'delivered',
      'deliveryFee': 15.0,
      'date': '2024-01-16',
      'address': '45 Rue Ibn Battouta',
    },
    {
      'orderNumber': 'ORD-003',
      'status': 'cancelled',
      'deliveryFee': 0.0,
      'date': '2024-01-14',
      'address': '78 Avenue Mohammed V',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order History')),
      body: _history.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, size: 80, color: AppTheme.textSecondary.withOpacity(0.4)),
                  const SizedBox(height: AppTheme.spacing16),
                  Text('No history yet', style: Theme.of(context).textTheme.titleLarge),
                ],
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              itemCount: _history.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppTheme.spacing8),
              itemBuilder: (context, index) {
                final item = _history[index];
                final isDelivered = item['status'] == 'delivered';
                return Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: (isDelivered ? AppTheme.success : AppTheme.error).withOpacity(0.1),
                      child: Icon(
                        isDelivered ? Icons.check_circle : Icons.cancel,
                        color: isDelivered ? AppTheme.success : AppTheme.error,
                      ),
                    ),
                    title: Text(item['orderNumber'], style: Theme.of(context).textTheme.titleSmall),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item['address'], style: Theme.of(context).textTheme.bodySmall),
                        Text(item['date'], style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                    trailing: Text(
                      isDelivered ? '+${item['deliveryFee']} MAD' : 'Cancelled',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: isDelivered ? AppTheme.success : AppTheme.error,
                        fontSize: 13,
                      ),
                    ),
                    isThreeLine: true,
                  ),
                );
              },
            ),
    );
  }
}
