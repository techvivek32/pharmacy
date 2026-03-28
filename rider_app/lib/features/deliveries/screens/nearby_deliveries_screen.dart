import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';

class NearbyDeliveriesScreen extends StatefulWidget {
  const NearbyDeliveriesScreen({super.key});

  @override
  State<NearbyDeliveriesScreen> createState() => _NearbyDeliveriesScreenState();
}

class _NearbyDeliveriesScreenState extends State<NearbyDeliveriesScreen> {
  bool _isLoading = true;
  bool _isOnline = false;
  List<Map<String, dynamic>> _deliveries = [];

  @override
  void initState() {
    super.initState();
    _loadDeliveries();
  }

  Future<void> _loadDeliveries() async {
    if (!_isOnline) return;

    setState(() => _isLoading = true);
    // TODO: Load from API
    await Future.delayed(const Duration(seconds: 1));
    setState(() {
      _isLoading = false;
      _deliveries = [
        {
          'id': '1',
          'orderNumber': 'ORD-001',
          'pickupAddress': 'City Pharmacy, Main St',
          'deliveryAddress': '123 Main St, Casablanca',
          'distance': 3.2,
          'deliveryFee': 10.0,
        },
      ];
    });
  }

  void _toggleOnlineStatus() {
    setState(() {
      _isOnline = !_isOnline;
      if (_isOnline) {
        _loadDeliveries();
      } else {
        _deliveries = [];
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Available Deliveries'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: AppTheme.spacing8),
            child: Row(
              children: [
                Text(
                  _isOnline ? 'Online' : 'Offline',
                  style: TextStyle(
                    color: _isOnline ? AppTheme.success : AppTheme.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Switch(
                  value: _isOnline,
                  onChanged: (value) => _toggleOnlineStatus(),
                  activeColor: AppTheme.success,
                ),
              ],
            ),
          ),
        ],
      ),
      body: !_isOnline
          ? _buildOfflineState()
          : _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _deliveries.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      onRefresh: _loadDeliveries,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(AppTheme.spacing16),
                        itemCount: _deliveries.length,
                        separatorBuilder: (context, index) =>
                            const SizedBox(height: AppTheme.spacing12),
                        itemBuilder: (context, index) {
                          final delivery = _deliveries[index];
                          return _buildDeliveryCard(delivery);
                        },
                      ),
                    ),
    );
  }

  Widget _buildOfflineState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.power_settings_new,
            size: 80,
            color: AppTheme.textSecondary.withOpacity(0.5),
          ),
          const SizedBox(height: AppTheme.spacing16),
          Text(
            'You\'re Offline',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacing8),
          Text(
            'Go online to see available deliveries',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.delivery_dining,
            size: 80,
            color: AppTheme.textSecondary.withOpacity(0.5),
          ),
          const SizedBox(height: AppTheme.spacing16),
          Text(
            'No Deliveries Available',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: AppTheme.spacing8),
          Text(
            'New deliveries will appear here',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryCard(Map<String, dynamic> delivery) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  delivery['orderNumber'],
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppTheme.spacing12,
                    vertical: AppTheme.spacing8,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                  ),
                  child: Text(
                    '${delivery['deliveryFee']} MAD',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.success,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTheme.spacing16),
            _buildAddressRow(
              Icons.store,
              'Pickup',
              delivery['pickupAddress'],
            ),
            const SizedBox(height: AppTheme.spacing12),
            _buildAddressRow(
              Icons.location_on,
              'Delivery',
              delivery['deliveryAddress'],
            ),
            const SizedBox(height: AppTheme.spacing12),
            Row(
              children: [
                const Icon(
                  Icons.directions_car,
                  size: 16,
                  color: AppTheme.textSecondary,
                ),
                const SizedBox(width: AppTheme.spacing4),
                Text(
                  '${delivery['distance']} km',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
            const SizedBox(height: AppTheme.spacing16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Accept delivery
                },
                child: const Text('Accept Delivery'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressRow(IconData icon, String label, String address) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: AppTheme.primary),
        const SizedBox(width: AppTheme.spacing8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.bodySmall,
              ),
              Text(
                address,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
