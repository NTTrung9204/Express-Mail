import 'package:express_mail/ui/login/LoginActivity.dart';
import 'package:flutter/material.dart';
import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:provider/provider.dart';
import 'ForgotViewModel.dart';

class ResetPasswordActivity extends StatefulWidget {
  final String email;
  final String otp;

  const ResetPasswordActivity({
    super.key,
    required this.email,
    required this.otp,
  });

  @override
  State<ResetPasswordActivity> createState() => _ResetPasswordActivityState();
}

class _ResetPasswordActivityState extends State<ResetPasswordActivity> {
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  bool _isNewPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  bool get _isLengthValid => _newPasswordController.text.length >= 6;

  bool get _isMatchValid =>
      _newPasswordController.text == _confirmPasswordController.text &&
      _newPasswordController.text.isNotEmpty;

  Future<void> _onResetPressed(
    BuildContext context,
    ForgotViewModel viewModel,
  ) async {
    if (!_isLengthValid || !_isMatchValid) {
      String message = '';
      if (!_isLengthValid) {
        message = AppStrings.password_must_be_at_least_6_characters;
      } else if (!_isMatchValid) {
        message = AppStrings.passwords_do_not_match;
      }
      _showErrorDialog(message);
      return;
    }

    final success = await viewModel.resetPassword(
      widget.email,
      widget.otp,
      _newPasswordController.text.trim(),
    );

    if (!mounted) return;

    if (success) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const LoginActivity()),
            (route) => false,
      );
    } else if (viewModel.errorMessageResetPassword != null) {
      _showErrorDialog(viewModel.errorMessageResetPassword!);
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
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
                  onPressed: () => Navigator.pop(dialogContext),
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

  @override
  void dispose() {
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ForgotViewModel(),
      child: Consumer<ForgotViewModel>(
        builder: (context, viewModel, _) {
          return Scaffold(
            body: SafeArea(
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.blue_F0F7FF, AppColors.blue_F5FCFF],
                  ),
                ),
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
                          // Icon
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
                              Icons.lock_outline,
                              color: Colors.white,
                              size: 36,
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Title
                          const Text(
                            AppStrings.reset_paswword,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 30,
                              fontFamily: "Inter_bold",
                              color: AppColors.black_1D2530,
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            AppStrings.enter_your_new_password_below,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: AppColors.blue_6C7C93,
                              fontSize: 15,
                              fontFamily: "Inter_regular",
                            ),
                          ),
                          const SizedBox(height: 24),

                          // New password
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              AppStrings.new_password,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.black_1D2530,
                                fontFamily: "Inter_regular",
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _newPasswordController,
                            obscureText: !_isNewPasswordVisible,
                            onChanged: (_) => setState(() {}),
                            style: const TextStyle(
                              fontFamily: "Inter_regular",
                              color: AppColors.blue_6C7C93,
                              fontSize: 15,
                            ),
                            decoration: InputDecoration(
                              hintText: AppStrings.enter_new_password,
                              filled: true,
                              fillColor: AppColors.blue_F0F7FF,
                              enabledBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.all(
                                  Radius.circular(10),
                                ),
                                borderSide: BorderSide(
                                  color: AppColors.gray_E0E5EB,
                                  width: 1,
                                ),
                              ),
                              focusedBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.all(
                                  Radius.circular(10),
                                ),
                                borderSide: BorderSide(
                                  color: AppColors.blue_4591FF,
                                  width: 1,
                                ),
                              ),
                              prefixIcon: const Padding(
                                padding: EdgeInsets.fromLTRB(12, 16, 12, 16),
                                child: Icon(
                                  Icons.lock_outline,
                                  color: AppColors.blue_6C7C93,
                                ),
                              ),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _isNewPasswordVisible
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                  color: AppColors.blue_6C7C93,
                                ),
                                onPressed: () {
                                  setState(
                                    () => _isNewPasswordVisible =
                                        !_isNewPasswordVisible,
                                  );
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 22),

                          // Confirm password
                          Align(
                            alignment: Alignment.centerLeft,
                            child: Text(
                              AppStrings.confirm_password,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppColors.black_1D2530,
                                fontFamily: "Inter_regular",
                              ),
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _confirmPasswordController,
                            obscureText: !_isConfirmPasswordVisible,
                            onChanged: (_) => setState(() {}),
                            style: const TextStyle(
                              fontFamily: "Inter_regular",
                              color: AppColors.blue_6C7C93,
                              fontSize: 15,
                            ),
                            decoration: InputDecoration(
                              hintText: AppStrings.confirm_new_password,
                              filled: true,
                              fillColor: AppColors.blue_F0F7FF,
                              enabledBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.all(
                                  Radius.circular(10),
                                ),
                                borderSide: BorderSide(
                                  color: AppColors.gray_E0E5EB,
                                  width: 1,
                                ),
                              ),
                              focusedBorder: const OutlineInputBorder(
                                borderRadius: BorderRadius.all(
                                  Radius.circular(10),
                                ),
                                borderSide: BorderSide(
                                  color: AppColors.blue_4591FF,
                                  width: 1,
                                ),
                              ),
                              prefixIcon: const Padding(
                                padding: EdgeInsets.fromLTRB(12, 16, 12, 16),
                                child: Icon(
                                  Icons.lock_outline,
                                  color: AppColors.blue_6C7C93,
                                ),
                              ),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _isConfirmPasswordVisible
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                  color: AppColors.blue_6C7C93,
                                ),
                                onPressed: () {
                                  setState(
                                    () => _isConfirmPasswordVisible =
                                        !_isConfirmPasswordVisible,
                                  );
                                },
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Password requirements
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: AppColors.blue_EBFAFF,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  AppStrings.password_requirements,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontFamily: "Inter_regular",
                                    color: AppColors.blue_0680F9,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.check_circle_outline,
                                      color: _isLengthValid
                                          ? Colors.green
                                          : Colors.grey,
                                      size: 12,
                                    ),
                                    const SizedBox(width: 9),
                                    const Text(
                                      AppStrings.at_least_6_characters,
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontFamily: "Inter_regular",
                                        color: AppColors.blue_6C7C93,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.check_circle_outline,
                                      color: _isMatchValid
                                          ? Colors.green
                                          : Colors.grey,
                                      size: 12,
                                    ),
                                    const SizedBox(width: 9),
                                    const Text(
                                      AppStrings.passwords_match,
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontFamily: "Inter_regular",
                                        color: AppColors.blue_6C7C93,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Reset button
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: viewModel.isLoadingResetPassword
                                  ? null
                                  : () => _onResetPressed(context, viewModel),
                              style: ButtonStyle(
                                backgroundColor:
                                    WidgetStateProperty.resolveWith<Color>((
                                      states,
                                    ) {
                                      return AppColors.blue_0680F9;
                                    }),
                                shape: WidgetStateProperty.all(
                                  RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                padding: WidgetStateProperty.all(
                                  const EdgeInsets.symmetric(vertical: 16),
                                ),
                              ),
                              child: SizedBox(
                                child: Stack(
                                  alignment: Alignment.center,
                                  children: [
                                    Opacity(
                                      opacity: viewModel.isLoadingResetPassword
                                          ? 0
                                          : 1,
                                      child: const Text(
                                        AppStrings.reset_paswword,
                                        style: TextStyle(
                                          color: AppColors.white,
                                          fontFamily: "Inter_bold",
                                          fontSize: 16,
                                        ),
                                      ),
                                    ),
                                    if (viewModel.isLoadingResetPassword)
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

                          const SizedBox(height: 16),

                          // Back to home
                          TextButton(
                            onPressed: () => Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const LoginActivity(),
                              ),
                            ),
                            child: const Text(
                              AppStrings.back_to_home,
                              style: TextStyle(
                                color: AppColors.blue_0680F9,
                                fontFamily: "Inter_regular",
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
