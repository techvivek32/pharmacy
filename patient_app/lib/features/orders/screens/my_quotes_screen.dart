import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../services/api_service.dart';

class MyQuotesScreen extends StatefulWidget {
  const MyQuotesScreen({super.key});

  @override
  State<MyQuotesScreen> createState() => _MyQuotesScreenState();
}

class _MyQuotesScreenState extends State<MyQuotesScreen> {
  List<dynamic> _quotes = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchQuotes();
  }

  Future<void> _fetchQuotes() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await ApiService.get('/patient/quotes');
      if (res.success) {
        setState(() => _quotes = List<dynamic>.from(res.data?['quotes'] ?? []));
      } else {
        setState(() => _error = res.message);
      }
    } catch (_) {
      setState(() => _error = 'Failed to load quotes');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _confirmQuote(dynamic quote) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Confirm Order'),
        content: Text(
          'Confirm order from ${quote['pharmacyName']} for ${(quote['totalAmount'] as num).toStringAsFixed(2)} MAD?',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    _showLoading('Confirming order...');
    try {
      final res = await ApiService.post('/patient/quotes/${quote['id']}/confirm', {'paymentMethod': 'cash'});
      Navigator.pop(context); // close loading
      if (res.success) {
        _showSuccess('Order confirmed! 🎉');
        _fetchQuotes();
      } else {
        _showError(res.message);
      }
    } catch (_) {
      Navigator.pop(context);
      _showError('Failed to confirm order');
    }
  }

  Future<void> _cancelQuote(dynamic quote) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Quote'),
        content: const Text('Cancel this quote? We\'ll send your request to the next nearest pharmacy.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Keep')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Cancel Quote', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    _showLoading('Cancelling...');
    try {
      final res = await ApiService.post('/patient/quotes/${quote['id']}/cancel', {});
      Navigator.pop(context);
      if (res.success) {
        final reassigned = res.data?['reassigned'] == true;
        _showSuccess(reassigned
            ? 'Quote cancelled. Request sent to next pharmacy!'
            : 'Quote cancelled.');
        _fetchQuotes();
      } else {
        _showError(res.message);
      }
    } catch (_) {
      Navigator.pop(context);
      _showError('Failed to cancel quote');
    }
  }

  void _showLoading(String msg) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        content: Row(children: [
          const CircularProgressIndicator(),
          const SizedBox(width: 16),
          Text(msg),
        ]),
      ),
    );
  }

  void _showSuccess(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.green),
    );
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: AppTheme.error),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Quotes'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: _fetchQuotes),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 60, color: AppTheme.error),
                      const SizedBox(height: 12),
                      Text(_error!, style: const TextStyle(color: AppTheme.error)),
                      const SizedBox(height: 16),
                      ElevatedButton(onPressed: _fetchQuotes, child: const Text('Retry')),
                    ],
                  ),
                )
              : _quotes.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt_long_outlined, size: 80, color: Colors.grey.shade300),
                          const SizedBox(height: 16),
                          Text('No quotes yet', style: Theme.of(context).textTheme.titleLarge),
                          const SizedBox(height: 8),
                          Text(
                            'Quotes from pharmacies will appear here',
                            style: TextStyle(color: Colors.grey.shade500),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _fetchQuotes,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _quotes.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, i) => _buildQuoteCard(_quotes[i]),
                      ),
                    ),
    );
  }

  Widget _buildQuoteCard(dynamic quote) {
    final items = List<dynamic>.from(quote['items'] ?? []);
    final pharmacyName = quote['pharmacyName']?.toString() ?? 'Unknown Pharmacy';
    final totalAmount = (quote['totalAmount'] as num?)?.toDouble() ?? 0;
    final deliveryFee = (quote['deliveryFee'] as num?)?.toDouble() ?? 0;
    final subtotal = (quote['subtotal'] as num?)?.toDouble() ?? 0;
    final expiresAt = quote['expiresAt'] != null
        ? DateTime.tryParse(quote['expiresAt'].toString())
        : null;

    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Pharmacy header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.local_pharmacy, color: AppTheme.primary, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(pharmacyName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      if (expiresAt != null)
                        Text(
                          _expiryText(expiresAt),
                          style: TextStyle(
                            fontSize: 12,
                            color: _isExpiringSoon(expiresAt) ? Colors.orange : Colors.grey,
                          ),
                        ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.green.shade200),
                  ),
                  child: Text(
                    '${totalAmount.toStringAsFixed(2)} MAD',
                    style: TextStyle(
                        color: Colors.green.shade700,
                        fontWeight: FontWeight.bold,
                        fontSize: 14),
                  ),
                ),
              ],
            ),

            const Divider(height: 20),

            // Medicine items
            ...items.map((item) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      const Icon(Icons.medication_outlined, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          '${item['medicineName']} × ${item['quantity']}',
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                      Text(
                        '${(item['totalPrice'] as num).toStringAsFixed(2)} MAD',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                )),

            const Divider(height: 16),

            // Price breakdown
            _priceRow('Subtotal', subtotal),
            _priceRow('Delivery Fee', deliveryFee),
            const SizedBox(height: 4),
            _priceRow('Total', totalAmount, isTotal: true),

            const SizedBox(height: 16),

            // Action buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _cancelQuote(quote),
                    icon: const Icon(Icons.close, size: 18),
                    label: const Text('Cancel'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _confirmQuote(quote),
                    icon: const Icon(Icons.check, size: 18),
                    label: const Text('Confirm'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _priceRow(String label, double amount, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
                  fontSize: isTotal ? 15 : 13,
                  color: isTotal ? Colors.black : Colors.grey.shade600)),
          Text('${amount.toStringAsFixed(2)} MAD',
              style: TextStyle(
                  fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
                  fontSize: isTotal ? 15 : 13,
                  color: isTotal ? AppTheme.primary : Colors.grey.shade700)),
        ],
      ),
    );
  }

  String _expiryText(DateTime expiresAt) {
    final diff = expiresAt.difference(DateTime.now());
    if (diff.isNegative) return 'Expired';
    if (diff.inMinutes < 60) return 'Expires in ${diff.inMinutes}m';
    return 'Expires in ${diff.inHours}h';
  }

  bool _isExpiringSoon(DateTime expiresAt) {
    return expiresAt.difference(DateTime.now()).inMinutes < 30;
  }
}
