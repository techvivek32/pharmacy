import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';

class HelpSupportScreen extends StatelessWidget {
  const HelpSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Help & Support'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        children: [
          _buildContactCard(
            context,
            icon: Icons.phone,
            title: 'Call Us',
            subtitle: '+1 (555) 123-4567',
            onTap: () => _showSnackBar(context, 'Calling support...'),
          ),
          _buildContactCard(
            context,
            icon: Icons.email,
            title: 'Email Us',
            subtitle: 'support@mediexpress.com',
            onTap: () => _showSnackBar(context, 'Opening email...'),
          ),
          _buildContactCard(
            context,
            icon: Icons.chat,
            title: 'Live Chat',
            subtitle: 'Chat with our support team',
            onTap: () => _showSnackBar(context, 'Starting chat...'),
          ),
          const SizedBox(height: AppTheme.spacing24),
          Text(
            'Frequently Asked Questions',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: AppTheme.spacing16),
          _buildFAQCard(
            context,
            question: 'How do I upload a prescription?',
            answer: 'Go to the home screen and tap on "Upload Prescription". You can take a photo or select from your gallery.',
          ),
          _buildFAQCard(
            context,
            question: 'How long does delivery take?',
            answer: 'Standard delivery takes 1-2 hours. Express delivery is available for urgent orders.',
          ),
          _buildFAQCard(
            context,
            question: 'Can I cancel my order?',
            answer: 'You can cancel your order before it\'s confirmed by the pharmacy. Go to Order History and select the order.',
          ),
          _buildFAQCard(
            context,
            question: 'What payment methods are accepted?',
            answer: 'We accept credit/debit cards, UPI, and cash on delivery.',
          ),
          _buildFAQCard(
            context,
            question: 'Is my prescription data secure?',
            answer: 'Yes, all your data is encrypted and stored securely. We comply with healthcare data protection regulations.',
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

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
