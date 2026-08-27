import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:talora_mobile/theme/app_theme.dart';
import 'package:talora_mobile/services/api_client.dart';
import 'package:talora_mobile/screens/main_layout.dart';
import 'package:talora_mobile/screens/login_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(const TaloraMobileApp());
}

class TaloraMobileApp extends StatelessWidget {
  const TaloraMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Talora Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppTheme.primaryColor,
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: AppTheme.backgroundBase,
        useMaterial3: true,
      ),
      home: FutureBuilder<String?>(
        future: ApiClient.getToken(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          }
          
          if (snapshot.hasData && snapshot.data != null) {
            return const MainLayout();
          } else {
            return const LoginScreen();
          }
        },
      ),
    );
  }
}

