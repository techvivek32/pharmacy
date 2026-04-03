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
  final Set<String> _expandedIds = {};

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
                          Text('Confirmed orders will appear here',
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
    final orderId = order['id']?.toString() ?? order['_id']?.toString() ?? '$status$status';
    final items = (order['items'] as List?) ?? [];
    final isExpanded = _expandedIds.contains(orderId);

    // Show only the pharmacy's quote subtotal (medicines only, no tax/delivery)
    final subtotal = (order['subtotal'] ?? 0).toDouble();

    return Card(
      child: InkWell(
        onTap: () => setState(() {
          if (isExpanded) {
            _expandedIds.remove(orderId);
          } else {
            _expandedIds.add(orderId);
          }
        }),
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '#${order['orderNumber'] ?? orderId.substring(0, 8)}',
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
              // Items count + subtotal + expand arrow
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '${items.length} item${items.length == 1 ? '' : 's'}',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  Row(
                    children: [
                      Text(
                        '${subtotal.toStringAsFixed(2)} MAD',
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(color: AppTheme.primary),
                      ),
                      const SizedBox(width: AppTheme.spacing8),
                      AnimatedRotation(
                        turns: isExpanded ? 0.5 : 0,
                        duration: const Duration(milliseconds: 200),
                        child: const Icon(Icons.keyboard_arrow_down,
                            size: 20, color: AppTheme.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
              // Expandable medicines list
              AnimatedCrossFade(
                firstChild: const SizedBox.shrink(),
                secondChild: items.isEmpty
                    ? const SizedBox.shrink()
                    : Column(
                        children: [
                          const Divider(height: 20),
                          ...items.map((item) => Padding(
                                padding: const EdgeInsets.only(bottom: AppTheme.spacing8),
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: AppTheme.primary.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                                      ),
                                      child: const Icon(Icons.medication,
                                          size: 14, color: AppTheme.primary),
                                    ),
                                    const SizedBox(width: AppTheme.spacing8),
                                    Expanded(
                                      child: Text(
                                        item['medicineName'] ?? 'Unknown',
                                        style: Theme.of(context).textTheme.bodyMedium,
                                      ),
                                    ),
                                    Text(
                                      'x${item['quantity'] ?? 1}',
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            color: AppTheme.textSecondary,
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                  ],
                                ),
                              )),
                        ],
                      ),
                crossFadeState: isExpanded
                    ? CrossFadeState.showSecond
                    : CrossFadeState.showFirst,
                duration: const Duration(milliseconds: 200),
              ),
            ],
          ),
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
