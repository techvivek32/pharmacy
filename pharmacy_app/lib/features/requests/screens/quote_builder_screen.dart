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
  final List<TextEditingController> _nameControllers = [];
  final List<TextEditingController> _qtyControllers = [];
  final List<TextEditingController> _priceControllers = [];

  bool _isEdit = false;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadExistingQuote();
  }

  @override
  void dispose() {
    _deliveryFeeController.dispose();
    for (final c in _nameControllers) c.dispose();
    for (final c in _qtyControllers) c.dispose();
    for (final c in _priceControllers) c.dispose();
    super.dispose();
  }

  void _loadExistingQuote() {
    final existingQuote = widget.prescription is Map
        ? widget.prescription['existingQuote']
        : null;

    if (existingQuote != null) {
      _isEdit = true;
      final items = existingQuote['items'] as List? ?? [];
      final deliveryFee = existingQuote['deliveryFee'];
      _deliveryFeeController.text = (deliveryFee ?? 10).toString();

      for (final item in items) {
        _addItemWithValues(
          name: item['medicineName']?.toString() ?? '',
          qty: (item['quantity'] ?? 1).toString(),
          price: (item['unitPrice'] ?? 0).toString(),
        );
      }
    }
  }

  void _addItem() => _addItemWithValues(name: '', qty: '1', price: '0');

  void _addItemWithValues({
    required String name,
    required String qty,
    required String price,
  }) {
    final nameCtrl = TextEditingController(text: name);
    final qtyCtrl = TextEditingController(text: qty);
    final priceCtrl = TextEditingController(text: price);

    final q = int.tryParse(qty) ?? 1;
    final p = double.tryParse(price) ?? 0.0;

    setState(() {
      _nameControllers.add(nameCtrl);
      _qtyControllers.add(qtyCtrl);
      _priceControllers.add(priceCtrl);
      _items.add({
        'medicineName': name,
        'quantity': q,
        'unitPrice': p,
        'totalPrice': q * p,
      });
    });
  }

  void _removeItem(int index) {
    _nameControllers[index].dispose();
    _qtyControllers[index].dispose();
    _priceControllers[index].dispose();
    setState(() {
      _nameControllers.removeAt(index);
      _qtyControllers.removeAt(index);
      _priceControllers.removeAt(index);
      _items.removeAt(index);
    });
  }

  void _updateItem(int index) {
    final q = int.tryParse(_qtyControllers[index].text) ?? 1;
    final p = double.tryParse(_priceControllers[index].text) ?? 0.0;
    setState(() {
      _items[index]['medicineName'] = _nameControllers[index].text;
      _items[index]['quantity'] = q;
      _items[index]['unitPrice'] = p;
      _items[index]['totalPrice'] = q * p;
    });
  }

  double get _subtotal =>
      _items.fold(0, (sum, item) => sum + (item['totalPrice'] as num).toDouble());

  double get _total =>
      _subtotal + (double.tryParse(_deliveryFeeController.text) ?? 0);

  Future<void> _submit() async {
    if (_items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please add at least one item')),
      );
      return;
    }

    for (int i = 0; i < _items.length; i++) {
      if (_items[i]['medicineName'].toString().trim().isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Enter medicine name for item ${i + 1}')),
        );
        return;
      }
    }

    setState(() => _isLoading = true);

    final prescriptionId = (widget.prescription is Map
            ? widget.prescription['id']
            : widget.prescription.id)
        .toString();

    final success = await context.read<PrescriptionProvider>().sendQuote(
          prescriptionId: prescriptionId,
          items: List<Map<String, dynamic>>.from(_items),
          deliveryFee: double.tryParse(_deliveryFeeController.text) ?? 10,
        );

    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_isEdit
              ? 'Quote updated successfully!'
              : 'Quote sent successfully!'),
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
        title: Text(_isEdit ? 'Edit Quote' : 'Send Quote'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_isEdit)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: AppTheme.spacing16),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.edit_note, color: Colors.blue.shade600),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'You already sent a quote. Edit and update it below.',
                        style: TextStyle(
                            color: Colors.blue.shade700, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),

            Text('Medicines', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: AppTheme.spacing16),

            ..._items.asMap().entries.map((entry) =>
                _buildItemCard(entry.key)),

            const SizedBox(height: AppTheme.spacing12),
            OutlinedButton.icon(
              onPressed: _addItem,
              icon: const Icon(Icons.add),
              label: const Text('Add Medicine'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppTheme.primary,
                side: const BorderSide(color: AppTheme.primary),
                padding: const EdgeInsets.symmetric(
                    horizontal: 20, vertical: 12),
              ),
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
              text: _isEdit ? 'Update Quote' : 'Send Quote',
              icon: _isEdit ? Icons.update : Icons.send,
              onPressed: _isLoading ? null : _submit,
              isLoading: _isLoading,
            ),
            const SizedBox(height: AppTheme.spacing16),
          ],
        ),
      ),
    );
  }

  Widget _buildItemCard(int index) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: AppCard(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Medicine ${index + 1}',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  IconButton(
                    icon: const Icon(Icons.delete_outline, color: AppTheme.error),
                    onPressed: () => _removeItem(index),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing8),
              InputField(
                controller: _nameControllers[index],
                label: 'Medicine Name',
                onChanged: (_) => _updateItem(index),
              ),
              const SizedBox(height: AppTheme.spacing8),
              Row(
                children: [
                  Expanded(
                    child: InputField(
                      controller: _qtyControllers[index],
                      label: 'Qty',
                      keyboardType: TextInputType.number,
                      onChanged: (_) => _updateItem(index),
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing8),
                  Expanded(
                    child: InputField(
                      controller: _priceControllers[index],
                      label: 'Unit Price',
                      keyboardType: TextInputType.number,
                      onChanged: (_) => _updateItem(index),
                    ),
                  ),
                ],
              ),
              if ((_items[index]['totalPrice'] as num) > 0)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    'Total: ${(_items[index]['totalPrice'] as num).toStringAsFixed(2)} MAD',
                    style: TextStyle(
                        color: AppTheme.primary,
                        fontWeight: FontWeight.w500,
                        fontSize: 13),
                  ),
                ),
            ],
          ),
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
            _summaryRow('Subtotal', _subtotal),
            _summaryRow(
                'Delivery Fee',
                double.tryParse(_deliveryFeeController.text) ?? 0),
            const Divider(height: AppTheme.spacing24),
            _summaryRow('Total', _total, isTotal: true),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, double amount, {bool isTotal = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: isTotal
                  ? Theme.of(context).textTheme.titleMedium
                  : Theme.of(context).textTheme.bodyMedium),
          Text(
            '${amount.toStringAsFixed(2)} MAD',
            style: isTotal
                ? Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(color: AppTheme.primary)
                : Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }
}
