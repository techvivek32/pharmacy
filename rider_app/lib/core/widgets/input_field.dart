import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class InputField extends StatelessWidget {
  final String? label;
  final String? hint;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final bool isPassword;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final int? maxLines;
  final int? maxLength;
  final bool enabled;
  final VoidCallback? onTap;
  final Function(String)? onChanged;
  final TextCapitalization textCapitalization;

  const InputField({
    super.key,
    this.label,
    this.hint,
    this.controller,
    this.validator,
    this.keyboardType,
    this.isPassword = false,
    this.prefixIcon,
    this.suffixIcon,
    this.maxLines = 1,
    this.maxLength,
    this.enabled = true,
    this.onTap,
    this.onChanged,
    this.textCapitalization = TextCapitalization.none,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) ...[
          Text(label!, style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: AppTheme.spacing8),
        ],
        _PasswordAwareField(
          controller: controller,
          validator: validator,
          keyboardType: keyboardType,
          isPassword: isPassword,
          prefixIcon: prefixIcon,
          suffixIcon: suffixIcon,
          maxLines: maxLines,
          maxLength: maxLength,
          enabled: enabled,
          onTap: onTap,
          onChanged: onChanged,
          textCapitalization: textCapitalization,
          hint: hint,
        ),
      ],
    );
  }
}

class _PasswordAwareField extends StatefulWidget {
  final String? hint;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final bool isPassword;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final int? maxLines;
  final int? maxLength;
  final bool enabled;
  final VoidCallback? onTap;
  final Function(String)? onChanged;
  final TextCapitalization textCapitalization;

  const _PasswordAwareField({
    this.hint, this.controller, this.validator, this.keyboardType,
    this.isPassword = false, this.prefixIcon, this.suffixIcon,
    this.maxLines, this.maxLength, this.enabled = true,
    this.onTap, this.onChanged, this.textCapitalization = TextCapitalization.none,
  });

  @override
  State<_PasswordAwareField> createState() => _PasswordAwareFieldState();
}

class _PasswordAwareFieldState extends State<_PasswordAwareField> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: widget.controller,
      validator: widget.validator,
      keyboardType: widget.keyboardType,
      obscureText: widget.isPassword && _obscure,
      maxLines: widget.isPassword ? 1 : widget.maxLines,
      maxLength: widget.maxLength,
      enabled: widget.enabled,
      onTap: widget.onTap,
      onChanged: widget.onChanged,
      textCapitalization: widget.textCapitalization,
      decoration: InputDecoration(
        hintText: widget.hint,
        prefixIcon: widget.prefixIcon,
        counterText: '',
        suffixIcon: widget.isPassword
            ? IconButton(
                icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                onPressed: () => setState(() => _obscure = !_obscure),
              )
            : widget.suffixIcon,
      ),
    );
  }
}
