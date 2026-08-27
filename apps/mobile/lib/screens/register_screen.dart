import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
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
      await FirebaseAuth.instance.verifyPhoneNumber(
        phoneNumber: _phoneNumberController.text,
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _signInWithCredentialAndRegister(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          setState(() {
            _error = e.message ?? 'Verification failed';
            _isLoading = false;
          });
        },
        codeSent: (String verificationId, int? resendToken) {
          setState(() {
            _isLoading = false;
          });
          _showOtpDialog(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {},
      );
    } catch (e) {
      setState(() {
        _error = 'Failed to initiate phone verification.';
        _isLoading = false;
      });
    }
  }

  void _showOtpDialog(String verificationId) {
    String smsCode = '';
    bool isVerifying = false;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: const Text('Enter SMS Code'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  keyboardType: TextInputType.number,
                  onChanged: (val) => smsCode = val,
                  decoration: const InputDecoration(labelText: '6-digit code'),
                ),
                if (isVerifying) const Padding(
                  padding: EdgeInsets.only(top: 16.0),
                  child: CircularProgressIndicator(),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: isVerifying ? null : () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: isVerifying ? null : () async {
                  setDialogState(() => isVerifying = true);
                  try {
                    PhoneAuthCredential credential = PhoneAuthProvider.credential(
                      verificationId: verificationId,
                      smsCode: smsCode,
                    );
                    await _signInWithCredentialAndRegister(credential);
                    if (mounted) Navigator.pop(context);
                  } catch (e) {
                    setDialogState(() => isVerifying = false);
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid code')));
                  }
                },
                child: const Text('Verify & Register'),
              ),
            ],
          );
        }
      ),
    );
  }

  Future<void> _signInWithCredentialAndRegister(PhoneAuthCredential credential) async {
    try {
      final userCredential = await FirebaseAuth.instance.signInWithCredential(credential);
      final idToken = await userCredential.user?.getIdToken();

      if (idToken == null) throw Exception("Failed to get ID token");

      await ApiClient.register({
        'fullName': _fullNameController.text,
        'studentNumber': _studentNumberController.text,
        'email': _emailController.text,
        'phoneNumber': _phoneNumberController.text,
        'password': _passwordController.text,
        'institutionId': _institutionIdController.text,
        'acceptedTerms': _acceptedTerms,
        'firebaseIdToken': idToken,
      });

      if (!mounted) return;
      
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Registration successful! Please sign in.')));
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = 'Registration failed. Check details or if account already exists.';
          _isLoading = false;
        });
      }
    }
  }

  void _showTermsDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Terms and Conditions'),
        content: const SingleChildScrollView(
          child: Text(
            '1. Introduction\nWelcome to Talora. By accessing or using our platform, you agree to be bound by these Terms and Conditions.\n\n'
            '2. Data Usage and Privacy\nYour privacy is important to us. We collect your phone number and email address strictly for the purpose of academic coordination. Specifically, your phone number may be shared with your designated Group Leader to facilitate out-of-band communication for group projects and assignments.\n\n'
            '3. Academic Integrity\nYou agree that all assignments and work submitted through Talora are your own original work. Plagiarism, cheating, or the unauthorized sharing of copyrighted academic materials is strictly prohibited.\n\n'
            '4. Account Security\nYou are responsible for maintaining the confidentiality of your account credentials. You must not share your password or allow others to access your account.\n\n'
            '5. Acceptable Use\nYou agree to use this platform only for academic purposes related to your enrolled courses. Harassment, spam, abusive language, and the sharing of malicious content are strictly prohibited.\n\n'
            '6. Content Moderation & Right to Remove\nPlatform Administrators and Class Representatives reserve the right to moderate, remove, or modify any content, disband groups, or suspend user accounts if they determine a violation of these terms has occurred.\n\n'
            '7. Data Retention & Service Availability\nTalora reserves the right to archive or permanently delete course data after a semester concludes. Talora is provided "as is", and we do not guarantee uninterrupted access or uptime of the platform.\n\n'
            '8. Limitation of Liability\nWe are not responsible for any disputes arising between students, loss of assignment data, missed deadlines, or academic penalties resulting from the use or inability to use the platform.',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
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
                            title: GestureDetector(
                              onTap: _showTermsDialog,
                              child: const Text.rich(
                                TextSpan(
                                  text: 'I agree to the ',
                                  style: TextStyle(fontSize: 14, color: AppTheme.textSecondary),
                                  children: [
                                    TextSpan(
                                      text: 'Terms and Conditions',
                                      style: TextStyle(color: AppTheme.primaryColor, decoration: TextDecoration.underline),
                                    ),
                                    TextSpan(
                                      text: ' regarding data usage for academic coordination.',
                                    ),
                                  ],
                                ),
                              ),
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
