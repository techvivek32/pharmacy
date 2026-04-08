import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../services/api_service.dart';
import '../../orders/screens/orders_screen.dart';
import '../../profile/screens/order_history_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _loading = true;
  int _availableOrders = 0;
  int _totalDeliveries = 0;
  double _totalEarnings = 0;
  double _todayEarnings = 0;
  int _todayDeliveries = 0;
  List<Map<String, dynamic>> _recentOrders = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);

    // Fetch stats + history in parallel
    final results = await Future.wait([
      ApiService.get('/rider/nearby-deliveries'),
      ApiService.get('/rider/orders'),
    ]);

    if (!mounted) return;

    final nearbyRes = results[0];
    final ordersRes = results[1];

    int available = 0;
    if (nearbyRes.success && nearbyRes.data != null) {
      available = (nearbyRes.data['deliveries'] as List? ?? []).length;
    }

    int totalDeliveries = 0;
    double totalEarnings = 0;
    double todayEarnings = 0;
    int todayDeliveries = 0;
    List<Map<String, dynamic>> recent = [];

    if (ordersRes.success && ordersRes.data != null) {
      totalDeliveries = (ordersRes.data['totalDeliveries'] as num?)?.toInt() ?? 0;
      totalEarnings = (ordersRes.data['totalEarnings'] as num?)?.toDouble() ?? 0;

      final orders = List<Map<String, dynamic>>.from(
        (ordersRes.data['orders'] as List? ?? []).map((e) => Map<String, dynamic>.from(e)),
      );

      final today = DateTime.now();
      for (final o in orders) {
        if (o['status'] == 'delivered') {
          try {
            final dt = DateTime.parse(
                (o['deliveredAt'] ?? o['createdAt']).toString());
            if (dt.year == today.year &&
                dt.month == today.month &&
                dt.day == today.day) {
              todayEarnings += (o['deliveryFee'] as num?)?.toDouble() ?? 0;
              todayDeliveries++;
            }
          } catch (_) {}
        }
      }

      recent = orders.take(3).toList();
    }

    setState(() {
      _availableOrders = available;
      _totalDeliveries = totalDeliveries;
      _totalEarnings = totalEarnings;
      _todayEarnings = todayEarnings;
      _todayDeliveries = todayDeliveries;
      _recentOrders = recent;
      _loading = false;
    });
  }

  String _formatDate(dynamic raw) {
    if (raw == null) return '';
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
    } catch (_) {
      return '';
    }
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Scaffold(
      backgroundColor: AppTheme.background,
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: CustomScrollView(
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Container(
                decoration: const BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.vertical(
                      bottom: Radius.circular(AppTheme.radiusXLarge)),
                ),
                padding: EdgeInsets.fromLTRB(
                  AppTheme.spacing20,
                  MediaQuery.of(context).padding.top + AppTheme.spacing16,
                  AppTheme.spacing20,
                  AppTheme.spacing32,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _greeting(),
                              style: const TextStyle(
                                  color: Colors.white70, fontSize: 14),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              user?.fullName ?? 'Rider',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        CircleAvatar(
                          radius: 24,
                          backgroundColor: Colors.white.withOpacity(0.2),
                          child: Text(
                            (user?.fullName ?? 'R')
                                .substring(0, 1)
                                .toUpperCase(),
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing20),
                    // Today's summary
                    Container(
                      padding: const EdgeInsets.all(AppTheme.spacing16),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.15),
                        borderRadius:
                            BorderRadius.circular(AppTheme.radiusMedium),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: _headerStat(
                              'Today\'s Earnings',
                              '${_todayEarnings.toStringAsFixed(0)} MAD',
                              Icons.payments_outlined,
                            ),
                          ),
                          Container(
                              width: 1,
                              height: 40,
                              color: Colors.white30),
                          Expanded(
                            child: _headerStat(
                              'Today\'s Trips',
                              '$_todayDeliveries',
                              Icons.delivery_dining,
                            ),
                          ),
                          Container(
                              width: 1,
                              height: 40,
                              color: Colors.white30),
                          Expanded(
                            child: _headerStat(
                              'Available',
                              '$_availableOrders',
                              Icons.inbox_outlined,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            if (_loading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Overall stats row
                    Row(
                      children: [
                        Expanded(
                          child: _statCard(
                            icon: Icons.check_circle_outline,
                            label: 'Total Deliveries',
                            value: '$_totalDeliveries',
                            color: AppTheme.success,
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacing12),
                        Expanded(
                          child: _statCard(
                            icon: Icons.account_balance_wallet_outlined,
                            label: 'Total Earned',
                            value: '${_totalEarnings.toStringAsFixed(0)} MAD',
                            color: AppTheme.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing20),

                    // Quick actions
                    _sectionTitle('Quick Actions'),
                    const SizedBox(height: AppTheme.spacing12),
                    Row(
                      children: [
                        Expanded(
                          child: _actionTile(
                            icon: Icons.receipt_long,
                            label: 'Available\nOrders',
                            color: AppTheme.info,
                            badge: _availableOrders > 0
                                ? '$_availableOrders'
                                : null,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const OrdersScreen()),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacing12),
                        Expanded(
                          child: _actionTile(
                            icon: Icons.history,
                            label: 'Order\nHistory',
                            color: AppTheme.warning,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) =>
                                      const OrderHistoryScreen()),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppTheme.spacing12),
                        Expanded(
                          child: _actionTile(
                            icon: Icons.account_balance_wallet,
                            label: 'My\nWallet',
                            color: AppTheme.success,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const OrderHistoryScreen()),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing20),

                    // Recent orders
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _sectionTitle('Recent Orders'),
                        TextButton(
                          onPressed: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (_) => const OrderHistoryScreen()),
                          ),
                          child: const Text('See All'),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing8),

                    if (_recentOrders.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(AppTheme.spacing24),
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusLarge),
                          border: Border.all(color: AppTheme.divider),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.delivery_dining,
                                size: 48,
                                color:
                                    AppTheme.textSecondary.withOpacity(0.4)),
                            const SizedBox(height: AppTheme.spacing8),
                            Text('No deliveries yet',
                                style: Theme.of(context).textTheme.titleSmall),
                            const SizedBox(height: AppTheme.spacing4),
                            Text(
                              'Accept orders from the Orders tab to get started',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodySmall
                                  ?.copyWith(
                                      color: AppTheme.textSecondary),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    else
                      ..._recentOrders.map((o) => _recentOrderCard(o)),

                    const SizedBox(height: AppTheme.spacing16),

                    // Tips card
                    Container(
                      padding: const EdgeInsets.all(AppTheme.spacing16),
                      decoration: BoxDecoration(
                        color: AppTheme.info.withOpacity(0.08),
                        borderRadius:
                            BorderRadius.circular(AppTheme.radiusLarge),
                        border: Border.all(
                            color: AppTheme.info.withOpacity(0.2)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppTheme.info.withOpacity(0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.tips_and_updates,
                                color: AppTheme.info, size: 22),
                          ),
                          const SizedBox(width: AppTheme.spacing12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Stay Online',
                                    style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14)),
                                SizedBox(height: 2),
                                Text(
                                  'Keep the app open to receive nearby delivery requests in real time.',
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: AppTheme.textSecondary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacing16),
                  ]),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _headerStat(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 18),
        const SizedBox(height: 4),
        Text(value,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16)),
        Text(label,
            style: const TextStyle(color: Colors.white60, fontSize: 10),
            textAlign: TextAlign.center),
      ],
    );
  }

  Widget _statCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppTheme.spacing16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: AppTheme.spacing12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value,
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                        color: color)),
                Text(label,
                    style: const TextStyle(
                        fontSize: 11, color: AppTheme.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionTile({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
    String? badge,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: AppTheme.spacing16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
          border: Border.all(color: AppTheme.divider),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
                const SizedBox(height: AppTheme.spacing8),
                Text(label,
                    style: const TextStyle(
                        fontSize: 11, fontWeight: FontWeight.w600),
                    textAlign: TextAlign.center),
              ],
            ),
            if (badge != null)
              Positioned(
                top: 0,
                right: 8,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.error,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(badge,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(title,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold));
  }

  Widget _recentOrderCard(Map<String, dynamic> o) {
    final status = o['status']?.toString() ?? '';
    final isDelivered = status == 'delivered';
    final fee = (o['deliveryFee'] as num?)?.toDouble() ?? 0.0;
    final color = isDelivered ? AppTheme.success : AppTheme.warning;

    return Container(
      margin: const EdgeInsets.only(bottom: AppTheme.spacing8),
      padding: const EdgeInsets.all(AppTheme.spacing12),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isDelivered ? Icons.check_circle : Icons.delivery_dining,
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(width: AppTheme.spacing12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  o['orderNumber']?.toString() ?? '',
                  style: const TextStyle(
                      fontWeight: FontWeight.w600, fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  o['deliveryAddress']?.toString() ?? '',
                  style: const TextStyle(
                      fontSize: 12, color: AppTheme.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  _formatDate(o['deliveredAt'] ?? o['createdAt']),
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.textSecondary),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                isDelivered ? '+${fee.toStringAsFixed(0)} MAD' : '—',
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: color,
                    fontSize: 13),
              ),
              const SizedBox(height: 2),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  isDelivered ? 'Done' : status,
                  style: TextStyle(
                      fontSize: 10,
                      color: color,
                      fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
