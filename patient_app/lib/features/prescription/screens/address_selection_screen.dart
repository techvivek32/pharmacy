import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../services/address_service.dart';
import '../../../providers/order_provider.dart';
import '../../profile/screens/add_address_screen.dart';

class AddressSelectionScreen extends StatefulWidget {
  const AddressSelectionScreen({super.key});

  @override
  State<AddressSelectionScreen> createState() => _AddressSelectionScreenState();
}

class _AddressSelectionScreenState extends State<AddressSelectionScreen> {
  List<Map<String, dynamic>> _addresses = [];
  bool _isLoading = true;
  bool _isCreatingOrder = false;
  String? _selectedAddressId;
  String? _prescriptionId;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _prescriptionId ??= ModalRoute.of(context)?.settings.arguments as String?;
    if (_addresses.isEmpty && _isLoading) _loadAddresses();
  }

  Future<void> _loadAddresses() async {
    setState(() => _isLoading = true);
    
    final result = await AddressService.getAddresses();
    
    setState(() {
      _isLoading = false;
      if (result.success) {
        _addresses = result.addresses ?? [];
        
        // If no addresses, redirect to add address
        if (_addresses.isEmpty) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _navigateToAddAddress();
          });
        } else {
          // Auto-select default address
          final defaultAddress = _addresses.firstWhere(
            (addr) => addr['isDefault'] == true,
            orElse: () => _addresses.first,
          );
          _selectedAddressId = defaultAddress['_id'];
        }
      }
    });

    if (!result.success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.message ?? 'Failed to load addresses')),
      );
    }
  }

  Future<void> _navigateToAddAddress() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AddAddressScreen()),
    );
    
    if (result == true) {
      _loadAddresses();
    } else if (mounted) {
      // If user didn't add address, go back
      Navigator.pop(context);
    }
  }

  void _confirmAddress() async {
    if (_selectedAddressId == null || _prescriptionId == null) return;

    final selectedAddress = _addresses.firstWhere(
      (addr) => addr['_id'] == _selectedAddressId,
    );

    setState(() => _isCreatingOrder = true);

    final success = await context.read<OrderProvider>().createOrder(
      prescriptionId: _prescriptionId!,
      deliveryAddress: selectedAddress,
    );

    if (!mounted) return;
    setState(() => _isCreatingOrder = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Order placed successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      // Go back to home and switch to Orders tab
      Navigator.pushNamedAndRemoveUntil(context, '/home', (route) => false,
          arguments: {'tab': 1});
    } else {
      final error = context.read<OrderProvider>().error;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error ?? 'Failed to place order')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Select Delivery Address'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _addresses.isEmpty
              ? _buildEmptyState()
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        itemCount: _addresses.length,
                        itemBuilder: (context, index) {
                          final address = _addresses[index];
                          return _buildAddressCard(address);
                        },
                      ),
                    ),
                    _buildBottomBar(),
                  ],
                ),
    );
  }

  Widget _buildAddressCard(Map<String, dynamic> address) {
    final isSelected = _selectedAddressId == address['_id'];
    
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedAddressId = address['_id'];
          });
        },
        child: AppCard(
          child: Container(
            padding: const EdgeInsets.all(AppTheme.spacing16),
            decoration: BoxDecoration(
              border: Border.all(
                color: isSelected ? AppTheme.primary : Colors.transparent,
                width: 2,
              ),
              borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
            ),
            child: Row(
              children: [
                Radio<String>(
                  value: address['_id'],
                  groupValue: _selectedAddressId,
                  onChanged: (value) {
                    setState(() {
                      _selectedAddressId = value;
                    });
                  },
                  activeColor: AppTheme.primary,
                ),
                const SizedBox(width: AppTheme.spacing12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppTheme.spacing8,
                              vertical: AppTheme.spacing4,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                            ),
                            child: Text(
                              address['label'] ?? 'Address',
                              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                    color: AppTheme.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ),
                          if (address['isDefault'] == true) ...[
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
                                'Default',
                                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                      color: AppTheme.success,
                                    ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: AppTheme.spacing8),
                      Text(
                        address['address'] ?? '',
                        style: Theme.of(context).textTheme.bodyMedium,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing24),
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
              'No Delivery Address',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: AppTheme.spacing8),
            Text(
              'You need to add a delivery address before placing an order',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppTheme.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppTheme.spacing24),
            PrimaryButton(
              text: 'Add Address',
              onPressed: _navigateToAddAddress,
              icon: Icons.add_location,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                OutlinedButton.icon(
                  onPressed: _navigateToAddAddress,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Add New'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primary,
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppTheme.spacing16,
                      vertical: AppTheme.spacing12,
                    ),
                  ),
                ),
                const SizedBox(width: AppTheme.spacing12),
                Expanded(
                  child: PrimaryButton(
                    text: 'Confirm Address',
                    onPressed: (_selectedAddressId == null || _isCreatingOrder) ? null : _confirmAddress,
                    isLoading: _isCreatingOrder,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}