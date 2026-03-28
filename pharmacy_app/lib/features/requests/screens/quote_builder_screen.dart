import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/input_field.dart';
import '../../../providers/prescription_provider.dart';

class QuoteBuilderScreen extends StatefulWidget {
  final dynamic prescription;

  const QuoteBuilderScreen({super.key, required this.prescription});

  @override
  State<QuoteBuilderScreen> createState() => _QuoteBuilderScreenState();
}

class _QuoteBuilderScreenState extends State<QuoteBuilderScreen> {
  final List<Map<String, dynamic>> _items = [];
  final _deliveryFeeController = TextEditingController(text: '10');

  @override
  void dispose() {
    _deliveryFeeController.dispose();
    super.dispose();
  }

  void _addItem() {
    setState(() {
      _items.add({
        'medicineName': '',
        'quantity': 1,
        'unitPrice': 0.0,
        'totalPrice': 0.0,
      });
    });
  }

  void _removeItem(int index) {
    setState(() {
      _items.removeAt(index);
    });
  }

  double get _subtotal {
    return _items.fold(0, (sum, item) => sum + (item['totalPrice'] as num).toDouble());
  }

  double get _total {
    return _subtotal + (double.tryParse(_deliveryFeeController.text) ?? 0);
  }

  Future<void> _sendQuote() async {
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one item')),
      );
      return;
    }

    final success = await context.read<PrescriptionProvider>().sendQuote(
          prescriptionId: (widget.prescription is Map
              ? widget.prescription['id']
              : widget.prescription.id).toString(),
          items: _items,
          deliveryFee: double.tryParse(_deliveryFeeController.text) ?? 10,
        );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Quote sent successfully!'),
          backgroundColor: AppTheme.success,
        ),
      );
      Navigator.pop(context);
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Build Quote'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Add Medicines',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppTheme.spacing16),
            ..._items.asMap().entries.map((entry) {
              return _buildItemCard(entry.key, entry.value);
            }),
            const SizedBox(height: AppTheme.spacing16),
            OutlinedButton.icon(
              onPressed: _addItem,
              icon: const Icon(Icons.add),
              label: const Text('Add Medicine'),
            ),
            const SizedBox(height: AppTheme.spacing24),
            InputField(
              controller: _deliveryFeeController,
              label: 'Delivery Fee (MAD)',
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: AppTheme.spacing24),
            _buildSummary(),
            const SizedBox(height: AppTheme.spacing24),
            PrimaryButton(
              text: 'Send Quote',
              onPressed: _sendQuote,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildItemCard(int index, Map<String, dynamic> item) {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing12),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Medicine ${index + 1}'),
                IconButton(
                  icon: const Icon(Icons.delete, color: AppTheme.error),
                  onPressed: () => _removeItem(index),
                ),
              ],
            ),
            InputField(
              label: 'Medicine Name',
              onChanged: (value) {
                setState(() => item['medicineName'] = value);
              },
            ),
            const SizedBox(height: AppTheme.spacing8),
            Row(
              children: [
                Expanded(
                  child: InputField(
                    label: 'Quantity',
                    keyboardType: TextInputType.number,
                    onChanged: (value) {
                      setState(() {
                        item['quantity'] = int.tryParse(value) ?? 1;
                        item['totalPrice'] = item['quantity'] * item['unitPrice'];
                      });
                    },
                  ),
                ),
                const SizedBox(width: AppTheme.spacing8),
                Expanded(
                  child: InputField(
                    label: 'Unit Price',
                    keyboardType: TextInputType.number,
                    onChanged: (value) {
                      setState(() {
                        item['unitPrice'] = double.tryParse(value) ?? 0;
                        item['totalPrice'] = item['quantity'] * item['unitPrice'];
                      });
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummary() {
    return AppCard(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          children: [
            _buildSummaryRow('Subtotal', _subtotal),
            _buildSummaryRow('Delivery Fee', double.tryParse(_deliveryFeeController.text) ?? 0),
            const Divider(height: AppTheme.spacing24),
            _buildSummaryRow('Total', _total, isTotal: true),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, double amount, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: isTotal
                ? Theme.of(context).textTheme.titleMedium
                : Theme.of(context).textTheme.bodyMedium,
          ),
          Text(
            '${amount.toStringAsFixed(2)} MAD',
            style: isTotal
                ? Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.primary)
                : Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}
