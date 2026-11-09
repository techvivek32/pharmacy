import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/app_card.dart';
import '../../services/api_service.dart';
import '../../core/localization/app_localizations.dart';

class OrderDetailScreen extends StatefulWidget {
  final dynamic order;
  const OrderDetailScreen({super.key, required this.order});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  late dynamic _order;
  bool _isConfirming = false;

  @override
  void initState() {
    super.initState();
    _order = widget.order;
  }

  Future<void> _confirmPayment() async {
    final l10n = AppLocalizations.of(context)!;
    final orderId = _order['id']?.toString() ?? _order['_id']?.toString();
    if (orderId == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(l10n.translate('confirm_payment')),
        content: Text(l10n.translate('confirm_payment_desc')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l10n.translate('cancel')),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: Text(l10n.translate('confirm')),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    setState(() => _isConfirming = true);
    final res = await ApiService.post('/pharmacy/orders/$orderId/confirm-payment', {});
    setState(() => _isConfirming = false);

    if (!mounted) return;

    if (res.success) {
      setState(() {
        _order = Map<String, dynamic>.from(_order as Map)
          ..['paymentStatus'] = 'paid'
          ..['status'] = 'confirmed';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.translate('payment_confirmed_order')),
          backgroundColor: AppTheme.success,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.message), backgroundColor: AppTheme.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final status = _order['status'] ?? 'confirmed';
    final paymentStatus = _order['paymentStatus']?.toString() ?? 'pending';
    final items = (_order['items'] as List?) ?? [];
    final prescriptionImage = _order['prescriptionImage'] as String?;
    final paymentProofUrl = _order['paymentProofUrl'] as String?;
    final medicines = (_order['medicines'] as List?) ?? [];
    final subtotal = (_order['subtotal'] ?? 0).toDouble();
    final deliveryFee = (_order['deliveryFee'] ?? 0).toDouble();
    final totalAmount = (_order['totalAmount'] ?? 0).toDouble();
    // Service fee (platform commission) = what the patient paid on top of
    // the medicine subtotal and delivery fee.
    final rawServiceFee = totalAmount - subtotal - deliveryFee;
    final serviceFee = rawServiceFee < 0 ? 0.0 : rawServiceFee;
    final paymentMethod = _order['paymentMethod']?.toString();
    final createdAt = _order['createdAt'] != null
        ? DateTime.tryParse(_order['createdAt'].toString())?.toLocal()
        : null;

    // Rejected / expired / cancelled request: no order, no payment
    final isClosedRequest = _order['isClosedRequest'] == true;
    final rejectionReason = _order['rejectionReason']?.toString() ?? '';
    final showConfirmButton = !isClosedRequest &&
        paymentProofUrl != null &&
        paymentProofUrl.isNotEmpty &&
        paymentStatus == 'pending';

    return Scaffold(
      appBar: AppBar(title: Text(l10n.translate('order_details'))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppTheme.spacing20),
              decoration: BoxDecoration(
                color: _statusColor(status),
                borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
              ),
              child: Column(
                children: [
                  const Icon(Icons.receipt_long, color: Colors.white, size: 36),
                  const SizedBox(height: AppTheme.spacing8),
                  Text(
                    l10n.translate(_statusKey(status.toString())).toUpperCase(),
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  if (_order['orderNumber'] != null) ...[
                    const SizedBox(height: AppTheme.spacing4),
                    Text(
                      '#${_order['orderNumber']}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.85)),
                    ),
                  ],
                  if (isClosedRequest && rejectionReason.isNotEmpty) ...[
                    const SizedBox(height: AppTheme.spacing8),
                    Text(
                      rejectionReason,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AppTheme.spacing16),

            // Order info
            AppCard(
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l10n.translate('order_information'),
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: AppTheme.spacing12),
                    if (createdAt != null)
                      _infoRow(context, Icons.calendar_today, _formatDate(createdAt)),
                    if (paymentMethod != null && paymentMethod.isNotEmpty) ...[
                      const SizedBox(height: AppTheme.spacing8),
                      _infoRow(
                          context,
                          Icons.payment,
                          paymentMethod == 'cash'
                              ? l10n.translate('cash_on_delivery')
                              : paymentMethod == 'manual'
                                  ? l10n.translate('bank_transfer')
                                  : l10n.translate('online_payment')),
                    ],
                    if (!isClosedRequest) ...[
                    const SizedBox(height: AppTheme.spacing8),
                    Row(
                      children: [
                        const Icon(Icons.circle, size: 10,
                            color: AppTheme.textSecondary),
                        const SizedBox(width: AppTheme.spacing8),
                        Text('${l10n.translate('payment')}: ',
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(color: AppTheme.textSecondary)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: paymentStatus == 'paid'
                                ? AppTheme.success.withValues(alpha: 0.1)
                                : AppTheme.warning.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            l10n.translate(paymentStatus).toUpperCase(),
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: paymentStatus == 'paid'
                                  ? AppTheme.success
                                  : AppTheme.warning,
                            ),
                          ),
                        ),
                      ],
                    ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacing16),

            // Prescription image
            if (prescriptionImage != null && prescriptionImage.isNotEmpty) ...[
              _imageCard(context, l10n.translate('prescription'), prescriptionImage),
              const SizedBox(height: AppTheme.spacing16),
            ],

            // Payment proof + confirm button
            if (paymentProofUrl != null && paymentProofUrl.isNotEmpty) ...[
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(
                          AppTheme.spacing16, AppTheme.spacing16,
                          AppTheme.spacing16, AppTheme.spacing12),
                      child: Row(
                        children: [
                          const Icon(Icons.receipt, color: AppTheme.primary, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(l10n.translate('payment_proof'),
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium
                                    ?.copyWith(fontWeight: FontWeight.bold)),
                          ),
                          if (paymentStatus == 'paid')
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppTheme.success.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.check_circle,
                                      size: 13, color: AppTheme.success),
                                  const SizedBox(width: 4),
                                  Text(l10n.translate('verified'),
                                      style: const TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.success)),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                    ClipRRect(
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(
                            showConfirmButton ? 0 : AppTheme.radiusLarge),
                        bottomRight: Radius.circular(
                            showConfirmButton ? 0 : AppTheme.radiusLarge),
                      ),
                      child: Image.network(
                        paymentProofUrl,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        loadingBuilder: (_, child, progress) => progress == null
                            ? child
                            : Container(
                                height: 200,
                                color: AppTheme.background,
                                child: const Center(
                                    child: CircularProgressIndicator()),
                              ),
                        errorBuilder: (_, __, ___) => Container(
                          height: 120,
                          color: AppTheme.background,
                          child: const Center(
                              child: Icon(Icons.broken_image,
                                  color: AppTheme.textHint, size: 40)),
                        ),
                      ),
                    ),
                    // Confirm payment button inside the card
                    if (showConfirmButton)
                      Padding(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        child: SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _isConfirming ? null : _confirmPayment,
                            icon: _isConfirming
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                        strokeWidth: 2, color: Colors.white),
                                  )
                                : const Icon(Icons.check_circle_outline, size: 20),
                            label: Text(_isConfirming
                                ? l10n.translate('confirming')
                                : l10n.translate('confirm_payment_received')),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: AppTheme.spacing16),
            ],

            // Medicines list
            if (medicines.isNotEmpty) ...[
              AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(AppTheme.spacing16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.medication,
                              color: AppTheme.primary, size: 20),
                          const SizedBox(width: 8),
                          Text(l10n.translate('requested_medicines'),
                              style: Theme.of(context)
                                  .textTheme
                                  .titleMedium
                                  ?.copyWith(fontWeight: FontWeight.bold)),
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing12),
                      ...medicines.map((m) => Container(
                            margin: const EdgeInsets.only(bottom: AppTheme.spacing8),
                            padding: const EdgeInsets.symmetric(
                                horizontal: AppTheme.spacing12,
                                vertical: AppTheme.spacing12),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.05),
                              borderRadius:
                                  BorderRadius.circular(AppTheme.radiusMedium),
                              border: Border.all(
                                  color: AppTheme.primary.withValues(alpha: 0.15)),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary.withValues(alpha: 0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(Icons.medication_outlined,
                                      size: 16, color: AppTheme.primary),
                                ),
                                const SizedBox(width: AppTheme.spacing12),
                                Expanded(
                                  child: Text(m['name']?.toString() ?? '',
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w500,
                                          fontSize: 14)),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(
                                        AppTheme.radiusSmall),
                                  ),
                                  child: Text(
                                      '${l10n.translate('qty')}: ${m['quantity'] ?? 1}',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: AppTheme.primary)),
                                ),
                              ],
                            ),
                          )),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: AppTheme.spacing16),
            ],

            // Order items
            if (items.isNotEmpty) ...[
              AppCard(
                child: Padding(
                  padding: const EdgeInsets.all(AppTheme.spacing16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(l10n.translate('order_items'),
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: AppTheme.spacing12),
                      ...items.map((item) => Padding(
                            padding:
                                const EdgeInsets.only(bottom: AppTheme.spacing8),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(6),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(
                                        AppTheme.radiusSmall),
                                  ),
                                  child: const Icon(Icons.medication,
                                      size: 14, color: AppTheme.primary),
                                ),
                                const SizedBox(width: AppTheme.spacing8),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item['medicineName'] ?? l10n.translate('unknown'),
                                          style: Theme.of(context)
                                              .textTheme
                                              .bodyMedium),
                                      Text(
                                        '${l10n.translate('qty')}: ${item['quantity'] ?? 1} × ${(item['unitPrice'] ?? 0).toStringAsFixed(2)} MRU',
                                        style: Theme.of(context)
                                            .textTheme
                                            .bodySmall
                                            ?.copyWith(
                                                color: AppTheme.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  '${(item['totalPrice'] ?? 0).toStringAsFixed(2)} MRU',
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodyMedium
                                      ?.copyWith(fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          )),
                      const Divider(height: AppTheme.spacing24),
                      _summaryRow(context, l10n.translate('medicine_subtotal'),
                          '${subtotal.toStringAsFixed(2)} MRU'),
                      _summaryRow(context, l10n.translate('service_fee'),
                          '${serviceFee.toStringAsFixed(2)} MRU'),
                      _summaryRow(context, l10n.translate('delivery_fee'),
                          '${deliveryFee.toStringAsFixed(2)} MRU'),
                      const Divider(height: AppTheme.spacing16),
                      _summaryRow(context, l10n.translate('total'),
                          '${totalAmount.toStringAsFixed(2)} MRU',
                          isTotal: true),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _infoRow(BuildContext context, IconData icon, String value) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.textSecondary),
        const SizedBox(width: AppTheme.spacing8),
        Text(value, style: Theme.of(context).textTheme.bodyMedium),
      ],
    );
  }

  Widget _imageCard(BuildContext context, String title, String url) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(AppTheme.spacing16,
                AppTheme.spacing16, AppTheme.spacing16, AppTheme.spacing12),
            child: Text(title,
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(fontWeight: FontWeight.bold)),
          ),
          ClipRRect(
            borderRadius: const BorderRadius.only(
              bottomLeft: Radius.circular(AppTheme.radiusLarge),
              bottomRight: Radius.circular(AppTheme.radiusLarge),
            ),
            child: Image.network(
              url,
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
                child: const Center(
                    child: Icon(Icons.broken_image,
                        color: AppTheme.textHint, size: 40)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(BuildContext context, String label, String value,
      {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: isTotal
                  ? Theme.of(context)
                      .textTheme
                      .titleMedium
                      ?.copyWith(fontWeight: FontWeight.bold)
                  : Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(color: AppTheme.textSecondary)),
          Text(value,
              style: isTotal
                  ? Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold, color: AppTheme.primary)
                  : Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'delivered': return AppTheme.success;
      case 'cancelled':
      case 'rejected': return AppTheme.error;
      case 'expired': return AppTheme.textSecondary;
      case 'in_transit':
      case 'picked_up': return AppTheme.info;
      default: return AppTheme.warning;
    }
  }

  /// Maps a raw order status to its localization key.
  String _statusKey(String status) =>
      status == 'payment_verification' ? 'verifying' : status;

  String _formatDate(DateTime date) {
    final months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    final hour = date.hour % 12 == 0 ? 12 : date.hour % 12;
    final minute = date.minute.toString().padLeft(2, '0');
    final period = date.hour >= 12 ? 'PM' : 'AM';
    return '${date.day} ${months[date.month - 1]} ${date.year}, $hour:$minute $period';
  }
}
