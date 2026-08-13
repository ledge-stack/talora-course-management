import 'package:flutter/material.dart';
import 'package:talora_mobile/theme/app_theme.dart';

class TimetableScreen extends StatelessWidget {
  const TimetableScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Date Selector Header
        Container(
          padding: const EdgeInsets.all(16),
          decoration: const BoxDecoration(
            color: AppTheme.surfaceColor,
            border: Border(bottom: BorderSide(color: AppTheme.borderSubtle)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left),
                onPressed: () {},
              ),
              const Column(
                children: [
                  Text(
                    'Today',
                    style: TextStyle(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Nov 14, 2026',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: () {},
              ),
            ],
          ),
        ),

        // Timeline
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              _buildTimelineItem(
                time: '09:00 AM',
                title: 'Data Structures Lecture',
                location: 'Room 302, Science Block',
                type: 'Lecture',
                color: AppTheme.primaryColor,
              ),
              _buildTimelineItem(
                time: '11:30 AM',
                title: 'Software Engineering Lab',
                location: 'Lab 4, Tech Building',
                type: 'Lab',
                color: AppTheme.accentColor,
              ),
              _buildTimelineItem(
                time: '02:00 PM',
                title: 'Group Meeting: Alpha Coders',
                location: 'Library Study Room B',
                type: 'Meeting',
                color: AppTheme.success,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineItem({
    required String time,
    required String title,
    required String location,
    required String type,
    required Color color,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 70,
            child: Text(
              time,
              style: const TextStyle(
                color: AppTheme.textSecondary,
                fontWeight: FontWeight.bold,
                fontSize: 13,
              ),
            ),
          ),
          Column(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.backgroundBase, width: 2),
                ),
              ),
              Container(
                width: 2,
                height: 80,
                color: AppTheme.borderSubtle,
              ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Card(
              margin: EdgeInsets.zero,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: color.withOpacity(0.5), width: 1),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          type,
                          style: TextStyle(
                            color: color,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      title,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: AppTheme.textSecondary),
                        const SizedBox(width: 4),
                        Text(
                          location,
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 13,
                          ),
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
    );
  }
}
