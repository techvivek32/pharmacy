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
    final existingQuote = prescription is Map ? prescription['existingQuote'] : null;
    final hasQuote = existingQuote != null;
    final medicines = prescription is Map
        ? List<Map<String, dynamic>>.from(
            (prescription['medicines'] as List? ?? []).map((m) => Map<String, dynamic>.from(m as Map)))
        : <Map<String, dynamic>>[];
    final hasImage = imageUrl.isNotEmpty;

    return Scaffold(
      appBar: AppBar(title: const Text('Prescription Details')),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Show image or medicines list
            if (hasImage)
              GestureDetector(
                onTap: () => _showFullImage(context, imageUrl),
                child: Stack(
                  children: [
                    CachedNetworkImage(
                      imageUrl: imageUrl,
                      width: double.infinity,
                      height: 280,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        height: 280,
                        color: Colors.grey.shade100,
                        child: const Center(child: CircularProgressIndicator()),
                      ),
                      errorWidget: (_, __, ___) => _imagePlaceholder(),
                    ),
                    Positioned(
                      bottom: 12, right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.zoom_in, color: Colors.white, size: 16),
                            SizedBox(width: 4),
                            Text('Tap to zoom', style: TextStyle(color: Colors.white, fontSize: 12)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              )
            else if (medicines.isNotEmpty)
              Padding(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.medication, color: AppTheme.primary, size: 20),
                        const SizedBox(width: 8),
                        Text('Requested Medicines',
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: AppTheme.spacing12),
                    ...medicines.map((m) => Container(
                          margin: const EdgeInsets.only(bottom: AppTheme.spacing8),
                          padding: const EdgeInsets.symmetric(
                              horizontal: AppTheme.spacing12, vertical: AppTheme.spacing12),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(AppTheme.radiusMedium),
                            border: Border.all(color: AppTheme.primary.withOpacity(0.15)),
                          ),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: AppTheme.primary.withOpacity(0.1),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.medication_outlined,
                                    size: 16, color: AppTheme.primary),
                              ),
                              const SizedBox(width: AppTheme.spacing12),
                              Expanded(
                                child: Text(
                                  m['name']?.toString() ?? '',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w500, fontSize: 14),
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(AppTheme.radiusSmall),
                                ),
                                child: Text(
                                  'Qty: ${m['quantity'] ?? 1}',
                                  style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppTheme.primary),
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              )
            else
              _imagePlaceholder(),

            Padding(
              padding: const EdgeInsets.all(AppTheme.spacing16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: AppTheme.spacing8),
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
