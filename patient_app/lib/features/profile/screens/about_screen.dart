import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/localization/app_localizations.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('about')),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        children: [
          Center(
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppTheme.spacing24),
                  decoration: BoxDecoration(
                    color: AppTheme.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.local_hospital,
                    size: 60,
                    color: AppTheme.primary,
                  ),
                ),
                const SizedBox(height: AppTheme.spacing16),
                Text(
                  'OrdoGo Medicine app',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primary,
                      ),
                ),
                const SizedBox(height: AppTheme.spacing8),
                Text(
                  '${l10n.translate('version')} 1.0.0',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppTheme.spacing32),
          AppCard(
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.spacing20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    l10n.translate('about_app'),
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: AppTheme.spacing12),
                  Text(
                    l10n.translate('about_description'),
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppTheme.textSecondary,
                          height: 1.5,
                        ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppTheme.spacing16),
          _buildInfoCard(
            context,
            icon: Icons.security,
            title: l10n.translate('secure_private'),
            description: l10n.translate('secure_private_desc'),
          ),
          _buildInfoCard(
            context,
            icon: Icons.verified,
            title: l10n.translate('verified_pharmacies'),
            description: l10n.translate('verified_pharmacies_desc'),
          ),
          _buildInfoCard(
            context,
            icon: Icons.delivery_dining,
            title: l10n.translate('fast_delivery'),
            description: l10n.translate('fast_delivery_desc'),
          ),
          _buildInfoCard(
            context,
            icon: Icons.support_agent,
            title: l10n.translate('support_247'),
            description: l10n.translate('support_247_desc'),
          ),
          const SizedBox(height: AppTheme.spacing24),
          _buildLinkCard(
            context,
            title: l10n.translate('terms_of_service'),
            onTap: () => _showSnackBar(context, l10n.translate('opening_terms')),
          ),
          _buildLinkCard(
            context,
            title: l10n.translate('privacy_policy'),
            onTap: () => _showSnackBar(context, l10n.translate('opening_privacy')),
          ),
          _buildLinkCard(
            context,
            title: l10n.translate('licenses'),
            onTap: () => _showSnackBar(context, l10n.translate('opening_licenses')),
          ),
          const SizedBox(height: AppTheme.spacing24),
          Center(
            child: Text(
              l10n.translate('copyright'),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: AppCard(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppTheme.spacing12),
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                ),
                child: Icon(icon, color: AppTheme.primary, size: 24),
              ),
              const SizedBox(width: AppTheme.spacing16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: AppTheme.spacing4),
                    Text(
                      description,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.textSecondary,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLinkCard(
    BuildContext context, {
    required String title,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing8),
      child: AppCard(
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
          child: Padding(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: AppTheme.textSecondary,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
