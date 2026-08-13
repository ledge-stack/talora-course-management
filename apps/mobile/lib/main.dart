import 'package:flutter/material.dart';
import 'package:talora_mobile/screens/login_screen.dart';
import 'package:talora_mobile/theme/app_theme.dart';

void main() {
  runApp(const TaloraMobileApp());
}

class TaloraMobileApp extends StatelessWidget {
  const TaloraMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Talora Mobile',
      theme: AppTheme.darkTheme,
      home: const LoginScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
