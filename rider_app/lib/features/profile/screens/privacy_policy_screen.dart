import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Privacy Policy')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Privacy Policy', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: AppTheme.spacing8),
            Text('Last updated: January 2024', style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: AppTheme.spacing24),
            _section(context, '1. Information We Collect',
                'We collect information you provide directly to us, such as your name, email address, phone number, and location data when you use our rider application.'),
            _section(context, '2. How We Use Your Information',
                'We use the information we collect to provide, maintain, and improve our services, process deliveries, communicate with you, and ensure the safety of our platform.'),
            _section(context, '3. Location Data',
                'Our app collects location data to enable delivery tracking and to match you with nearby delivery requests. This data is only collected while the app is in use.'),
            _section(context, '4. Data Sharing',
                'We do not sell your personal information. We may share your information with pharmacies and patients only as necessary to complete deliveries.'),
            _section(context, '5. Data Security',
                'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'),
            _section(context, '6. Contact Us',
                'If you have any questions about this Privacy Policy, please contact us at support@ordogo.com.'),
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
