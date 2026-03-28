import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../providers/order_provider.dart';
import '../../../models/order_model.dart';

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
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OrderProvider>().trackOrder(widget.orderId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: Consumer<OrderProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          final order = provider.currentOrder;
          if (order == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.receipt_long, size: 64, color: AppTheme.textHint),
                  const SizedBox(height: AppTheme.spacing16),
                  const Text('Order not found'),
                  const SizedBox(height: AppTheme.spacing16),
                  TextButton(
                    onPressed: () => context.read<OrderProvider>().trackOrder(widget.orderId),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () => context.read<OrderProvider>().trackOrder(widget.orderId),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatusBanner(order),
                  const SizedBox(height: AppTheme.spacing16),
                  _buildOrderInfo(order),
                  const SizedBox(height: AppTheme.spacing16),
                  _buildDeliveryAddress(order),
                  const SizedBox(height: AppTheme.spacing16),
                  if (order.prescriptionImage != null) ...[
                    _buildPrescriptionImage(order.prescriptionImage!),
                    const SizedBox(height: AppTheme.spacing16),
                  ],
                  _buildStatusTimeline(order),
                  const SizedBox(height: AppTheme.spacing16),
                  if (order.items.isNotEmpty) ...[
                    _buildItemsList(order),
                    const SizedBox(height: AppTheme.spacing16),
                  ],
                  _buildAmountSummary(order),
                  const SizedBox(height: AppTheme.spacing16),
                  if (order.rider != null) ...[
                    _buildRiderInfo(order.rider!),
                    const SizedBox(height: AppTheme.spacing16),
                  ],
                  if (order.pharmacyName != null) ...[
                    _buildPharmacyInfo(order),
                    const SizedBox(height: AppTheme.spacing16),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusBanner(Order order) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppTheme.spacing20),
      decoration: BoxDecoration(
        color: _statusColor(order.status),
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
      ),
      child: Column(
        children: [
          Icon(_statusIcon(order.status), color: Colors.white, size: 40),
          const SizedBox(height: AppTheme.spacing8),
          Text(
            _statusLabel(order.status),
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: AppTheme.spacing4),
          Text(
            order.orderNumber.isNotEmpty ? order.orderNumber : 'Order #${order.id.substring(order.id.length > 6 ? order.id.length - 6 : 0).toUpperCase()}',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.85),
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderInfo(Order order) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Order Information', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.spacing12),
            _infoRow(Icons.calendar_today, 'Date', _formatDate(order.createdAt)),
            if (order.paymentMethod != null)
              _infoRow(Icons.payment, 'Payment', order.paymentMethod!.toUpperCase()),
            if (order.estimatedDeliveryTime != null)
              _infoRow(Icons.access_time, 'Est. Delivery', _formatDate(order.estimatedDeliveryTime!)),
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryAddress(Order order) {
    final address = order.deliveryAddress?['address']?.toString();
    if (address == null || address.isEmpty) return const SizedBox.shrink();

    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Delivery Address', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.spacing12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.location_on, color: AppTheme.primary, size: 20),
                const SizedBox(width: AppTheme.spacing8),
                Expanded(
                  child: Text(address, style: Theme.of(context).textTheme.bodyMedium),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrescriptionImage(String imageUrl) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppTheme.spacing16, AppTheme.spacing16, AppTheme.spacing16, AppTheme.spacing12),
            child: Text('Prescription', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
          ),
          ClipRRect(
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(AppTheme.radiusLarge),
              bottomRight: Radius.circular(AppTheme.radiusLarge),
            ),
            child: Image.network(
              imageUrl,
              width: double.infinity,
              fit: BoxFit.cover,
              loadingBuilder: (_, child, progress) => progress == null
                  ? child
                  : Container(
                      height: 200,
                      color: AppTheme.background,
                      child: const Center(child: CircularProgressIndicator()),
                    ),
              errorBuilder: (_, __, ___) => Container(
                height: 120,
                color: AppTheme.background,
                child: const Center(child: Icon(Icons.broken_image, color: AppTheme.textHint, size: 40)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusTimeline(Order order) {
    final allStatuses = [
      {'status': 'pending', 'label': 'Order Placed', 'icon': Icons.receipt},
      {'status': 'confirmed', 'label': 'Confirmed', 'icon': Icons.check_circle},
      {'status': 'preparing', 'label': 'Preparing', 'icon': Icons.medication},
      {'status': 'picked_up', 'label': 'Picked Up', 'icon': Icons.shopping_bag},
      {'status': 'in_transit', 'label': 'On the Way', 'icon': Icons.local_shipping},
      {'status': 'delivered', 'label': 'Delivered', 'icon': Icons.done_all},
    ];

    if (order.status == 'cancelled') {
      return AppCard(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.spacing8),
                decoration: const BoxDecoration(color: AppTheme.error, shape: BoxShape.circle),
                child: const Icon(Icons.cancel, color: Colors.white, size: 20),
              ),
              const SizedBox(width: AppTheme.spacing12),
              Text('Order Cancelled', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.error)),
            ],
          ),
        ),
      );
    }

    final currentIndex = allStatuses.indexWhere((s) => s['status'] == order.status);

    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Order Status', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.spacing16),
            ...List.generate(allStatuses.length, (i) {
              final done = i <= currentIndex;
              final active = i == currentIndex;
              final isLast = i == allStatuses.length - 1;
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: done ? AppTheme.primary : AppTheme.background,
                          shape: BoxShape.circle,
                          border: Border.all(color: done ? AppTheme.primary : AppTheme.divider, width: 2),
                        ),
                        child: Icon(allStatuses[i]['icon'] as IconData, size: 16, color: done ? Colors.white : AppTheme.textHint),
                      ),
                      if (!isLast)
                        Container(width: 2, height: 32, color: done ? AppTheme.primary : AppTheme.divider),
                    ],
                  ),
                  const SizedBox(width: AppTheme.spacing12),
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      allStatuses[i]['label'] as String,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: active ? AppTheme.primary : done ? AppTheme.textPrimary : AppTheme.textHint,
                            fontWeight: active ? FontWeight.bold : FontWeight.normal,
                          ),
                    ),
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  Widget _buildItemsList(Order order) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Items', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.spacing12),
            ...order.items.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: AppTheme.spacing8),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                        ),
                        child: const Icon(Icons.medication, size: 16, color: AppTheme.primary),
                      ),
                      const SizedBox(width: AppTheme.spacing12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(item.medicineName, style: Theme.of(context).textTheme.bodyMedium),
                            Text('Qty: ${item.quantity}', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary)),
                          ],
                        ),
                      ),
                      Text('${item.totalPrice.toStringAsFixed(2)} MAD', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }

  Widget _buildAmountSummary(Order order) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Payment Summary', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.spacing12),
            const Divider(),
            const SizedBox(height: AppTheme.spacing8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                Text(
                  '${order.totalAmount.toStringAsFixed(2)} MAD',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.primary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRiderInfo(RiderInfo rider) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Delivery Rider', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.spacing12),
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                  child: const Icon(Icons.delivery_dining, color: AppTheme.primary),
                ),
                const SizedBox(width: AppTheme.spacing12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(rider.name, style: Theme.of(context).textTheme.titleMedium),
                      if (rider.phone.isNotEmpty)
                        Text(rider.phone, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary)),
                      if (rider.vehicleNumber != null)
                        Text(rider.vehicleNumber!, style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary)),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPharmacyInfo(Order order) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Pharmacy', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: AppTheme.spacing12),
            _infoRow(Icons.local_pharmacy, 'Name', order.pharmacyName!),
            if (order.pharmacyPhone != null)
              _infoRow(Icons.phone, 'Phone', order.pharmacyPhone!),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing8),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.textSecondary),
          const SizedBox(width: AppTheme.spacing8),
          Text('$label: ', style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary)),
          Expanded(child: Text(value, style: Theme.of(context).textTheme.bodyMedium)),
        ],
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'delivered': return AppTheme.success;
      case 'in_transit':
      case 'picked_up': return AppTheme.info;
      case 'cancelled': return AppTheme.error;
      case 'confirmed':
      case 'preparing': return AppTheme.warning;
      default: return AppTheme.primary;
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'delivered': return Icons.done_all;
      case 'in_transit': return Icons.local_shipping;
      case 'picked_up': return Icons.shopping_bag;
      case 'preparing': return Icons.medication;
      case 'confirmed': return Icons.check_circle;
      case 'cancelled': return Icons.cancel;
      default: return Icons.receipt_long;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'On the Way';
      case 'picked_up': return 'Picked Up';
      case 'preparing': return 'Preparing';
      case 'confirmed': return 'Confirmed';
      case 'cancelled': return 'Cancelled';
      default: return 'Order Placed';
    }
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}  ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
  }
}
