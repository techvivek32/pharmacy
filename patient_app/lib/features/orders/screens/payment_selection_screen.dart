import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../providers/order_provider.dart';
import '../../../core/localization/app_localizations.dart';

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
        SnackBar(
          content: Text(AppLocalizations.of(context)!.translate('order_confirmed_success')),
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
          content: Text(context.read<OrderProvider>().error ?? AppLocalizations.of(context)!.translate('failed_confirm_order')),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('payment_method')),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.translate('select_payment_method'),
              style: Theme.of(context).textTheme.displaySmall,
            ),
            const SizedBox(height: AppTheme.spacing8),
            Text(
              l10n.translate('choose_how_to_pay'),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: AppTheme.spacing32),
            _buildPaymentOption(
              value: 'cash',
              title: l10n.translate('cash_on_delivery'),
              subtitle: l10n.translate('pay_when_receive'),
              icon: Icons.money,
            ),
            const SizedBox(height: AppTheme.spacing16),
            _buildPaymentOption(
              value: 'card',
              title: l10n.translate('credit_debit_card'),
              subtitle: l10n.translate('pay_securely_card'),
              icon: Icons.credit_card,
              isDisabled: true,
            ),
            const SizedBox(height: AppTheme.spacing16),
            _buildPaymentOption(
              value: 'mobile',
              title: l10n.translate('mobile_payment'),
              subtitle: l10n.translate('pay_mobile_money'),
              icon: Icons.phone_android,
              isDisabled: true,
            ),
            const SizedBox(height: AppTheme.spacing32),
            PrimaryButton(
              text: _isProcessing ? l10n.translate('processing') : l10n.translate('confirm_order'),
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
                    AppLocalizations.of(context)!.translate('coming_soon'),
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
