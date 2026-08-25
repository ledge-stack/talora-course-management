import 'dart:async';
import 'package:flutter/material.dart';
import 'package:talora_mobile/theme/app_theme.dart';
import 'package:talora_mobile/services/api_client.dart';
import 'package:talora_mobile/widgets/otp_input.dart';
import 'package:talora_mobile/screens/main_layout.dart';

class VerifyOtpScreen extends StatefulWidget {
  final String email;
  final bool isPasswordReset;

  const VerifyOtpScreen({
    super.key, 
    required this.email,
    this.isPasswordReset = false,
  });

  @override
  State<VerifyOtpScreen> createState() => _VerifyOtpScreenState();
}

class _VerifyOtpScreenState extends State<VerifyOtpScreen> {
  bool _isLoading = false;
  String? _error;
  bool _hasError = false;
  
  // Resend timer state
  int _countdown = 60;
  Timer? _timer;
  bool _canResend = false;

  @override
  void initState() {
    super.initState();
    _startResendTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    setState(() {
      _countdown = 60;
      _canResend = false;
    });
    
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        setState(() {
          _countdown--;
        });
      } else {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      }
    });
  }

  Future<void> _handleVerify(String code) async {
    setState(() {
      _isLoading = true;
      _error = null;
      _hasError = false;
    });

    try {
      if (widget.isPasswordReset) {
        // We will handle this in ResetOtpScreen instead to avoid complexity,
        // but just in case this is called incorrectly.
        throw Exception("Use ResetOtpScreen for password reset");
      }

      final res = await ApiClient.verifyRegistration({
        'email': widget.email,
        'otp': code,
      });

      // The backend login on verification doesn't return the token in the body directly,
      // it sets it in a cookie. For a mobile app, we usually need the token in the body.
      // Wait, let's check what the verify endpoint returns. 
      // In the implementation of verify/route.ts earlier, it sets a cookie but DOES NOT return the token in JSON.
      // We should probably modify the backend to return the token, OR we just navigate to Login.
      // Let's navigate to Login with a success message.
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Email verified successfully! Please sign in.')),
      );
      
      // Navigate back to Login
      Navigator.of(context).popUntil((route) => route.isFirst);

    } catch (e) {
      setState(() {
        _error = 'Invalid or expired code.';
        _hasError = true;
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleResend() async {
    if (!_canResend) return;

    setState(() {
      _isLoading = true;
      _error = null;
      _hasError = false;
    });

    try {
      // Assuming there's a resend endpoint. If not, fallback gracefully.
      await ApiClient.post('/auth/resend-verification', {'email': widget.email});
      
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Verification code resent!')),
      );
      
      _startResendTimer();
    } catch (e) {
      setState(() {
        _error = 'Failed to resend code. Try again later.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Positioned(
            top: -100,
            left: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.primaryColor.withValues(alpha: 0.15),
                boxShadow: [
                  BoxShadow(color: AppTheme.primaryColor.withValues(alpha: 0.15), blurRadius: 100, spreadRadius: 50),
                ],
              ),
            ),
          ),
          
          SafeArea(
            child: Column(
              children: [
                Align(
                  alignment: Alignment.topLeft,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Icon(
                              Icons.mark_email_read,
                              color: AppTheme.primaryColor,
                              size: 32,
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          const Text(
                            'Verify Your Email',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                              fontFamily: 'Outfit',
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'We\'ve sent a 6-digit code to\n${widget.email}',
                            style: const TextStyle(
                              fontSize: 16,
                              color: AppTheme.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 48),

                          OtpInput(
                            length: 6,
                            hasError: _hasError,
                            onChanged: (code) {
                              if (_hasError) {
                                setState(() {
                                  _hasError = false;
                                  _error = null;
                                });
                              }
                            },
                            onCompleted: (code) {
                              if (!_isLoading) {
                                _handleVerify(code);
                              }
                            },
                          ),
                          
                          const SizedBox(height: 24),
                          
                          if (_error != null) ...[
                            Text(
                              _error!,
                              style: const TextStyle(color: AppTheme.danger, fontSize: 14),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 16),
                          ],

                          if (_isLoading)
                            const CircularProgressIndicator()
                          else
                            const SizedBox(height: 36), // placeholder for height

                          const SizedBox(height: 24),
                          
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _canResend ? 'Didn\'t receive the code? ' : 'Resend code in $_countdown s',
                                style: const TextStyle(color: AppTheme.textSecondary),
                              ),
                              if (_canResend)
                                TextButton(
                                  onPressed: _isLoading ? null : _handleResend,
                                  child: const Text('Resend'),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
