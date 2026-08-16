import 'package:flutter/material.dart';
import 'package:talora_mobile/screens/home_screen.dart';
import 'package:talora_mobile/screens/timetable_screen.dart';
import 'package:talora_mobile/screens/groups_screen.dart';
import 'package:talora_mobile/screens/login_screen.dart';
import 'package:talora_mobile/services/api_client.dart';
import 'package:talora_mobile/theme/app_theme.dart';

class MainLayout extends StatefulWidget {
  const MainLayout({super.key});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  int _currentIndex = 0;
  List<dynamic> _offerings = [];
  String? _activeOfferingId;

  @override
  void initState() {
    super.initState();
    _loadOfferings();
  }

  Future<void> _loadOfferings() async {
    try {
      final response = await ApiClient.get('/offerings');
      if (response['data'] != null) {
        final List<dynamic> offerings = response['data'];
        final storedActive = await ApiClient.getActiveOfferingId();
        
        setState(() {
          _offerings = offerings;
          if (storedActive != null && offerings.any((o) => o['id'] == storedActive)) {
            _activeOfferingId = storedActive;
          } else if (offerings.isNotEmpty) {
            _activeOfferingId = offerings[0]['id'];
            ApiClient.setActiveOfferingId(_activeOfferingId!);
          }
        });
      }
    } catch (e) {
      print('Failed to load offerings: $e');
    }
  }

  final List<Widget> _pages = const [
    HomeScreen(),
    TimetableScreen(),
    GroupsScreen(),
  ];

  final List<String> _titles = const [
    'Talora Dashboard',
    'Timetable',
    'Course Groups',
  ];

  Future<void> _handleLogout() async {
    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Logout'),
          content: const Text('Are you sure you want to log out?'),
          actions: <Widget>[
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Logout', style: TextStyle(color: AppTheme.danger)),
            ),
          ],
        );
      },
    );

    if (confirm == true) {
      await ApiClient.clearToken();
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(_titles[_currentIndex], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.normal)),
            if (_offerings.isNotEmpty)
              DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _activeOfferingId,
                  isDense: true,
                  iconEnabledColor: Colors.white,
                  dropdownColor: AppTheme.primary,
                  style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                  onChanged: (String? newValue) {
                    if (newValue != null && newValue != _activeOfferingId) {
                      setState(() {
                        _activeOfferingId = newValue;
                      });
                      ApiClient.setActiveOfferingId(newValue).then((_) {
                        // Force a reload of the current page by navigating to it again
                        // Or just let the page rebuild if it listens to something?
                        // For a simple app, we can just replace the current route
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => const MainLayout()),
                        );
                      });
                    }
                  },
                  items: _offerings.map<DropdownMenuItem<String>>((dynamic value) {
                    return DropdownMenuItem<String>(
                      value: value['id'],
                      child: Text('${value['unit']['code']} · ${value['class']['name']}'),
                    );
                  }).toList(),
                ),
              ),
          ],
        ),
        elevation: 2,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: _pages[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (int index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.calendar_month_outlined),
            selectedIcon: Icon(Icons.calendar_month),
            label: 'Timetable',
          ),
          NavigationDestination(
            icon: Icon(Icons.group_outlined),
            selectedIcon: Icon(Icons.group),
            label: 'Groups',
          ),
        ],
      ),
    );
  }
}
