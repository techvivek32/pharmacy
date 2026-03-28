import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../services/api_service.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  bool _isLoading = true;
  List<dynamic> _orders = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final response = await ApiService.get('/pharmacy/orders');
      if (response.success) {
        setState(() {
          _orders = (response.data['orders'] as List?) ?? [];
          _isLoading = false;
        });
      } else {
        setState(() { _error = response.message; _isLoading = false; });
      }
    } catch (e) {
      setState(() { _error = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order History')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(_error!, style: const TextStyle(color: AppTheme.error)),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _loadOrders, child: const Text('Retry')),
                    ],
                  ),
                )
              : _orders.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt_long_outlined,
                              size: 80,
                              color: AppTheme.textSecondary.withOpacity(0.4)),
                          const SizedBox(height: 16),
                          Text('No Orders Yet',
                              style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(height: 8),
                          Text('Completed orders will appear here',
                              style: Theme.of(context).textTheme.bodyMedium),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadOrders,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        itemCount: _orders.length,
                        separatorBuilder: (_, __) =>
                            const SizedBox(height: AppTheme.spacing12),
                        itemBuilder: (context, i) =>
                            _buildOrderCard(context, _orders[i]),
                      ),
                    ),
    );
  }

  Widget _buildOrderCard(BuildContext context, dynamic order) {
    final status = order['status'] ?? 'confirmed';
    final color = _statusColor(status);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '#${order['orderNumber'] ?? order['id'].toString().substring(0, 8)}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    status.toString().toUpperCase(),
                    style: TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w600, color: color),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.spacing8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${(order['items'] as List?)?.length ?? 0} items',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                Text(
                  '${order['totalAmount'] ?? 0} MAD',
                  style: Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(color: AppTheme.primary),
                ),
              ],
            ),
            if (order['deliveryAddress'] != null) ...[
              const SizedBox(height: AppTheme.spacing4),
              Row(
                children: [
                  const Icon(Icons.location_on_outlined,
                      size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      order['deliveryAddress'],
                      style: Theme.of(context).textTheme.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'delivered': return AppTheme.success;
      case 'cancelled': return AppTheme.error;
      case 'in_transit':
      case 'picked_up': return AppTheme.info;
      default: return AppTheme.warning;
    }
  }
}
