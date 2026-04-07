import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/auth_provider.dart';
import 'edit_profile_screen.dart';
import 'wallet_screen.dart';
import 'order_history_screen.dart';
import 'privacy_policy_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Profile header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppTheme.spacing24),
              color: AppTheme.surface,
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 45,
                    backgroundColor: AppTheme.primary.withOpacity(0.1),
                    child: const Icon(Icons.person, size: 45, color: AppTheme.primary),
                  ),
                  const SizedBox(height: AppTheme.spacing12),
                  Text(
                    user?.fullName ?? 'Rider',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: AppTheme.spacing4),
                  Text(
                    user?.email ?? '',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.textSecondary),
                  ),
                  const SizedBox(height: AppTheme.spacing4),
                  Text(
                    user?.phone ?? '',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(color: AppTheme.textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTheme.spacing8),
            // Menu items
            _MenuItem(
              icon: Icons.edit_outlined,
              label: 'Edit Profile',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const EditProfileScreen())),
            ),
            _MenuItem(
              icon: Icons.account_balance_wallet_outlined,
              label: 'Wallet',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const WalletScreen())),
            ),
            _MenuItem(
              icon: Icons.history,
              label: 'Order History',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const OrderHistoryScreen())),
            ),
            const Divider(height: 1),
            _MenuItem(
              icon: Icons.privacy_tip_outlined,
              label: 'Privacy Policy',
              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PrivacyPolicyScreen())),
            ),
            const Divider(height: 1),
            _MenuItem(
              icon: Icons.logout,
              label: 'Logout',
              color: AppTheme.error,
              onTap: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Logout'),
                    content: const Text('Are you sure you want to logout?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                      TextButton(
                        onPressed: () => Navigator.pop(ctx, true),
                        child: const Text('Logout', style: TextStyle(color: AppTheme.error)),
                      ),
                    ],
                  ),
                );
                if (confirmed == true && context.mounted) {
                  await context.read<AuthProvider>().logout();
                  Navigator.pushReplacementNamed(context, '/login');
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _MenuItem({required this.icon, required this.label, required this.onTap, this.color});

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppTheme.textPrimary;
    return Material(
      color: AppTheme.surface,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppTheme.spacing16, vertical: AppTheme.spacing16),
          child: Row(
            children: [
              Icon(icon, color: c, size: 22),
              const SizedBox(width: AppTheme.spacing16),
              Expanded(child: Text(label, style: TextStyle(fontSize: 15, color: c))),
              Icon(Icons.arrow_forward_ios, size: 14, color: AppTheme.textSecondary.withOpacity(0.5)),
            ],
          ),
        ),
      ),
    );
  }
}
