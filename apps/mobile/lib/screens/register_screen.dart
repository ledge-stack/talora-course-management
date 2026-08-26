import 'package:flutter/material.dart';
import 'package:talora_mobile/theme/app_theme.dart';
import 'package:talora_mobile/services/api_client.dart';
import 'package:talora_mobile/screens/verify_otp_screen.dart';
import 'package:talora_mobile/screens/login_screen.dart';
import 'package:intl_phone_field/intl_phone_field.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _fullNameController = TextEditingController();
  final _studentNumberController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneNumberController = TextEditingController();
  final _institutionIdController = TextEditingController(text: 'MAK'); // Default to MAK for now
  
  bool _acceptedTerms = false;
  bool _isLoading = false;
  String? _error;

  @override
  void dispose() {
    _fullNameController.dispose();
    _studentNumberController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneNumberController.dispose();
    _institutionIdController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    if (!_acceptedTerms) {
      setState(() {
        _error = 'You must accept the Terms and Conditions to register.';
        _isLoading = false;
      });
      return;
    }

    try {
      await ApiClient.register({
        'fullName': _fullNameController.text,
        'studentNumber': _studentNumberController.text,
        'email': _emailController.text,
        'phoneNumber': _phoneNumberController.text, // this will be the complete number
        'password': _passwordController.text,
        'institutionId': _institutionIdController.text,
        'acceptedTerms': _acceptedTerms,
      });

      if (!mounted) return;
      // Navigate to OTP verification screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => VerifyOtpScreen(
            email: _emailController.text,
            isPasswordReset: false,
          ),
        ),
      );
    } catch (e) {
      setState(() {
        _error = 'Failed to register. Please check your details.';
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
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Text(
                            'Create Account',
                            style: TextStyle(
                              fontSize: 28,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.textPrimary,
                              fontFamily: 'Outfit',
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Join Talora to coordinate your classes',
                            style: TextStyle(
                              fontSize: 16,
                              color: AppTheme.textSecondary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 32),

                          TextField(
                            controller: _fullNameController,
                            decoration: const InputDecoration(
                              labelText: 'Full Name',
                              prefixIcon: Icon(Icons.person),
                            ),
                            enabled: !_isLoading,
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            controller: _studentNumberController,
                            decoration: const InputDecoration(
                              labelText: 'Student Number (e.g. 24/U/1234)',
                              prefixIcon: Icon(Icons.badge),
                            ),
                            enabled: !_isLoading,
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            controller: _emailController,
                            decoration: const InputDecoration(
                              labelText: 'Email Address',
                              prefixIcon: Icon(Icons.email),
                            ),
                            keyboardType: TextInputType.emailAddress,
                            enabled: !_isLoading,
                          ),
                          const SizedBox(height: 16),
                          IntlPhoneField(
                            decoration: const InputDecoration(
                              labelText: 'Phone Number',
                            ),
                            initialCountryCode: 'UG',
                            onChanged: (phone) {
                              _phoneNumberController.text = phone.completeNumber;
                            },
                            enabled: !_isLoading,
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            controller: _passwordController,
                            decoration: const InputDecoration(
                              labelText: 'Password',
                              prefixIcon: Icon(Icons.lock),
                            ),
                            obscureText: true,
                            enabled: !_isLoading,
                          ),
                          const SizedBox(height: 16),
                          CheckboxListTile(
                            title: const Text(
                              'I agree to the Terms and Conditions regarding data usage for academic coordination.',
                              style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
                            ),
                            value: _acceptedTerms,
                            onChanged: _isLoading ? null : (value) {
                              setState(() {
                                _acceptedTerms = value ?? false;
                              });
                            },
                            controlAffinity: ListTileControlAffinity.leading,
                            contentPadding: EdgeInsets.zero,
                            activeColor: AppTheme.primaryColor,
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

                          ElevatedButton(
                            onPressed: _isLoading ? null : _handleRegister,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 16),
                            ),
                            child: _isLoading 
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                                : const Text('Register'),
                          ),
                          
                          const SizedBox(height: 24),
                          
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text(
                                'Already have an account? ',
                                style: TextStyle(color: AppTheme.textSecondary),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                                  );
                                },
                                child: const Text('Sign in'),
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
