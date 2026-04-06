import 'package:flutter/material.dart';
import '../../../core/theme/app_theme.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';

class PendingApprovalScreen extends StatefulWidget {
  const PendingApprovalScreen({super.key});

  @override
  State<PendingApprovalScreen> createState() => _PendingApprovalScreenState();
}

class _PendingApprovalScreenState extends State<PendingApprovalScreen> {
  bool _checking = false;

  Future<void> _checkStatus() async {
    setState(() => _checking = true);
    try {
      final res = await ApiService.get('/rider/approval-status');
      if (!mounted) return;
      if (res.success) {
        final status = res.data?['approvalStatus'];
        final note = res.data?['adminNote'] ?? '';
        if (status == 'approved') {
          Navigator.pushReplacementNamed(context, '/home');
        } else if (status == 'rejected') {
          _showRejectedDialog(note);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Still pending approval. Please wait.')),
          );
        }
      }
    } catch (_) {
    } finally {
      if (mounted) setState(() => _checking = false);
    }
  }

  void _showRejectedDialog(String note) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Registration Rejected'),
        content: Text(note.isNotEmpty ? note : 'Your registration was rejected by admin.'),
        actions: [
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await AuthService.logout();
              if (mounted) Navigator.pushReplacementNamed(context, '/login');
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Future<void> _logout() async {
    await AuthService.logout();
    if (mounted) Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(color: Colors.orange.shade50, shape: BoxShape.circle),
                child: const Icon(Icons.hourglass_top_rounded, size: 52, color: Colors.orange),
              ),
              const SizedBox(height: 32),
              const Text('Waiting for Admin Approval',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              Text(
                'Your rider registration has been submitted. Our admin team will review your details and driving licence.',
                style: TextStyle(fontSize: 15, color: Colors.grey.shade600, height: 1.5),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade100),
                ),
                child: Row(children: [
                  Icon(Icons.access_time, color: Colors.blue.shade600, size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text('Approval typically takes 24 to 48 hours.',
                        style: TextStyle(fontSize: 13, color: Colors.blue.shade700, height: 1.4)),
                  ),
                ]),
              ),
              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _checking ? null : _checkStatus,
                  icon: _checking
                      ? const SizedBox(width: 18, height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.refresh),
                  label: Text(_checking ? 'Checking...' : 'Check Status'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: _logout,
                child: const Text('Logout', style: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
