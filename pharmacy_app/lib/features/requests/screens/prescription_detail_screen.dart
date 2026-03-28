import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/primary_button.dart';

class PrescriptionDetailScreen extends StatelessWidget {
  final dynamic prescription;

  const PrescriptionDetailScreen({super.key, required this.prescription});

  String _get(String key) {
    if (prescription is Map) return prescription[key]?.toString() ?? 'N/A';
    try { return prescription[key]?.toString() ?? 'N/A'; } catch (_) { return 'N/A'; }
  }

  @override
  Widget build(BuildContext context) {
    final imageUrl = _get('imageUrl');

    return Scaffold(
      appBar: AppBar(title: const Text('Prescription Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AppCard(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
                child: imageUrl != 'N/A'
                    ? Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _imagePlaceholder(),
                      )
                    : _imagePlaceholder(),
              ),
            ),
            const SizedBox(height: AppTheme.spacing24),
            AppCard(
              child: Padding(
                padding: const EdgeInsets.all(AppTheme.spacing16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Patient Information', style: Theme.of(context).textTheme.titleLarge),
                    const SizedBox(height: AppTheme.spacing16),
                    _buildInfoRow(Icons.person, 'Name', _get('patientName')),
                    _buildInfoRow(Icons.phone, 'Phone', _get('patientPhone')),
                    _buildInfoRow(Icons.location_on, 'Address', _get('deliveryAddress')),
                    _buildInfoRow(Icons.straighten, 'Distance', '${_get('distance')} km'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTheme.spacing24),
            PrimaryButton(
              text: 'Create Quote',
              onPressed: () => Navigator.pushNamed(context, '/quote-builder', arguments: prescription),
            ),
          ],
        ),
      ),
    );
  }

  Widget _imagePlaceholder() {
    return Container(
      height: 300,
      color: const Color(0xFFF5F5F5),
      child: const Center(child: Icon(Icons.image, size: 64, color: Color(0xFFBDBDBD))),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTheme.spacing12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppTheme.textSecondary),
          const SizedBox(width: AppTheme.spacing8),
          Text('$label: ', style: const TextStyle(fontWeight: FontWeight.w500)),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}
