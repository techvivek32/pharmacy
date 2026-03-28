import 'package:flutter/material.dart';
import 'dart:async';
import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/input_field.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../services/api_service.dart';
import '../../../services/auth_service.dart';
import '../../../models/user_model.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_provider.dart';

class OTPVerificationScreen extends StatefulWidget {
  final String email;
  final Map<String, dynamic> registrationData;

  const OTPVerificationScreen({
    super.key,
    required this.email,
    required this.registrationData,
  });

  @override
  State<OTPVerificationScreen> createState() => _OTPVerificationScreenState();
}

class _OTPVerificationScreenState extends State<OTPVerificationScreen> {
  final _otpController = TextEditingController();
  bool _isLoading = false;
  int _secondsRemaining = 60;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _otpController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _secondsRemaining = 60;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _verifyAndRegister() async {
    if (_otpController.text.trim().length != 6) {
      _showError('Please enter the 6-digit OTP');
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Step 1: Verify OTP
      final verifyRes = await ApiService.post(
        '/auth/verify-otp',
        {'email': widget.email, 'otp': _otpController.text.trim()},
        includeAuth: false,
      );

      if (!verifyRes.success) {
        _showError(verifyRes.message);
        setState(() => _isLoading = false);
        return;
      }

      // Step 2: Register
      final registerRes = await ApiService.post(
        '/auth/register',
        widget.registrationData,
        includeAuth: false,
      );

      if (registerRes.success && registerRes.data != null) {
        await AuthService.saveToken(registerRes.data['token']);
        await AuthService.saveUserData(registerRes.data['user']);
        final user = User.fromJson(registerRes.data['user']);
        if (mounted) {
          context.read<AuthProvider>().setUser(user);
          Navigator.pushNamedAndRemoveUntil(context, '/home', (_) => false);
        }
      } else {
        _showError(registerRes.message);
      }
    } catch (e) {
      _showError('Something went wrong');
    }

    setState(() => _isLoading = false);
  }

  Future<void> _resendOTP() async {
    if (_secondsRemaining > 0) return;
    setState(() => _isLoading = true);
    final res = await ApiService.post(
      '/auth/send-otp',
      {'email': widget.email},
      includeAuth: false,
    );
    setState(() => _isLoading = false);
    if (res.success) {
      _startTimer();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP resent to your email')),
        );
      }
    } else {
      _showError(res.message);
    }
  }

  void _showError(String msg) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(msg), backgroundColor: AppTheme.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify Email')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.spacing24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: AppTheme.spacing32),
            const Icon(Icons.mark_email_read_outlined, size: 80, color: AppTheme.primary),
            const SizedBox(height: AppTheme.spacing24),
            Text('Verify Your Email',
                style: Theme.of(context).textTheme.headlineMedium,
                textAlign: TextAlign.center),
            const SizedBox(height: AppTheme.spacing8),
            Text('We sent a 6-digit code to',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center),
            const SizedBox(height: 4),
            Text(widget.email,
                style: Theme.of(context)
                    .textTheme
                    .titleMedium
                    ?.copyWith(color: AppTheme.primary),
                textAlign: TextAlign.center),
            const SizedBox(height: AppTheme.spacing32),
            InputField(
              controller: _otpController,
              label: 'Enter OTP',
              keyboardType: TextInputType.number,
              maxLength: 6,
              prefixIcon: Icons.lock_outline,
            ),
            const SizedBox(height: AppTheme.spacing24),
            PrimaryButton(
              text: 'Verify & Register',
              onPressed: _isLoading ? null : _verifyAndRegister,
              isLoading: _isLoading,
            ),
            const SizedBox(height: AppTheme.spacing16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text("Didn't receive code? ",
                    style: Theme.of(context).textTheme.bodyMedium),
                TextButton(
                  onPressed: _secondsRemaining > 0 ? null : _resendOTP,
                  child: Text(_secondsRemaining > 0
                      ? 'Resend in ${_secondsRemaining}s'
                      : 'Resend OTP'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
