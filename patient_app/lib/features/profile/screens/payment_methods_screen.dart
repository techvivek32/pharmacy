import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/localization/app_localizations.dart';

class PaymentMethodsScreen extends StatefulWidget {
  const PaymentMethodsScreen({super.key});

  @override
  State<PaymentMethodsScreen> createState() => _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends State<PaymentMethodsScreen> {
  final List<Map<String, dynamic>> _paymentMethods = [
    {
      'id': '1',
      'type': 'card',
      'cardNumber': '**** **** **** 1234',
      'cardHolder': 'John Doe',
      'expiryDate': '12/25',
      'isDefault': true,
    },
    {
      'id': '2',
      'type': 'card',
      'cardNumber': '**** **** **** 5678',
      'cardHolder': 'John Doe',
      'expiryDate': '06/26',
      'isDefault': false,
    },
  ];

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('payment_methods')),
      ),
      body: Column(
        children: [
          Expanded(
            child: _paymentMethods.isEmpty
                ? _buildEmptyState()
                : ListView.builder(
                    padding: const EdgeInsets.all(AppTheme.spacing16),
                    itemCount: _paymentMethods.length,
                    itemBuilder: (context, index) {
                      return _buildPaymentCard(_paymentMethods[index]);
                    },
                  ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            child: PrimaryButton(
              text: l10n.translate('add_payment_method'),
              onPressed: _addPaymentMethod,
              icon: Icons.add_card,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentCard(Map<String, dynamic> payment) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: AppCard(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppTheme.spacing12),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                    ),
                    child: const Icon(
                      Icons.credit_card,
                      color: AppTheme.primary,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          payment['cardNumber'],
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: AppTheme.spacing4),
                        Text(
                          '${AppLocalizations.of(context)!.translate('expires')} ${payment['expiryDate']}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: AppTheme.textSecondary,
                              ),
                        ),
                      ],
                    ),
                  ),
                  if (payment['isDefault'])
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.spacing8,
                        vertical: AppTheme.spacing4,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.success.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                      ),
                      child: Text(
                        AppLocalizations.of(context)!.translate('default_label'),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppTheme.success,
                            ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing16),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _setDefault(payment),
                      icon: const Icon(Icons.check_circle_outline, size: 18),
                      label: Text(AppLocalizations.of(context)!.translate('set_default')),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.primary,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacing8),
                  OutlinedButton(
                    onPressed: () => _deletePaymentMethod(payment),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.error,
                    ),
                    child: const Icon(Icons.delete, size: 18),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.credit_card_off,
            size: 80,
            color: AppTheme.textSecondary.withValues(alpha: 0.5),
          ),
          const SizedBox(height: AppTheme.spacing16),
          Text(
            AppLocalizations.of(context)!.translate('no_payment_methods'),
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacing8),
          Text(
            AppLocalizations.of(context)!.translate('add_payment_desc'),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textSecondary,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _addPaymentMethod() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context)!.translate('payment_coming_soon'))),
    );
  }

  void _setDefault(Map<String, dynamic> payment) {
    setState(() {
      for (var method in _paymentMethods) {
        method['isDefault'] = method['id'] == payment['id'];
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context)!.translate('default_payment_updated'))),
    );
  }

  void _deletePaymentMethod(Map<String, dynamic> payment) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.translate('delete_payment_method')),
        content: Text('${l10n.translate('delete_payment_confirm')} ${payment['cardNumber']}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.translate('cancel')),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _paymentMethods.removeWhere((p) => p['id'] == payment['id']);
              });
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text(l10n.translate('payment_method_deleted'))),
              );
            },
            child: Text(l10n.translate('delete'), style: const TextStyle(color: AppTheme.error)),
          ),
        ],
      ),
    );
  }
}
