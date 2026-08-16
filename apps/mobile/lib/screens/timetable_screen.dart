import 'package:flutter/material.dart';
import 'package:talora_mobile/theme/app_theme.dart';
import 'package:talora_mobile/services/api_client.dart';

class TimetableScreen extends StatefulWidget {
  const TimetableScreen({super.key});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  bool _isLoading = true;
  List<dynamic> _events = [];
  String? _error;
  int _selectedDay = DateTime.now().weekday; // 1 = Mon, 7 = Sun

  @override
  void initState() {
    super.initState();
    _fetchEvents();
  }

  Future<void> _fetchEvents() async {
    try {
      final res = await ApiClient.get('/timetable-events');
      setState(() {
        _events = res['data'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  final List<String> _dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  @override
  Widget build(BuildContext context) {
    if (_selectedDay > 5) _selectedDay = 1; // Default to Monday if weekend
    
    final dayEvents = _events.where((e) => e['dayOfWeek'] == _selectedDay).toList();

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
                onPressed: () {
                  setState(() {
                    _selectedDay = _selectedDay > 1 ? _selectedDay - 1 : 5;
                  });
                },
              ),
              Column(
                children: [
                  Text(
                    _dayNames[_selectedDay - 1],
                    style: const TextStyle(
                      color: AppTheme.textPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Weekly Schedule',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right),
                onPressed: () {
                  setState(() {
                    _selectedDay = _selectedDay < 5 ? _selectedDay + 1 : 1;
                  });
                },
              ),
            ],
          ),
        ),

        // Timeline
        Expanded(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? Center(child: Text(_error!, style: const TextStyle(color: Colors.red)))
                  : dayEvents.isEmpty
                      ? const Center(child: Text('No classes today 🎉', style: TextStyle(color: AppTheme.textSecondary)))
                      : ListView.builder(
                          padding: const EdgeInsets.all(16.0),
                          itemCount: dayEvents.length,
                          itemBuilder: (context, index) {
                            final event = dayEvents[index];
                            final colors = [AppTheme.primaryColor, AppTheme.accentColor, AppTheme.success, Colors.orange];
                            return _buildTimelineItem(
                              time: event['startTime'],
                              title: event['title'],
                              location: event['location'] ?? 'TBD',
                              type: 'Class',
                              color: colors[index % colors.length],
                            );
                          },
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
            width: 50,
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
                side: BorderSide(color: color.withValues(alpha: 0.5), width: 1),
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
