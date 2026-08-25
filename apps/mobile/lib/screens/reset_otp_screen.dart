import 'dart:async';
import 'package:flutter/material.dart';
import 'package:talora_mobile/theme/app_theme.dart';
import 'package:talora_mobile/services/api_client.dart';
import 'package:talora_mobile/widgets/otp_input.dart';
import 'package:talora_mobile/screens/login_screen.dart';

class ResetOtpScreen extends StatefulWidget {
  final String email;

  const ResetOtpScreen({
    super.key, 
    required this.email,
  });

  @override
  State<ResetOtpScreen> createState() => _ResetOtpScreenState();
}

class _ResetOtpScreenState extends State<ResetOtpScreen> with SingleTickerProviderStateMixin {
  bool _isLoading = false;
  String? _error;
  bool _hasError = false;
  
  String _currentOtp = '';
  final _passwordController = TextEditingController();
  
  // Animation for the password field reveal
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );
    
    _slideAnimation = Tween<Offset>(begin: const Offset(0, 0.2), end: Offset.zero).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _passwordController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _onOtpCompleted(String code) {
    setState(() {
      _currentOtp = code;
      _error = null;
      _hasError = false;
    });
    // Reveal the password field
    _animationController.forward();
  }

  Future<void> _handleSubmit() async {
    if (_passwordController.text.length < 8) {
      setState(() {
        _error = 'Password must be at least 8 characters';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
      _hasError = false;
    });

    try {
      await ApiClient.resetPassword({
        'email': widget.email,
        'token': _currentOtp,
        'newPassword': _passwordController.text,
      });

      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password reset successfully! Please sign in.')),
      );
      
      // Navigate back to Login
      Navigator.of(context).popUntil((route) => route.isFirst);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );

    } catch (e) {
      setState(() {
        _error = 'Invalid code or reset failed.';
        _hasError = true;
      });
      // Hide password field and make them re-enter OTP if it failed
      _animationController.reverse();
      _currentOtp = '';
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
            right: -50,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.accentColor.withValues(alpha: 0.15),
                boxShadow: [
                  BoxShadow(color: AppTheme.accentColor.withValues(alpha: 0.15), blurRadius: 100, spreadRadius: 50),
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
                              color: AppTheme.accentColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: const Icon(
                              Icons.password,
                              color: AppTheme.accentColor,
                              size: 32,
                            ),
                          ),
                          const SizedBox(height: 24),
                          
                          const Text(
                            'Enter Reset Code',
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
                              // Hide password field if they backspace
                              if (code.length < 6 && _animationController.value > 0) {
                                _animationController.reverse();
                              }
                            },
                            onCompleted: _onOtpCompleted,
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

                          // Animated New Password Field
                          FadeTransition(
                            opacity: _fadeAnimation,
                            child: SlideTransition(
                              position: _slideAnimation,
                              child: Column(
                                children: [
                                  TextField(
                                    controller: _passwordController,
                                    decoration: const InputDecoration(
                                      labelText: 'New Password',
                                      prefixIcon: Icon(Icons.lock_outline),
                                    ),
                                    obscureText: true,
                                    enabled: !_isLoading,
                                  ),
                                  const SizedBox(height: 24),
                                  
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      onPressed: _isLoading ? null : _handleSubmit,
                                      style: ElevatedButton.styleFrom(
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        backgroundColor: AppTheme.accentColor,
                                        foregroundColor: Colors.white,
                                      ),
                                      child: _isLoading 
                                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                          : const Text('Reset Password'),
                                    ),
                                  ),
                                ],
                              ),
                            ),
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
