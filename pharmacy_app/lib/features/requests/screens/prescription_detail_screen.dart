import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';

class PrescriptionDetailScreen extends StatelessWidget {
  final dynamic prescription;

  const PrescriptionDetailScreen({super.key, required this.prescription});

  String _get(String key) {
    if (prescription is Map) return prescription[key]?.toString() ?? '';
    try {
      return prescription[key]?.toString() ?? '';
    } catch (_) {
      return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = _get('imageUrl');
    final patientName = _get('patientName').isNotEmpty ? _get('patientName') : 'Unknown Patient';
    final patientPhone = _get('patientPhone');
    final patientEmail = _get('patientEmail');
    final deliveryAddress = _get('deliveryAddress').isNotEmpty
        ? _get('deliveryAddress')
        : 'Address not provided';
    final distance = prescription is Map ? prescription['distance'] : null;
    final createdAt = _get('createdAt').isNotEmpty
        ? DateTime.tryParse(_get('createdAt'))
        : null;

    final existingQuote = prescription is Map ? prescription['existingQuote'] : null;
    final hasQuote = existingQuote != null;

    return Scaffold(
      appBar: AppBar(title: const Text('Prescription Details')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Full prescription image with tap to zoom
            GestureDetector(
              onTap: () => _showFullImage(context, imageUrl),
              child: Stack(
                children: [
                  imageUrl.isNotEmpty
                      ? CachedNetworkImage(
                          imageUrl: imageUrl,
                          width: double.infinity,
                          height: 280,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => Container(
                            height: 280,
                            color: Colors.grey.shade100,
                            child: const Center(
                                child: CircularProgressIndicator()),
                          ),
                          errorWidget: (_, __, ___) => _imagePlaceholder(),
                        )
                      : _imagePlaceholder(),
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.zoom_in, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          Text('Tap to zoom',
                              style: TextStyle(
                                  color: Colors.white, fontSize: 12)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Patient info card
                  _buildSectionCard(
                    context,
                    title: 'Patient Information',
                    icon: Icons.person_outline,
                    children: [
                      _buildInfoRow(context, Icons.person, 'Name', patientName),
                      if (patientPhone.isNotEmpty)
                        _buildInfoRow(context, Icons.phone, 'Phone', patientPhone),
                      if (patientEmail.isNotEmpty)
                        _buildInfoRow(context, Icons.email, 'Email', patientEmail),
                    ],
                  ),

                  const SizedBox(height: AppTheme.spacing16),

                  // Delivery info card
                  _buildSectionCard(
                    context,
                    title: 'Delivery Information',
                    icon: Icons.local_shipping_outlined,
                    children: [
                      _buildInfoRow(
                          context, Icons.location_on, 'Address', deliveryAddress),
                      if (distance != null)
                        _buildInfoRow(context, Icons.straighten, 'Distance',
                            '$distance km from your pharmacy'),
                      if (createdAt != null)
                        _buildInfoRow(
                          context,
                          Icons.access_time,
                          'Requested',
                          _formatDateTime(createdAt),
                        ),
                    ],
                  ),

                  const SizedBox(height: AppTheme.spacing24),

                  PrimaryButton(
                    text: hasQuote ? 'Edit Quote' : 'Send Quote to Patient',
                    icon: hasQuote ? Icons.edit : Icons.send,
                    onPressed: () => Navigator.pushNamed(
                      context,
                      '/quote-builder',
                      arguments: prescription,
                    ),
                  ),

                  const SizedBox(height: AppTheme.spacing16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showFullImage(BuildContext context, String imageUrl) {
    if (imageUrl.isEmpty) return;
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => Scaffold(
          backgroundColor: Colors.black,
          appBar: AppBar(
            backgroundColor: Colors.black,
            iconTheme: const IconThemeData(color: Colors.white),
          ),
          body: Center(
            child: InteractiveViewer(
              minScale: 0.5,
              maxScale: 5.0,
              child: CachedNetworkImage(
                imageUrl: imageUrl,
                fit: BoxFit.contain,
                placeholder: (_, __) =>
                    const Center(child: CircularProgressIndicator()),
                errorWidget: (_, __, ___) =>
                    const Icon(Icons.broken_image, color: Colors.white, size: 64),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 8,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 20, color: AppTheme.primary),
                const SizedBox(width: 8),
                Text(title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold)),
              ],
            ),
            const Divider(height: 20),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(
      BuildContext context, IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppTheme.textSecondary),
          const SizedBox(width: AppTheme.spacing8),
          SizedBox(
            width: 80,
            child: Text('$label:',
                style: const TextStyle(
                    fontWeight: FontWeight.w500,
                    color: AppTheme.textSecondary,
                    fontSize: 13)),
          ),
          Expanded(
            child: Text(value,
                style: const TextStyle(fontSize: 14),
                overflow: TextOverflow.visible),
          ),
        ],
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      height: 280,
      color: Colors.grey.shade100,
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.image_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 8),
            Text('No image available',
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dt) {
    final now = DateTime.now();
    final diff = now.difference(dt);
    if (diff.inMinutes < 60) return '${diff.inMinutes} minutes ago';
    if (diff.inHours < 24) return '${diff.inHours} hours ago';
    return '${dt.day}/${dt.month}/${dt.year} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
  }
}
