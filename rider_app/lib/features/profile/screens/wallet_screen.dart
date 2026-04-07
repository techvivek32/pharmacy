import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

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
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(AppTheme.spacing16),
            padding: const EdgeInsets.all(AppTheme.spacing24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary, AppTheme.primaryDark],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
            ),
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
                    ),
                    child: const Text('Withdraw'),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text('Transactions', style: Theme.of(context).textTheme.titleMedium),
            ),
          ),
          const SizedBox(height: AppTheme.spacing8),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16),
              itemCount: _transactions.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final tx = _transactions[index];
                final isCredit = tx['type'] == 'credit';
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor: (isCredit ? AppTheme.success : AppTheme.error).withOpacity(0.1),
                    child: Icon(
                      isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                      color: isCredit ? AppTheme.success : AppTheme.error,
                    ),
                  ),
                  title: Text(tx['label']),
                  subtitle: Text(tx['date'], style: Theme.of(context).textTheme.bodySmall),
                  trailing: Text(
                    '${isCredit ? '+' : '-'}${tx['amount']} MAD',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isCredit ? AppTheme.success : AppTheme.error,
                    ),
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
