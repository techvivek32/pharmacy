import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../providers/prescription_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../services/api_service.dart';
import '../../orders/orders_screen.dart';
import '../../profile/profile_screen.dart';
import '../../requests/screens/prescription_requests_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await context.read<AuthProvider>().checkAuth();
      if (mounted) context.read<PrescriptionProvider>().fetchPrescriptionRequests();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      context.read<PrescriptionProvider>().fetchPrescriptionRequests();
    }
  }

  final List<Widget> _screens = const [
    _DashboardTab(),
    PrescriptionRequestsScreen(),
    OrdersScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _screens),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppTheme.primary,
        unselectedItemColor: AppTheme.textSecondary,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long_outlined), activeIcon: Icon(Icons.receipt_long), label: 'Requests'),
          BottomNavigationBarItem(icon: Icon(Icons.history_outlined), activeIcon: Icon(Icons.history), label: 'Orders'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _DashboardTab extends StatefulWidget {
  const _DashboardTab();

  @override
  State<_DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<_DashboardTab> {
  List<Map<String, dynamic>> _recentOrders = [];
  double _todayRevenue = 0;
  bool _loadingOrders = false;

  @override
  void initState() {
    super.initState();
    _fetchRecentOrders();
  }

  Future<void> _fetchRecentOrders() async {
    setState(() => _loadingOrders = true);
    final res = await ApiService.get('/pharmacy/orders');
    if (!mounted) return;
    if (res.success && res.data != null) {
      final orders = List<Map<String, dynamic>>.from(
        (res.data['orders'] as List? ?? []).map((e) => Map<String, dynamic>.from(e)),
      );
      final today = DateTime.now();
      double rev = 0;
      for (final o in orders) {
        if (o['status'] == 'delivered') {
          try {
            final dt = DateTime.parse((o['createdAt'] ?? '').toString());
            if (dt.year == today.year && dt.month == today.month && dt.day == today.day) {
              rev += (o['totalAmount'] as num?)?.toDouble() ?? 0;
            }
          } catch (_) {}
        }
      }
      setState(() {
        _recentOrders = orders.take(3).toList();
        _todayRevenue = rev;
        _loadingOrders = false;
      });
    } else {
      setState(() => _loadingOrders = false);
    }
  }

  String _greeting() {
    final h = DateTime.now().hour;
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'delivered': return AppTheme.success;
      case 'confirmed': case 'preparing': case 'ready': return AppTheme.info;
      case 'cancelled': return AppTheme.error;
      default: return AppTheme.warning;
    }
  }

  String _statusLabel(String s) {
    switch (s) {
      case 'delivered': return 'Delivered';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'assigned': return 'Rider Assigned';
      case 'in_transit': return 'In Transit';
      case 'cancelled': return 'Cancelled';
      default: return 'Pending';
    }
  }

  String _formatDate(dynamic raw) {
    if (raw == null) return '';
    try {
      final dt = DateTime.parse(raw.toString()).toLocal();
      return '${dt.day.toString().padLeft(2, '0')}/${dt.month.toString().padLeft(2, '0')}/${dt.year}';
    } catch (_) { return ''; }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;

    return Consumer<PrescriptionProvider>(
      builder: (context, provider, _) {
        final pending = provider.prescriptions.length;
        final confirmed = provider.confirmedCount;
        final completed = provider.completedCount;

        return RefreshIndicator(
          onRefresh: () async {
            await provider.fetchPrescriptionRequests();
            await _fetchRecentOrders();
          },
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Container(
                  decoration: const BoxDecoration(
                    color: AppTheme.primary,
                    borderRadius: BorderRadius.vertical(bottom: Radius.circular(AppTheme.radiusXLarge)),
                  ),
                  padding: EdgeInsets.fromLTRB(20, MediaQuery.of(context).padding.top + 16, 20, 28),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(_greeting(), style: const TextStyle(color: Colors.white70, fontSize: 14)),
                              const SizedBox(height: 2),
                              Text(user?.fullName ?? 'Pharmacy',
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: Colors.white.withOpacity(0.2),
                            child: Text(
                              (user?.fullName ?? 'P').substring(0, 1).toUpperCase(),
                              style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                        ),
                        child: Row(
                          children: [
                            _headerStat('Pending', '$pending', Icons.pending_actions_outlined),
                            Container(width: 1, height: 40, color: Colors.white30),
                            _headerStat('Active', '$confirmed', Icons.local_shipping_outlined),
                            Container(width: 1, height: 40, color: Colors.white30),
                            _headerStat('Completed', '$completed', Icons.check_circle_outline),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    // Stats row
                    Row(
                      children: [
                        Expanded(child: _statCard(Icons.today, "Today's Revenue",
                            '${_todayRevenue.toStringAsFixed(0)} MAD', AppTheme.success)),
                        const SizedBox(width: 12),
                        Expanded(child: _statCard(Icons.check_circle_outline, 'Total Completed',
                            '$completed', AppTheme.primary)),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Quick actions
                    const Text('Quick Actions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _actionTile(
                          Icons.receipt_long, 'Requests', AppTheme.warning,
                          badge: pending > 0 ? '$pending' : null,
                          onTap: () {
                            final s = context.findAncestorStateOfType<_HomeScreenState>();
                            s?.setState(() => s._currentIndex = 1);
                          },
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _actionTile(
                          Icons.history, 'Orders', AppTheme.info,
                          badge: confirmed > 0 ? '$confirmed' : null,
                          onTap: () {
                            final s = context.findAncestorStateOfType<_HomeScreenState>();
                            s?.setState(() => s._currentIndex = 2);
                          },
                        )),
                        const SizedBox(width: 12),
                        Expanded(child: _actionTile(
                          Icons.person_outline, 'Profile', AppTheme.textSecondary,
                          onTap: () {
                            final s = context.findAncestorStateOfType<_HomeScreenState>();
                            s?.setState(() => s._currentIndex = 3);
                          },
                        )),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Recent orders
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Recent Orders', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        TextButton(
                          onPressed: () {
                            final s = context.findAncestorStateOfType<_HomeScreenState>();
                            s?.setState(() => s._currentIndex = 2);
                          },
                          child: const Text('See All'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    if (_loadingOrders)
                      const Center(child: CircularProgressIndicator())
                    else if (_recentOrders.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppTheme.surface,
                          borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                          border: Border.all(color: AppTheme.divider),
                        ),
                        child: Column(
                          children: [
                            Icon(Icons.inbox_outlined, size: 48, color: AppTheme.textSecondary.withOpacity(0.4)),
                            const SizedBox(height: 8),
                            const Text('No orders yet', style: TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(height: 4),
                            Text('Orders from patients will appear here',
                                style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
                          ],
                        ),
                      )
                    else
                      ..._recentOrders.map((o) {
                        final status = o['status']?.toString() ?? '';
                        final color = _statusColor(status);
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppTheme.surface,
                            borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                            border: Border.all(color: AppTheme.divider),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 40, height: 40,
                                decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                                child: Icon(Icons.receipt_long, color: color, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(o['orderNumber']?.toString() ?? '',
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                                    Text(_formatDate(o['createdAt']),
                                        style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text('${(o['totalAmount'] as num?)?.toStringAsFixed(0) ?? '0'} MAD',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: color.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(_statusLabel(status),
                                        style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600)),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      }),
                    const SizedBox(height: 16),

                    // Tips
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppTheme.info.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                        border: Border.all(color: AppTheme.info.withOpacity(0.2)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(color: AppTheme.info.withOpacity(0.15), shape: BoxShape.circle),
                            child: const Icon(Icons.tips_and_updates, color: AppTheme.info, size: 22),
                          ),
                          const SizedBox(width: 12),
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('Respond Quickly', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                SizedBox(height: 2),
                                Text('Faster quote responses increase your order acceptance rate.',
                                    style: TextStyle(fontSize: 12, color: AppTheme.textSecondary)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ]),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _headerStat(String label, String value, IconData icon) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: Colors.white70, size: 18),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          Text(label, style: const TextStyle(color: Colors.white60, fontSize: 10)),
        ],
      ),
    );
  }

  Widget _statCard(IconData icon, String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        border: Border.all(color: AppTheme.divider),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
            child: Icon(icon, color: color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: color)),
                Text(label, style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionTile(IconData icon, String label, Color color, {VoidCallback? onTap, String? badge}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
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
                  decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                  child: Icon(icon, color: color, size: 22),
                ),
                const SizedBox(height: 8),
                Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600), textAlign: TextAlign.center),
              ],
            ),
            if (badge != null)
              Positioned(
                top: 0, right: 8,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(color: AppTheme.error, borderRadius: BorderRadius.circular(10)),
                  child: Text(badge, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
