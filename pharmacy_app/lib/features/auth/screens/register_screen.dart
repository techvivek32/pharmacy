import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/input_field.dart';
import '../../../services/api_service.dart';
import 'otp_verification_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _pharmacyNameController = TextEditingController();
  final _licenseController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _pharmacyNameController.dispose();
    _licenseController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  bool _isSendingOtp = false;

  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSendingOtp = true);

    try {
      final response = await ApiService.post(
        '/auth/send-otp',
        {'email': _emailController.text.trim()},
        includeAuth: false,
      );

      setState(() => _isSendingOtp = false);

      if (!mounted) return;

      if (response.success) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => OTPVerificationScreen(
              email: _emailController.text.trim(),
              registrationData: {
                'fullName': _nameController.text.trim(),
                'email': _emailController.text.trim(),
                'phone': _phoneController.text.trim(),
                'password': _passwordController.text,
                'role': 'pharmacy',
                'pharmacyName': _pharmacyNameController.text.trim(),
                'licenseNumber': _licenseController.text.trim(),
                'address': _addressController.text.trim(),
                'coordinates': [0.0, 0.0],
              },
            ),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    } catch (e) {
      setState(() => _isSendingOtp = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to send OTP'),
            backgroundColor: AppTheme.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Register Pharmacy')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Image.asset('assets/images/logo.png', width: 120, height: 80),
              ),
              const SizedBox(height: AppTheme.spacing8),
              Center(
                child: Text('Create Pharmacy Account',
                    style: Theme.of(context).textTheme.titleLarge),
              ),
              const SizedBox(height: AppTheme.spacing32),

              // Personal Info
              Text('Personal Info', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.textSecondary)),
              const SizedBox(height: AppTheme.spacing12),
              InputField(
                controller: _nameController,
                label: 'Full Name',
                prefixIcon: Icons.person,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: AppTheme.spacing12),
              InputField(
                controller: _emailController,
                label: 'Email',
                prefixIcon: Icons.email,
                keyboardType: TextInputType.emailAddress,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: AppTheme.spacing12),
              InputField(
                controller: _phoneController,
                label: 'Phone Number',
                prefixIcon: Icons.phone,
                keyboardType: TextInputType.phone,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: AppTheme.spacing12),
              InputField(
                controller: _passwordController,
                label: 'Password',
                prefixIcon: Icons.lock,
                isPassword: true,
                validator: (v) => v!.length < 6 ? 'Min 6 characters' : null,
              ),
              const SizedBox(height: AppTheme.spacing24),

              // Pharmacy Info
              Text('Pharmacy Info', style: Theme.of(context).textTheme.titleMedium?.copyWith(color: AppTheme.textSecondary)),
              const SizedBox(height: AppTheme.spacing12),
              InputField(
                controller: _pharmacyNameController,
                label: 'Pharmacy Name',
                prefixIcon: Icons.store,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: AppTheme.spacing12),
              InputField(
                controller: _licenseController,
                label: 'License Number',
                prefixIcon: Icons.badge,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: AppTheme.spacing12),
              InputField(
                controller: _addressController,
                label: 'Pharmacy Address',
                prefixIcon: Icons.location_on,
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: AppTheme.spacing32),

              Consumer<AuthProvider>(
                builder: (context, auth, _) => PrimaryButton(
                  text: 'Send OTP & Continue',
                  onPressed: _isSendingOtp ? null : _register,
                  isLoading: _isSendingOtp,
                ),
              ),
              const SizedBox(height: AppTheme.spacing16),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Already have an account? Login'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
