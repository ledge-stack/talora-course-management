import 'package:flutter/material.dart';
import 'package:talora_mobile/theme/app_theme.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        const Text(
          'Your Activity',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        
        // Priority Card
        Card(
          color: AppTheme.primaryColor.withValues(alpha: 0.1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: BorderSide(color: AppTheme.primaryColor.withValues(alpha: 0.3), width: 1),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.warning_amber_rounded, color: AppTheme.warning, size: 20),
                    const SizedBox(width: 8),
                    const Text(
                      'Action Required',
                      style: TextStyle(
                        color: AppTheme.warning,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Text(
                  'Group Formation Deadline Approaching',
                  style: TextStyle(
                    color: AppTheme.textPrimary,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'CS-301 Data Structures requires you to join or form a group by Nov 16.',
                  style: TextStyle(
                    color: AppTheme.textSecondary,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    minimumSize: const Size(0, 36),
                  ),
                  child: const Text('View Groups'),
                )
              ],
            ),
          ),
        ),
        
        const SizedBox(height: 24),
        const Text(
          'Recent Updates',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 12),

        // Activity Feed Items
        _buildActivityItem(
          icon: Icons.assignment_turned_in,
          iconColor: AppTheme.success,
          title: 'Assignment Graded',
          subtitle: 'Software Engineering - MVP Submission',
          time: '2 hrs ago',
        ),
        _buildActivityItem(
          icon: Icons.group_add,
          iconColor: AppTheme.primaryColor,
          title: 'New Member Joined',
          subtitle: 'Sarah Chen joined "Alpha Coders"',
          time: '5 hrs ago',
        ),
        _buildActivityItem(
          icon: Icons.campaign,
          iconColor: AppTheme.accentColor,
          title: 'Class Announcement',
          subtitle: 'Room change for Tomorrow\'s Lab',
          time: 'Yesterday',
        ),
        _buildActivityItem(
          icon: Icons.event,
          iconColor: AppTheme.warning,
          title: 'New Assignment Posted',
          subtitle: 'Data Structures - Dynamic Programming',
          time: '2 days ago',
        ),
      ],
    );
  }

  Widget _buildActivityItem({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String time,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12.0),
      child: Card(
        child: ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          leading: Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor),
          ),
          title: Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.textPrimary),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13),
              ),
              const SizedBox(height: 4),
              Text(
                time,
                style: TextStyle(color: AppTheme.textSecondary.withValues(alpha: 0.7), fontSize: 11),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
