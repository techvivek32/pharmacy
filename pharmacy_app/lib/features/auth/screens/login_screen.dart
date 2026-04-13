import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../core/widgets/input_field.dart';
import '../../../services/api_service.dart';
import 'register_screen.dart';
import 'pending_approval_screen.dart';
import 'rejected_screen.dart';
import 'forgot_password_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await context.read<AuthProvider>().login(
          _emailController.text.trim(),
          _passwordController.text,
        );

    if (!mounted) return;

    if (!success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.read<AuthProvider>().error ?? 'Login failed'),
          backgroundColor: AppTheme.error,
        ),
      );
      return;
    }

    final user = context.read<AuthProvider>().user;

    // For pharmacy accounts check approval status before going home
    if (user?.role == 'pharmacy') {
      try {
        final res = await ApiService.get('/pharmacy/approval-status');
        if (!mounted) return;

        if (res.success) {
          final status = res.data?['approvalStatus'];
          final note = res.data?['adminNote'] ?? '';

          if (status == 'approved') {
            Navigator.pushReplacementNamed(context, '/home');
          } else if (status == 'rejected') {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                  builder: (_) => RejectedScreen(adminNote: note)),
            );
          } else {
            // pending
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                  builder: (_) => const PendingApprovalScreen()),
            );
          }
          return;
        }
      } catch (_) {}

      // fallback — show pending if status check fails
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const PendingApprovalScreen()),
      );
      return;
    }

    Navigator.pushReplacementNamed(context, '/home');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.spacing24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: AppTheme.spacing48),
                Center(
                  child: Image.asset('assets/images/logo.png',
                      width: 120, height: 80),
                ),
                const SizedBox(height: AppTheme.spacing16),
                Text(
                  'Welcome Back',
                  style: Theme.of(context).textTheme.displaySmall,
                ),
                const SizedBox(height: AppTheme.spacing8),
                Text(
                  'Login to your pharmacy account',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: AppTheme.spacing48),
                InputField(
                  controller: _emailController,
                  label: 'Email',
                  hint: 'Enter your email',
                  prefixIcon: Icons.email,
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) =>
                      value == null || value.isEmpty ? 'Please enter your email' : null,
                ),
                const SizedBox(height: AppTheme.spacing16),
                InputField(
                  controller: _passwordController,
                  label: 'Password',
                  hint: 'Enter your password',
                  prefixIcon: Icons.lock,
                  isPassword: true,
                  validator: (value) =>
                      value == null || value.isEmpty ? 'Please enter your password' : null,
                ),
                const SizedBox(height: AppTheme.spacing32),
                Consumer<AuthProvider>(
                  builder: (context, authProvider, _) => PrimaryButton(
                    text: 'Login',
                    onPressed: authProvider.isLoading ? null : _login,
                    isLoading: authProvider.isLoading,
                  ),
                ),
                const SizedBox(height: AppTheme.spacing16),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const ForgotPasswordScreen()),
                    ),
                    child: const Text('Forgot Password?'),
                  ),
                ),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const RegisterScreen()),
                    ),
                    child: const Text("Don't have an account? Register"),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
