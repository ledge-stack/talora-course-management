import 'package:flutter/material.dart';
import 'package:talora_mobile/theme/app_theme.dart';

class GroupsScreen extends StatelessWidget {
  const GroupsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        const Text(
          'My Offerings',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 16),

        _buildOfferingCard(
          courseCode: 'CS-301',
          courseName: 'Data Structures',
          groupName: 'Not yet joined',
          isGroupLeader: false,
          status: 'Action Required',
        ),
        
        _buildOfferingCard(
          courseCode: 'SE-400',
          courseName: 'Software Engineering',
          groupName: 'Alpha Coders',
          isGroupLeader: true,
          status: 'Active',
          members: 5,
        ),
      ],
    );
  }

  Widget _buildOfferingCard({
    required String courseCode,
    required String courseName,
    required String groupName,
    required bool isGroupLeader,
    required String status,
    int? members,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppTheme.borderSubtle)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      courseCode,
                      style: const TextStyle(
                        color: AppTheme.primaryColor,
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      courseName,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                if (status == 'Action Required')
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.warning.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Action Required',
                      style: TextStyle(color: AppTheme.warning, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Group Status',
                      style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                    ),
                    Text(
                      groupName,
                      style: TextStyle(
                        color: status == 'Active' ? AppTheme.textPrimary : AppTheme.warning,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                if (isGroupLeader) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Your Role',
                        style: TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppTheme.accentColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppTheme.accentColor.withOpacity(0.3)),
                        ),
                        child: const Text(
                          'Group Leader',
                          style: TextStyle(color: AppTheme.accentColor, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ],
                const SizedBox(height: 24),
                
                if (status == 'Action Required')
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {},
                      child: const Text('Find a Group'),
                    ),
                  )
                else
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {},
                          style: OutlinedButton.styleFrom(
                            foregroundColor: AppTheme.textPrimary,
                            side: const BorderSide(color: AppTheme.borderSubtle),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: const Text('View Details'),
                        ),
                      ),
                      if (isGroupLeader) ...[
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () {},
                            child: const Text('Manage'),
                          ),
                        ),
                      ]
                    ],
                  )
              ],
            ),
          ),
        ],
      ),
    );
  }
}
