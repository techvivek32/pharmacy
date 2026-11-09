import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/localization/app_localizations.dart';
import '../../../services/api_service.dart';

class HelpSupportScreen extends StatefulWidget {
  const HelpSupportScreen({super.key});

  @override
  State<HelpSupportScreen> createState() => _HelpSupportScreenState();
}

class _HelpSupportScreenState extends State<HelpSupportScreen> {
  // Fallbacks; the real values come from the admin panel (Settings →
  // Contact Information) so support details can change without an update.
  String _supportPhone = '+222 00 00 00 00';
  String _supportEmail = 'support@mediexpress.com';

  @override
  void initState() {
    super.initState();
    _loadContactInfo();
  }

  Future<void> _loadContactInfo() async {
    final res = await ApiService.get('/settings');
    if (!mounted || !res.success || res.data == null) return;
    setState(() {
      final phone = (res.data['supportPhone'] ?? '').toString();
      final email = (res.data['supportEmail'] ?? '').toString();
      if (phone.isNotEmpty) _supportPhone = phone;
      if (email.isNotEmpty) _supportEmail = email;
    });
  }

  Future<void> _open(Uri uri) async {
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  /// Digits-only phone for tel:/wa.me links.
  String get _phoneDigits => _supportPhone.replaceAll(RegExp(r'[^0-9+]'), '');

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('help_support')),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        children: [
          _buildContactCard(
            context,
            icon: Icons.phone,
            title: l10n.translate('call_us'),
            subtitle: _supportPhone,
            onTap: () => _open(Uri(scheme: 'tel', path: _phoneDigits)),
          ),
          _buildContactCard(
            context,
            icon: Icons.email,
            title: l10n.translate('email_us'),
            subtitle: _supportEmail,
            onTap: () => _open(Uri(scheme: 'mailto', path: _supportEmail)),
          ),
          _buildContactCard(
            context,
            icon: Icons.chat,
            title: l10n.translate('live_chat'),
            subtitle: l10n.translate('chat_support_desc'),
            // Opens a WhatsApp chat with the support number.
            onTap: () => _open(Uri.parse(
                'https://wa.me/${_phoneDigits.replaceAll('+', '')}')),
          ),
          const SizedBox(height: AppTheme.spacing24),
          Text(
            l10n.translate('faq'),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: AppTheme.spacing16),
          _buildFAQCard(
            context,
            question: l10n.translate('faq_q1'),
            answer: l10n.translate('faq_a1'),
          ),
          _buildFAQCard(
            context,
            question: l10n.translate('faq_q2'),
            answer: l10n.translate('faq_a2'),
          ),
          _buildFAQCard(
            context,
            question: l10n.translate('faq_q3'),
            answer: l10n.translate('faq_a3'),
          ),
          _buildFAQCard(
            context,
            question: l10n.translate('faq_q4'),
            answer: l10n.translate('faq_a4'),
          ),
          _buildFAQCard(
            context,
            question: l10n.translate('faq_q5'),
            answer: l10n.translate('faq_a5'),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: AppCard(
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
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
                  child: Icon(icon, color: AppTheme.primary),
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
                        subtitle,
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: AppTheme.textSecondary,
                            ),
                      ),
                    ],
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

  Widget _buildFAQCard(
    BuildContext context, {
    required String question,
    required String answer,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: AppCard(
        child: Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            title: Text(
              question,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppTheme.spacing16,
                  0,
                  AppTheme.spacing16,
                  AppTheme.spacing16,
                ),
                child: Text(
                  answer,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

}
