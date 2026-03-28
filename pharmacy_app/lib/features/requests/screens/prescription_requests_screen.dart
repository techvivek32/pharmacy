import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/prescription_provider.dart';

class PrescriptionRequestsScreen extends StatefulWidget {
  const PrescriptionRequestsScreen({super.key});

  @override
  State<PrescriptionRequestsScreen> createState() =>
      _PrescriptionRequestsScreenState();
}

class _PrescriptionRequestsScreenState
    extends State<PrescriptionRequestsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<PrescriptionProvider>().fetchPrescriptionRequests();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Prescription Requests'),
        automaticallyImplyLeading: false,
      ),
      body: Consumer<PrescriptionProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (provider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(provider.error!, style: const TextStyle(color: AppTheme.error)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.fetchPrescriptionRequests(),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          if (provider.prescriptions.isEmpty) {
            return _buildEmptyState();
          }
          return RefreshIndicator(
            onRefresh: () => provider.fetchPrescriptionRequests(),
            child: ListView.separated(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              itemCount: provider.prescriptions.length,
              separatorBuilder: (_, __) => const SizedBox(height: AppTheme.spacing12),
              itemBuilder: (context, index) {
                final request = provider.prescriptions[index];
                return _buildRequestCard(context, request);
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_outlined, size: 80, color: AppTheme.textSecondary.withOpacity(0.5)),
          const SizedBox(height: AppTheme.spacing16),
          Text('No Requests Yet', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: AppTheme.spacing8),
          Text('New prescription requests will appear here',
              style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }

  Widget _buildRequestCard(BuildContext context, dynamic request) {
    final createdAt = request['createdAt'] != null
        ? DateTime.tryParse(request['createdAt'].toString()) ?? DateTime.now()
        : DateTime.now();

    return Card(
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, '/prescription-detail', arguments: request),
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        child: Padding(
          padding: const EdgeInsets.all(AppTheme.spacing16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(AppTheme.spacing12),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                    ),
                    child: const Icon(Icons.person_outline, color: AppTheme.primary),
                  ),
                  const SizedBox(width: AppTheme.spacing12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          request['patientName'] ?? 'Unknown',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: AppTheme.spacing4),
                        Row(
                          children: [
                            const Icon(Icons.location_on_outlined, size: 14, color: AppTheme.textSecondary),
                            const SizedBox(width: AppTheme.spacing4),
                            Text('${request['distance'] ?? 0} km away',
                                style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: AppTheme.spacing12, vertical: AppTheme.spacing8),
                    decoration: BoxDecoration(
                      color: AppTheme.warning.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                    ),
                    child: Text(
                      _getTimeAgo(createdAt),
                      style: const TextStyle(
                          fontSize: 12, fontWeight: FontWeight.w500, color: AppTheme.warning),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacing12),
              Text(request['deliveryAddress'] ?? '', style: Theme.of(context).textTheme.bodyMedium),
            ],
          ),
        ),
      ),
    );
  }

  String _getTimeAgo(DateTime dateTime) {
    final diff = DateTime.now().difference(dateTime);
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }
}
