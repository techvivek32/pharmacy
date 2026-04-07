import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';

class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  static const List<Map<String, dynamic>> _transactions = [
    {'label': 'Delivery ORD-001', 'amount': 10.0, 'type': 'credit', 'date': '2024-01-15'},
    {'label': 'Delivery ORD-002', 'amount': 15.0, 'type': 'credit', 'date': '2024-01-16'},
    {'label': 'Withdrawal', 'amount': 20.0, 'type': 'debit', 'date': '2024-01-17'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            child: AppCard(
              padding: const EdgeInsets.all(AppTheme.spacing24),
              color: AppTheme.primary,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Available Balance', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: AppTheme.spacing8),
                  const Text('5.00 MAD', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: AppTheme.spacing16),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: () {},
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white54),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMedium)),
                      ),
                      child: const Text('Withdraw'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text('Transactions', style: Theme.of(context).textTheme.titleMedium),
            ),
          ),
          const SizedBox(height: AppTheme.spacing12),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
              itemCount: _transactions.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppTheme.spacing8),
              itemBuilder: (context, index) {
                final tx = _transactions[index];
                final isCredit = tx['type'] == 'credit';
                return AppCard(
                  padding: const EdgeInsets.all(AppTheme.spacing12),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: (isCredit ? AppTheme.success : AppTheme.error).withValues(alpha: 0.1),
                        child: Icon(
                          isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                          color: isCredit ? AppTheme.success : AppTheme.error,
                        ),
                      ),
                      const SizedBox(width: AppTheme.spacing12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(tx['label'], style: Theme.of(context).textTheme.titleMedium),
                            Text(tx['date'], style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),
                      ),
                      Text(
                        '${isCredit ? '+' : '-'}${tx['amount']} MAD',
                        style: TextStyle(fontWeight: FontWeight.bold, color: isCredit ? AppTheme.success : AppTheme.error),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
