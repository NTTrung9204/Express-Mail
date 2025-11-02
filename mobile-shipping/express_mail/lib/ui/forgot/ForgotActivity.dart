import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:express_mail/ui/forgot/VerifyCodeActivity.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'ForgotViewModel.dart';

class ForgotActivity extends StatefulWidget {
  const ForgotActivity({super.key});

  @override
  State<ForgotActivity> createState() => _ForgotActivityState();
}

class _ForgotActivityState extends State<ForgotActivity> {
  final TextEditingController _emailController = TextEditingController();
  bool _isEmailValid = false;

  @override
  void initState() {
    super.initState();
    _emailController.addListener(_validateEmail);
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _validateEmail() {
    final email = _emailController.text.trim();
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    setState(() {
      _isEmailValid = emailRegex.hasMatch(email);
    });
  }

  Future<void> _onSendCodePressed(BuildContext context) async {
    final viewModel = context.read<ForgotViewModel>();
    final email = _emailController.text.trim();

    if (email.isEmpty) {
      _showErrorDialog(AppStrings.empty_fields_error);
      return;
    }
    if (!_isEmailValid) {
      _showErrorDialog(AppStrings.invalid_email_format);
      return;
    }

    final success = await viewModel.forgot(email);
    if (!mounted) return;

    if (success) {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => VerifyCodeActivity(email: email)),
      );
    } else if (viewModel.errorMessage != null) {
      _showErrorDialog(viewModel.errorMessage!);
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
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ForgotViewModel(),
      child: Consumer<ForgotViewModel>(
        builder: (context, viewModel, _) {
          final buttonColor = _isEmailValid
              ? AppColors.blue_0680F9
              : AppColors.blue_82BFFC;

          return Scaffold(
            resizeToAvoidBottomInset: true,
            body: Container(
              width: double.infinity,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppColors.blue_F0F7FF, AppColors.blue_F5FCFF],
                ),
              ),
              child: SafeArea(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    return SingleChildScrollView(
                      padding: EdgeInsets.only(
                        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
                        top: 16,
                      ),
                      child: ConstrainedBox(
                        constraints: BoxConstraints(
                          minHeight: constraints.maxHeight,
                        ),
                        child: IntrinsicHeight(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                margin: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                padding: const EdgeInsets.all(32),
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.black.withOpacity(0.05),
                                      blurRadius: 8,
                                      spreadRadius: 5,
                                    ),
                                  ],
                                ),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    // Lock icon
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
                                      AppStrings.forgot_password_,
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: 30,
                                        fontFamily: "Inter_bold",
                                        color: AppColors.black_1D2530,
                                      ),
                                    ),
                                    const SizedBox(height: 12),

                                    // Subtitle
                                    const Text(
                                      AppStrings.enter_your_email_address,
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        color: AppColors.blue_6C7C93,
                                        fontFamily: "Inter_regular",
                                        fontSize: 15,
                                      ),
                                    ),
                                    const SizedBox(height: 28),

                                    // Email input
                                    TextField(
                                      controller: _emailController,
                                      keyboardType: TextInputType.emailAddress,
                                      style: const TextStyle(
                                        fontFamily: "Inter_regular",
                                        color: AppColors.blue_6C7C93,
                                        fontSize: 15,
                                      ),
                                      decoration: const InputDecoration(
                                        hintText: AppStrings.enter_your_email,
                                        filled: true,
                                        fillColor: AppColors.blue_F0F7FF,
                                        enabledBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.all(
                                            Radius.circular(10),
                                          ),
                                          borderSide: BorderSide(
                                            color: AppColors.gray_E0E5EB,
                                            width: 1,
                                          ),
                                        ),
                                        focusedBorder: OutlineInputBorder(
                                          borderRadius: BorderRadius.all(
                                            Radius.circular(10),
                                          ),
                                          borderSide: BorderSide(
                                            color: AppColors.blue_4591FF,
                                            width: 1,
                                          ),
                                        ),
                                        prefixIcon: Padding(
                                          padding: EdgeInsets.fromLTRB(
                                            12,
                                            16,
                                            12,
                                            16,
                                          ),
                                          child: Icon(
                                            Icons.email_outlined,
                                            color: AppColors.blue_6C7C93,
                                          ),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 24),

                                    // Send Code button
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton(
                                        onPressed: viewModel.isLoading
                                            ? null
                                            : () => _onSendCodePressed(context),
                                        style: ButtonStyle(
                                          backgroundColor:
                                              MaterialStateProperty.all(
                                                buttonColor,
                                              ),
                                          shape: MaterialStateProperty.all(
                                            RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(10),
                                            ),
                                          ),
                                          padding: MaterialStateProperty.all(
                                            const EdgeInsets.all(16),
                                          ),
                                          elevation: MaterialStateProperty.all(
                                            2,
                                          ),
                                        ),
                                        child: SizedBox(
                                          child: Stack(
                                            alignment: Alignment.center,
                                            children: [
                                              Opacity(
                                                opacity: viewModel.isLoading
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
                                              if (viewModel.isLoading)
                                                const SizedBox(
                                                  width: 20,
                                                  height: 20,
                                                  child:
                                                      CircularProgressIndicator(
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

                                    // Back button
                                    TextButton(
                                      onPressed: () => Navigator.pop(context),
                                      child: const Text(
                                        AppStrings.back_to_home,
                                        style: TextStyle(
                                          fontFamily: "Inter_regular",
                                          color: AppColors.blue_0680F9,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
