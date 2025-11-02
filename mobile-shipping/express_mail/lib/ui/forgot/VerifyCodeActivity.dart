import 'dart:async';
import 'package:express_mail/ui/forgot/ResetPasswordActivity.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'ForgotViewModel.dart';

class VerifyCodeActivity extends StatefulWidget {
  final String email;

  const VerifyCodeActivity({super.key, required this.email});

  @override
  State<VerifyCodeActivity> createState() => _VerifyCodeActivityState();
}

class _VerifyCodeActivityState extends State<VerifyCodeActivity> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;
  Timer? _timer;
  int _remainingSeconds = 0;

  final ForgotViewModel _forgotViewModel = ForgotViewModel();

  bool _isResending = false;
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(6, (_) => TextEditingController());
    _focusNodes = List.generate(6, (_) => FocusNode());
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (var c in _controllers) c.dispose();
    for (var f in _focusNodes) f.dispose();
    super.dispose();
  }

  bool get isAllFilled => _controllers.every((c) => c.text.isNotEmpty);

  void _clearAllFields() {
    for (var c in _controllers) c.clear();
    _focusNodes[0].requestFocus();
    setState(() {});
  }

  Future<void> _onResend() async {
    if (_remainingSeconds > 0 || _isResending) return;

    setState(() => _isResending = true);
    _startCountdown();

    try {
      await _forgotViewModel.forgot(widget.email);
    } catch (_) {}
    if (!mounted) return;
    setState(() => _isResending = false);
  }

  void _startCountdown() {
    setState(() => _remainingSeconds = 60);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds <= 0) {
        timer.cancel();
      } else {
        setState(() => _remainingSeconds--);
      }
    });
  }

  void _showErrorDialog(String message) {
    if (!mounted) return;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: AppColors.gray_E0E5EB, width: 1),
        ),
        backgroundColor: Colors.white,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                message,
                style: const TextStyle(
                  fontFamily: "Inter_regular",
                  fontSize: 15,
                  color: AppColors.black_1D2530,
                ),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.blue_0680F9,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 4,
                    ),
                  ),
                  onPressed: () {
                    if (Navigator.of(dialogContext).canPop()) {
                      Navigator.of(dialogContext, rootNavigator: true).pop();
                    }
                  },
                  child: const Text(
                    AppStrings.ok,
                    style: TextStyle(fontFamily: "Inter_bold", fontSize: 15),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _onVerify() async {
    if (!isAllFilled || _isVerifying) {
      _showErrorDialog(AppStrings.please_enter_all_6_digits_to_continue);
      return;
    }

    setState(() => _isVerifying = true);

    final code = _controllers.map((c) => c.text).join();

    try {
      bool success = await _forgotViewModel.confirm(widget.email, code);

      if (!mounted) return;

      if (success) {
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (_) =>
                  ResetPasswordActivity(email: widget.email, otp: code),
            ),
          );
        }
      } else {
        _clearAllFields();
        _showErrorDialog(
          _forgotViewModel.errorMessageConfirm ??
              AppStrings.invalid_code_please_try_again,
        );
      }
    } catch (e) {
      if (!mounted) return;
      _showErrorDialog(AppStrings.an_error_occurred_please_try_again);
    } finally {
      if (mounted) setState(() => _isVerifying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double availableWidth = screenWidth - 96;
    double boxWidth = (availableWidth / 6) - 8;
    boxWidth = boxWidth.clamp(30, 50);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.blue_F0F7FF, AppColors.blue_F5FCFF],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.arrow_back_outlined,
                    size: 16,
                    color: AppColors.black_1D2530,
                  ),
                  label: const Text(
                    AppStrings.back,
                    style: TextStyle(
                      fontFamily: "Inter_regular",
                      color: AppColors.black_1D2530,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Center(
                  child: SingleChildScrollView(
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.black.withValues(alpha: 0.05),
                            blurRadius: 8,
                            spreadRadius: 5,
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.blue_0680F9,
                                  AppColors.blue_680F9,
                                ],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                            ),
                            child: const Icon(
                              Icons.verified_user_outlined,
                              color: Colors.white,
                              size: 36,
                            ),
                          ),
                          const SizedBox(height: 24),
                          const Text(
                            AppStrings.verify_code,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 30,
                              fontFamily: "Inter_bold",
                              color: AppColors.black_1D2530,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            AppStrings
                                .enter_the_6_digit_code_sent_to_your_email,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.blue_6C7C93,
                              fontFamily: "Inter_regular",
                              fontSize: 15,
                            ),
                          ),
                          const SizedBox(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(6, (index) {
                              return Container(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 4,
                                ),
                                width: boxWidth,
                                height: 60,
                                child: KeyboardListener(
                                  focusNode: FocusNode(),
                                  onKeyEvent: (event) {
                                    if (event is KeyDownEvent &&
                                        event.logicalKey ==
                                            LogicalKeyboardKey.backspace) {
                                      if (_controllers[index].text.isEmpty &&
                                          index > 0) {
                                        _focusNodes[index - 1].requestFocus();
                                      }
                                    }
                                  },
                                  child: TextField(
                                    controller: _controllers[index],
                                    focusNode: _focusNodes[index],
                                    textAlign: TextAlign.center,
                                    keyboardType: TextInputType.number,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontFamily: "Inter_regular",
                                      color: AppColors.black_1D2530,
                                    ),
                                    inputFormatters: [
                                      LengthLimitingTextInputFormatter(1),
                                      FilteringTextInputFormatter.digitsOnly,
                                    ],
                                    onChanged: (value) {
                                      setState(() {});
                                      if (value.length > 1) {
                                        _controllers[index].text =
                                            value[value.length - 1];
                                        _controllers[index].selection =
                                            TextSelection.fromPosition(
                                              TextPosition(offset: 1),
                                            );
                                      }
                                      if (value.isNotEmpty &&
                                          index < _controllers.length - 1) {
                                        _focusNodes[index + 1].requestFocus();
                                      }
                                    },
                                    onTap: () {
                                      for (int i = 0; i < index; i++) {
                                        if (_controllers[i].text.isEmpty) {
                                          _focusNodes[i].requestFocus();
                                          return;
                                        }
                                      }
                                    },
                                    decoration: InputDecoration(
                                      isDense: true,
                                      contentPadding:
                                          const EdgeInsets.symmetric(
                                            vertical: 12,
                                          ),
                                      filled: true,
                                      fillColor:
                                          _controllers[index].text.isNotEmpty
                                          ? AppColors.blue_F0F7FF
                                          : AppColors.white,
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: BorderSide(
                                          color:
                                              _controllers[index]
                                                  .text
                                                  .isNotEmpty
                                              ? AppColors.blue_4591FF
                                              : AppColors.gray_E0E5EB,
                                          width: 1,
                                        ),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8),
                                        borderSide: const BorderSide(
                                          color: AppColors.blue_4591FF,
                                          width: 1,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ),
                          const SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: _isVerifying || !isAllFilled
                                  ? null
                                  : _onVerify,
                              style: ButtonStyle(
                                backgroundColor:
                                    WidgetStateProperty.resolveWith<Color>((
                                      states,
                                    ) {
                                      if (states.contains(
                                        WidgetState.disabled,
                                      )) {
                                        return isAllFilled
                                            ? AppColors.blue_0680F9
                                            : AppColors.blue_82BFFC;
                                      }
                                      return AppColors.blue_0680F9;
                                    }),
                                shape: WidgetStateProperty.all(
                                  RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                elevation: WidgetStateProperty.all(2),
                                padding: WidgetStateProperty.all(
                                  const EdgeInsets.symmetric(vertical: 16),
                                ),
                              ),
                              child: SizedBox(
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    Opacity(
                                      opacity: _isVerifying ? 0 : 1,
                                      child: const Text(
                                        AppStrings.reset_paswword,
                                        style: TextStyle(
                                          color: AppColors.white,
                                          fontFamily: "Inter_bold",
                                          fontSize: 16,
                                        ),
                                      ),
                                    ),
                                    if (_isVerifying)
                                      const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          color: Colors.white,
                                          strokeWidth: 2,
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(height: 32),
                          const Text(
                            AppStrings.didnt_receive_the_code,
                            style: TextStyle(
                              color: AppColors.blue_6C7C93,
                              fontFamily: "Inter_regular",
                              fontSize: 13,
                            ),
                          ),
                          TextButton(
                            onPressed: (_remainingSeconds > 0 || _isResending)
                                ? null
                                : _onResend,
                            child: Text(
                              _remainingSeconds > 0
                                  ? "${AppStrings.resend_in} $_remainingSeconds s"
                                  : AppStrings.resend_code,
                              style: TextStyle(
                                fontFamily: "Inter_regular",
                                color: (_remainingSeconds > 0 || _isResending)
                                    ? Colors.grey
                                    : AppColors.blue_0680F9,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
