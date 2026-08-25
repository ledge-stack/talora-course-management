import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:talora_mobile/theme/app_theme.dart';

class OtpInput extends StatefulWidget {
  final int length;
  final Function(String) onCompleted;
  final Function(String) onChanged;
  final bool hasError;

  const OtpInput({
    super.key,
    this.length = 6,
    required this.onCompleted,
    required this.onChanged,
    this.hasError = false,
  });

  @override
  State<OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<OtpInput> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;
  String _currentCode = '';

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());

    for (int i = 0; i < widget.length; i++) {
      _controllers[i].addListener(() {
        _handleTextChange(i);
      });
      // Add a listener to rebuild the container borders when focus changes
      _focusNodes[i].addListener(() {
        setState(() {});
      });
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _handleTextChange(int index) {
    String text = _controllers[index].text;

    // Handle paste: if text length > 1, it's likely a paste
    if (text.length > 1) {
      // Clean non-digits just in case
      String cleanText = text.replaceAll(RegExp(r'[^0-9]'), '');
      
      // Distribute across controllers without triggering multiple rebuilds immediately
      for (int i = 0; i < widget.length; i++) {
        if (i < cleanText.length) {
          if (_controllers[i].text != cleanText[i]) {
            _controllers[i].text = cleanText[i];
          }
        } else {
          if (_controllers[i].text != '') {
            _controllers[i].text = '';
          }
        }
      }
      
      // Focus the appropriate node
      int nextFocusIndex = cleanText.length < widget.length ? cleanText.length : widget.length - 1;
      _focusNodes[nextFocusIndex].requestFocus();
      
      // We return here because setting text triggers this listener again
      _updateCurrentCodeAndNotify();
      return;
    }

    // Normal typing (auto-advance)
    if (text.isNotEmpty && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    
    _updateCurrentCodeAndNotify();
  }

  void _updateCurrentCodeAndNotify() {
    String newCode = _controllers.map((c) => c.text).join();
    if (newCode != _currentCode) {
      _currentCode = newCode;
      widget.onChanged(_currentCode);
      
      if (_currentCode.length == widget.length) {
        widget.onCompleted(_currentCode);
      }
    }
  }

  void _handleBackspace(int index) {
    if (_controllers[index].text.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
      _controllers[index - 1].text = ''; // Clear previous as well for standard OTP UX
    }
  }

  @override
  void didUpdateWidget(OtpInput oldWidget) {
    super.didUpdateWidget(oldWidget);
    // If transitioning to error state, trigger haptic feedback and clear fields
    if (widget.hasError && !oldWidget.hasError) {
      HapticFeedback.heavyImpact();
      for (var controller in _controllers) {
        controller.text = '';
      }
      _focusNodes[0].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: List.generate(widget.length, (index) {
        return Container(
          width: 45,
          height: 55,
          decoration: BoxDecoration(
            color: widget.hasError ? AppTheme.danger.withValues(alpha: 0.1) : AppTheme.bgSurface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: widget.hasError 
                ? AppTheme.danger 
                : (_focusNodes[index].hasFocus ? AppTheme.primaryColor : AppTheme.borderSubtle),
              width: _focusNodes[index].hasFocus || widget.hasError ? 2 : 1,
            ),
            boxShadow: widget.hasError 
              ? [BoxShadow(color: AppTheme.danger.withValues(alpha: 0.2), blurRadius: 8)]
              : (_focusNodes[index].hasFocus 
                  ? [BoxShadow(color: AppTheme.primaryColor.withValues(alpha: 0.2), blurRadius: 8)]
                  : []),
          ),
          child: Focus(
            onKeyEvent: (node, event) {
              if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.backspace) {
                _handleBackspace(index);
                return KeyEventResult.handled;
              }
              return KeyEventResult.ignored;
            },
            child: TextField(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: widget.hasError ? AppTheme.danger : AppTheme.textPrimary,
              ),
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
              ],
              decoration: const InputDecoration(
                border: InputBorder.none,
                counterText: '',
              ),
              onTap: () {
                // Ensure cursor is at the end
                _controllers[index].selection = TextSelection.fromPosition(
                  TextPosition(offset: _controllers[index].text.length)
                );
              },
            ),
          ),
        );
      }),
    );
  }
}
