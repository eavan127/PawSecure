import 'package:flutter/material.dart';

/// Status banner for alerts and system status
class StatusBanner extends StatelessWidget {
  final String message;
  final IconData icon;
  final Color? backgroundColor;
  final Color? textColor;
  final bool isAnimated;
  final VoidCallback? onTap;

  const StatusBanner({
    super.key,
    required this.message,
    this.icon = Icons.info_outline,
    this.backgroundColor,
    this.textColor,
    this.isAnimated = false,
    this.onTap,
  });

  /// Factory for disaster mode banner
  factory StatusBanner.disaster({
    String message = 'SYSTEM STATUS: DISASTER MODE ACTIVE',
    VoidCallback? onTap,
  }) {
    return StatusBanner(
      message: message,
      icon: Icons.error,
      backgroundColor: const Color(0xFFB87A7A), // Muted red for error
      textColor: Colors.white,
      isAnimated: true,
      onTap: onTap,
    );
  }

  /// Factory for info banner
  factory StatusBanner.info({
    required String message,
    VoidCallback? onTap,
  }) {
    return StatusBanner(
      message: message,
      icon: Icons.info_outline,
      backgroundColor: const Color(0xFFAAC7D8), // Pastel blue
      textColor: const Color(0xFF29353C), // Charcoal
      onTap: onTap,
    );
  }

  /// Factory for success banner
  factory StatusBanner.success({
    required String message,
    VoidCallback? onTap,
  }) {
    return StatusBanner(
      message: message,
      icon: Icons.check_circle_outline,
      backgroundColor: const Color(0xFF7A9D96), // Muted teal
      textColor: Colors.white,
      onTap: onTap,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final bgColor = backgroundColor ?? theme.colorScheme.primary;
    final fgColor = textColor ?? theme.colorScheme.onPrimary;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: bgColor,
          boxShadow: [
            BoxShadow(
              color: bgColor.withOpacity(0.4),
              blurRadius: 15,
              spreadRadius: 0,
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isAnimated)
              _PulsingIcon(icon: icon, color: fgColor)
            else
              Icon(icon, color: fgColor, size: 18),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                message.toUpperCase(),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: fgColor,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                  fontSize: 12,
                ),
                textAlign: TextAlign.center,
                overflow: TextOverflow.ellipsis,
                maxLines: 2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Pulsing icon animation
class _PulsingIcon extends StatefulWidget {
  final IconData icon;
  final Color color;

  const _PulsingIcon({
    required this.icon,
    required this.color,
  });

  @override
  State<_PulsingIcon> createState() => _PulsingIconState();
}

class _PulsingIconState extends State<_PulsingIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    )..repeat(reverse: true);

    _animation = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animation,
      child: Icon(
        widget.icon,
        color: widget.color,
        size: 18,
      ),
    );
  }
}
