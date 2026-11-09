import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/localization/app_localizations.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.translate('privacy_policy'))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.translate('privacy_policy'), style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: AppTheme.spacing8),
            Text(l10n.translate('privacy_last_updated'), style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: AppTheme.spacing24),
            _section(context, l10n.translate('privacy_s1_title'), l10n.translate('privacy_s1_body')),
            _section(context, l10n.translate('privacy_s2_title'), l10n.translate('privacy_s2_body')),
            _section(context, l10n.translate('privacy_s3_title'), l10n.translate('privacy_s3_body')),
            _section(context, l10n.translate('privacy_s4_title'), l10n.translate('privacy_s4_body')),
            _section(context, l10n.translate('privacy_s5_title'), l10n.translate('privacy_s5_body')),
            _section(context, l10n.translate('privacy_s6_title'), l10n.translate('privacy_s6_body')),
          ],
        ),
      ),
    );
  }

  Widget _section(BuildContext context, String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: AppTheme.spacing8),
          Text(body, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: AppTheme.textSecondary)),
        ],
      ),
    );
  }
}
