import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../providers/order_provider.dart';

class PaymentSelectionScreen extends StatefulWidget {
  const PaymentSelectionScreen({super.key});

  @override
  State<PaymentSelectionScreen> createState() => _PaymentSelectionScreenState();
}

class _PaymentSelectionScreenState extends State<PaymentSelectionScreen> {
  String _selectedMethod = 'cash';
  bool _isProcessing = false;

  Future<void> _confirmOrder() async {
    setState(() => _isProcessing = true);

    final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
    final quoteId = args['quoteId'] as String;

    final success = await context.read<OrderProvider>().confirmOrder(
          quoteId: quoteId,
          paymentMethod: _selectedMethod,
        );

    setState(() => _isProcessing = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Order confirmed successfully!'),
          backgroundColor: AppTheme.success,
        ),
      );
      Navigator.pushNamedAndRemoveUntil(
        context,
        '/home',
        (route) => false,
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.read<OrderProvider>().error ?? 'Failed to confirm order'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment Method'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Select Payment Method',
              style: Theme.of(context).textTheme.displaySmall,
            ),
            const SizedBox(height: AppTheme.spacing8),
            Text(
              'Choose how you want to pay',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: AppTheme.spacing32),
            _buildPaymentOption(
              value: 'cash',
              title: 'Cash on Delivery',
              subtitle: 'Pay when you receive your order',
              icon: Icons.money,
            ),
            const SizedBox(height: AppTheme.spacing16),
            _buildPaymentOption(
              value: 'card',
              title: 'Credit/Debit Card',
              subtitle: 'Pay securely with your card',
              icon: Icons.credit_card,
              isDisabled: true,
            ),
            const SizedBox(height: AppTheme.spacing16),
            _buildPaymentOption(
              value: 'mobile',
              title: 'Mobile Payment',
              subtitle: 'Pay with mobile money',
              icon: Icons.phone_android,
              isDisabled: true,
            ),
            const SizedBox(height: AppTheme.spacing32),
            PrimaryButton(
              text: _isProcessing ? 'Processing...' : 'Confirm Order',
              onPressed: _isProcessing ? null : _confirmOrder,
              isLoading: _isProcessing,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentOption({
    required String value,
    required String title,
    required String subtitle,
    required IconData icon,
    bool isDisabled = false,
  }) {
    final isSelected = _selectedMethod == value;

    return AppCard(
      child: InkWell(
        onTap: isDisabled ? null : () => setState(() => _selectedMethod = value),
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        child: Container(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
            border: Border.all(
              color: isSelected ? AppTheme.primary : Colors.transparent,
              width: 2,
            ),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.spacing12),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppTheme.primary.withValues(alpha: 0.1)
                      : AppTheme.background,
                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                ),
                child: Icon(
                  icon,
                  color: isSelected ? AppTheme.primary : AppTheme.textSecondary,
                  size: 28,
                ),
              ),
              const SizedBox(width: AppTheme.spacing16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            color: isDisabled ? AppTheme.textHint : null,
                          ),
                    ),
                    const SizedBox(height: AppTheme.spacing4),
                    Text(
                      subtitle,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: isDisabled ? AppTheme.textHint : null,
                          ),
                    ),
                  ],
                ),
              ),
              if (isDisabled)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.spacing8,
                    vertical: AppTheme.spacing4,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.textHint.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  ),
                  child: Text(
                    'Coming Soon',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: AppTheme.textHint,
                          fontSize: 10,
                        ),
                  ),
                )
              else if (isSelected)
                const Icon(
                  Icons.check_circle,
                  color: AppTheme.primary,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
