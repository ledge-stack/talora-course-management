import 'package:flutter/material.dart';

void main() {
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
          seedColor: const Color(0xFF0284C7),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const StudentDashboardPage(),
    );
  }
}

class StudentDashboardPage extends StatelessWidget {
  const StudentDashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Talora Student Portal'),
        elevation: 2,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            const Card(
              child: ListTile(
                leading: Icon(Icons.group_work, color: Colors.cyanAccent),
                title: Text('My Course Groups'),
                subtitle: Text('Enrolled in 3 course offerings. 1 active membership.'),
              ),
            ),
            const SizedBox(height: 12),
            const Card(
              child: ListTile(
                leading: Icon(Icons.campaign, color: Colors.orangeAccent),
                title: Text('Announcements'),
                subtitle: Text('Latest timetable change & submission deadline.'),
              ),
            ),
            const SizedBox(height: 12),
            const Card(
              child: ListTile(
                leading: Icon(Icons.assignment_turned_in, color: Colors.greenAccent),
                title: Text('Assignments & Submissions'),
                subtitle: Text('Software Engineering MVP due Aug 25.'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
