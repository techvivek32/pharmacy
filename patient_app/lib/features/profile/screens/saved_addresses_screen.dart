import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/localization/app_localizations.dart';
import '../../../services/address_service.dart';
import 'add_address_screen.dart';

class SavedAddressesScreen extends StatefulWidget {
  const SavedAddressesScreen({super.key});

  @override
  State<SavedAddressesScreen> createState() => _SavedAddressesScreenState();
}

class _SavedAddressesScreenState extends State<SavedAddressesScreen> {
  List<Map<String, dynamic>> _addresses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  Future<void> _loadAddresses() async {
    setState(() => _isLoading = true);
    
    final result = await AddressService.getAddresses();
    
    setState(() {
      _isLoading = false;
      if (result.success) {
        _addresses = result.addresses ?? [];
      }
    });

    if (!result.success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.message ?? AppLocalizations.of(context)!.translate('failed_load_addresses'))),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('saved_addresses')),
      ),
      body: Column(
        children: [
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _addresses.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        itemCount: _addresses.length,
                        itemBuilder: (context, index) {
                          return _buildAddressCard(_addresses[index]);
                        },
                      ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            child: PrimaryButton(
              text: l10n.translate('add_new_address'),
              onPressed: _addNewAddress,
              icon: Icons.add,
            ),
          ),
        ],
      ),
    );
  }

  bool _hasLocationDetails(Map<String, dynamic> address) {
    final city = address['city']?.toString().trim() ?? '';
    final state = address['state']?.toString().trim() ?? '';
    final zip = address['zipCode']?.toString().trim() ?? '';
    return city.isNotEmpty || state.isNotEmpty || zip.isNotEmpty;
  }

  String _formatLocationLine(Map<String, dynamic> address) {
    final city = address['city']?.toString().trim() ?? '';
    final state = address['state']?.toString().trim() ?? '';
    final zip = address['zipCode']?.toString().trim() ?? '';
    final parts = [city, '$state $zip'.trim()].where((p) => p.isNotEmpty).toList();
    return parts.join(', ');
  }

  Widget _buildAddressCard(Map<String, dynamic> address) {
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
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.spacing12,
                      vertical: AppTheme.spacing4,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                    ),
                    child: Text(
                      address['label'],
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: AppTheme.primary,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  if (address['isDefault']) ...[
                    const SizedBox(width: AppTheme.spacing8),
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
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    onPressed: () => _editAddress(address),
                    color: AppTheme.primary,
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete, size: 20),
                    onPressed: () => _deleteAddress(address),
                    color: AppTheme.error,
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing12),
              Text(
                address['address'] ?? '',
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const SizedBox(height: AppTheme.spacing4),
              if (_hasLocationDetails(address))
                Text(
                  _formatLocationLine(address),
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppTheme.textSecondary,
                      ),
                ),
              if (address['latitude'] != null && address['longitude'] != null) ...[
                const SizedBox(height: AppTheme.spacing4),
                Row(
                  children: [
                    const Icon(Icons.location_on, size: 14, color: AppTheme.success),
                    const SizedBox(width: AppTheme.spacing4),
                    Text(
                      'GPS: ${address['latitude'].toStringAsFixed(4)}, ${address['longitude'].toStringAsFixed(4)}',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppTheme.success,
                          ),
                    ),
                  ],
                ),
              ],
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
            Icons.location_off,
            size: 80,
            color: AppTheme.textSecondary.withValues(alpha: 0.5),
          ),
          const SizedBox(height: AppTheme.spacing16),
          Text(
            AppLocalizations.of(context)!.translate('no_saved_addresses'),
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacing8),
          Text(
            AppLocalizations.of(context)!.translate('add_addresses_desc'),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppTheme.textSecondary,
                ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _addNewAddress() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AddAddressScreen(),
      ),
    );

    if (result == true && mounted) {
      _loadAddresses();
    }
  }

  void _editAddress(Map<String, dynamic> address) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddAddressScreen(address: address),
      ),
    );
    
    if (result == true) {
      _loadAddresses();
    }
  }

  void _deleteAddress(Map<String, dynamic> address) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.translate('delete_address')),
        content: Text('${l10n.translate('delete_address_confirm')} (${address['label']})'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.translate('cancel')),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              
              final result = await AddressService.deleteAddress(address['_id']);
              
              if (result.success) {
                _loadAddresses();
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(l10n.translate('address_deleted'))),
                  );
                }
              } else {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(result.message ?? l10n.translate('failed_delete_address'))),
                  );
                }
              }
            },
            child: Text(l10n.translate('delete'), style: const TextStyle(color: AppTheme.error)),
          ),
        ],
      ),
    );
  }
}
