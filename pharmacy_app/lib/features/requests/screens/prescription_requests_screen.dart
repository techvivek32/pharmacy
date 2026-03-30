import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../providers/prescription_provider.dart';
import 'package:provider/provider.dart';
import 'prescription_detail_screen.dart';

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
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () =>
                context.read<PrescriptionProvider>().fetchPrescriptionRequests(),
          ),
        ],
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
                  const Icon(Icons.error_outline, size: 60, color: AppTheme.error),
                  const SizedBox(height: 16),
                  Text(provider.error!,
                      style: const TextStyle(color: AppTheme.error),
                      textAlign: TextAlign.center),
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
              separatorBuilder: (_, __) =>
                  const SizedBox(height: AppTheme.spacing12),
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
          Icon(Icons.inbox_outlined,
              size: 80, color: AppTheme.textSecondary.withOpacity(0.5)),
          const SizedBox(height: AppTheme.spacing16),
          Text('No Requests Yet',
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: AppTheme.spacing8),
          Text('New prescription requests will appear here',
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center),
        ],
      ),
    );
  }

  Widget _buildRequestCard(BuildContext context, dynamic request) {
    final imageUrl = request['imageUrl']?.toString() ?? '';
    final patientName = request['patientName']?.toString() ?? 'Unknown';
    final patientPhone = request['patientPhone']?.toString() ?? '';
    final deliveryAddress = request['deliveryAddress']?.toString() ?? '';
    final distance = request['distance'];
    final createdAt = request['createdAt'] != null
        ? DateTime.tryParse(request['createdAt'].toString()) ?? DateTime.now()
        : DateTime.now();

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusLarge)),
      child: InkWell(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => PrescriptionDetailScreen(prescription: request),
          ),
        ),
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Prescription image
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(AppTheme.radiusLarge)),
              child: imageUrl.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: imageUrl,
                      height: 180,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        height: 180,
                        color: Colors.grey.shade100,
                        child: const Center(
                            child: CircularProgressIndicator(strokeWidth: 2)),
                      ),
                      errorWidget: (_, __, ___) => _imagePlaceholder(),
                    )
                  : _imagePlaceholder(),
            ),

            Padding(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Patient info row
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: AppTheme.primary.withOpacity(0.1),
                        child: Text(
                          patientName.isNotEmpty
                              ? patientName[0].toUpperCase()
                              : 'P',
                          style: const TextStyle(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.bold),
                        ),
                      ),
                      const SizedBox(width: AppTheme.spacing12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(patientName,
                                style: Theme.of(context).textTheme.titleMedium),
                            if (patientPhone.isNotEmpty)
                              Text(patientPhone,
                                  style: Theme.of(context)
                                      .textTheme
                                      .bodySmall
                                      ?.copyWith(
                                          color: AppTheme.textSecondary)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppTheme.warning.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _getTimeAgo(createdAt),
                          style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: AppTheme.warning),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppTheme.spacing12),
                  const Divider(height: 1),
                  const SizedBox(height: AppTheme.spacing12),

                  // Address
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.location_on,
                          size: 16, color: AppTheme.error),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          deliveryAddress,
                          style: Theme.of(context).textTheme.bodyMedium,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (distance != null)
                        Container(
                          margin: const EdgeInsets.only(left: 8),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '$distance km',
                            style: const TextStyle(
                                fontSize: 12,
                                color: AppTheme.primary,
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                    ],
                  ),

                  const SizedBox(height: AppTheme.spacing12),

                  // View details button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: request['status'] == 'accepted' ? null : () => Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) =>
                              PrescriptionDetailScreen(prescription: request),
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        backgroundColor: request['status'] == 'accepted'
                            ? Colors.green
                            : null,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text(
                        request['status'] == 'accepted'
                            ? '✓ Order Confirmed by Patient'
                            : request['existingQuote'] != null
                                ? 'View & Edit Quote'
                                : 'View & Send Quote',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      height: 180,
      color: Colors.grey.shade100,
      child: const Center(
        child: Icon(Icons.image_outlined, size: 48, color: Colors.grey),
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
