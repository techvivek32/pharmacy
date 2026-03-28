import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../providers/order_provider.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String orderId;

  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  @override
  void initState() {
    super.initState();
    _loadOrderDetails();
  }

  Future<void> _loadOrderDetails() async {
    await context.read<OrderProvider>().trackOrder(widget.orderId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Track Order'),
      ),
      body: Consumer<OrderProvider>(
        builder: (context, orderProvider, _) {
          if (orderProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final order = orderProvider.currentOrder;
          if (order == null) {
            return const Center(child: Text('Order not found'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildOrderHeader(order),
                const SizedBox(height: AppTheme.spacing24),
                _buildMapPlaceholder(),
                const SizedBox(height: AppTheme.spacing24),
                _buildStatusTimeline(order),
                const SizedBox(height: AppTheme.spacing24),
                if (order.rider != null) _buildRiderInfo(order.rider),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildOrderHeader(dynamic order) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              order.orderNumber ?? 'Order',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppTheme.spacing8),
            Row(
              children: [
                const Icon(Icons.store, size: 16, color: AppTheme.textSecondary),
                const SizedBox(width: AppTheme.spacing4),
                Text(
                  order.pharmacyName ?? 'Pharmacy',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMapPlaceholder() {
    return AppCard(
      child: Container(
        height: 200,
        decoration: BoxDecoration(
          color: AppTheme.background,
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.map, size: 48, color: AppTheme.textHint),
              SizedBox(height: AppTheme.spacing8),
              Text('Map view coming soon'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusTimeline(dynamic order) {
    final statuses = [
      {'status': 'confirmed', 'label': 'Order Confirmed', 'icon': Icons.check_circle},
      {'status': 'preparing', 'label': 'Preparing', 'icon': Icons.medication},
      {'status': 'picked_up', 'label': 'Picked Up', 'icon': Icons.shopping_bag},
      {'status': 'in_transit', 'label': 'On the Way', 'icon': Icons.local_shipping},
      {'status': 'delivered', 'label': 'Delivered', 'icon': Icons.done_all},
    ];

    final currentStatusIndex = statuses.indexWhere((s) => s['status'] == order.status);

    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Order Status',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppTheme.spacing16),
            ...List.generate(statuses.length, (index) {
              final status = statuses[index];
              final isCompleted = index <= currentStatusIndex;
              final isActive = index == currentStatusIndex;

              return _buildTimelineItem(
                icon: status['icon'] as IconData,
                label: status['label'] as String,
                isCompleted: isCompleted,
                isActive: isActive,
                isLast: index == statuses.length - 1,
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildTimelineItem({
    required IconData icon,
    required String label,
    required bool isCompleted,
    required bool isActive,
    required bool isLast,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              padding: const EdgeInsets.all(AppTheme.spacing8),
              decoration: BoxDecoration(
                color: isCompleted ? AppTheme.primary : AppTheme.background,
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                size: 20,
                color: isCompleted ? Colors.white : AppTheme.textHint,
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: isCompleted ? AppTheme.primary : AppTheme.divider,
              ),
          ],
        ),
        const SizedBox(width: AppTheme.spacing12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: AppTheme.spacing8),
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: isActive ? AppTheme.primary : AppTheme.textSecondary,
                    fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                  ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRiderInfo(dynamic rider) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Delivery Rider',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppTheme.spacing16),
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                  child: const Icon(Icons.person, color: AppTheme.primary),
                ),
                const SizedBox(width: AppTheme.spacing12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        rider.name ?? 'Rider',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      Text(
                        rider.phone ?? '',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () {},
                  icon: const Icon(Icons.phone, color: AppTheme.primary),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
