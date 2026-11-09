import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/localization/app_localizations.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _orderUpdates = true;
  bool _promotions = false;
  bool _newMessages = true;
  bool _emailNotifications = true;
  bool _pushNotifications = true;
  bool _smsNotifications = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('notifications')),
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        children: [
          Text(
            l10n.translate('notification_preferences'),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: AppTheme.spacing16),
          _buildNotificationCard(
            title: l10n.translate('order_updates'),
            subtitle: l10n.translate('order_updates_desc'),
            value: _orderUpdates,
            onChanged: (value) => setState(() => _orderUpdates = value),
          ),
          _buildNotificationCard(
            title: l10n.translate('promotions_offers'),
            subtitle: l10n.translate('promotions_desc'),
            value: _promotions,
            onChanged: (value) => setState(() => _promotions = value),
          ),
          _buildNotificationCard(
            title: l10n.translate('new_messages'),
            subtitle: l10n.translate('new_messages_desc'),
            value: _newMessages,
            onChanged: (value) => setState(() => _newMessages = value),
          ),
          const SizedBox(height: AppTheme.spacing24),
          Text(
            l10n.translate('notification_channels'),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: AppTheme.spacing16),
          _buildNotificationCard(
            title: l10n.translate('email_notifications'),
            subtitle: l10n.translate('email_notifications_desc'),
            value: _emailNotifications,
            onChanged: (value) => setState(() => _emailNotifications = value),
          ),
          _buildNotificationCard(
            title: l10n.translate('push_notifications'),
            subtitle: l10n.translate('push_notifications_desc'),
            value: _pushNotifications,
            onChanged: (value) => setState(() => _pushNotifications = value),
          ),
          _buildNotificationCard(
            title: l10n.translate('sms_notifications'),
            subtitle: l10n.translate('sms_notifications_desc'),
            value: _smsNotifications,
            onChanged: (value) => setState(() => _smsNotifications = value),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: AppCard(
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          child: Row(
            children: [
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
              Switch(
                value: value,
                onChanged: onChanged,
                activeColor: AppTheme.primary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
