import 'package:express_mail/ui/forgot/ForgotActivity.dart';
import 'package:express_mail/ui/home/HomeActivity.dart';
import 'package:express_mail/ui/login/LoginViewModel.dart';
import 'package:express_mail/ui/register/RegisterActivity.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';

import '../../resources/strings.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../resources/colors.dart';
import 'package:flutter/services.dart';

Future<void> main() async {
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: []);
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    print("Error loading .env: ${e.toString()}");
  }

  runApp(
    ChangeNotifierProvider(
      create: (_) => LoginViewModel(),
      child: LoginActivity(),
    ),
  );
}

class LoginActivity extends StatelessWidget {
  const LoginActivity({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: const LoginScreen(),
    );
  }
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _username = TextEditingController();
  final _password = TextEditingController();
  bool _obscurePassword = true;
  String _userLabel = AppStrings.username;
  String _continueLabelCurrent = AppStrings.continue_with_username;
  TextInputType _inputType = TextInputType.text;
  String _icon = "assets/images/ic_username.svg";

  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
  }

  void _login() async {
    final viewModel = Provider.of<LoginViewModel>(context, listen: false);

    String username = _username.text.trim();
    String password = _password.text.trim();

    if (username.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text(AppStrings.empty_fields_error)),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    bool success = await viewModel.login(username, password);

    setState(() {
      _isLoading = false;
    });

    if (success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) =>
              HomeActivity(loginResponse: viewModel.loginResponse!),
        ),
      );
    } else {
      setState(() {});
    }
  }

  void _setUserInput(String label) {
    setState(() {
      _userLabel = label;
      _username.clear();
      if (label == AppStrings.email) {
        _icon = "assets/images/ic_email.svg";
        _inputType = TextInputType.emailAddress;
        _continueLabelCurrent = AppStrings.continue_with_email;
      } else if (label == AppStrings.phone_number) {
        _icon = "assets/images/ic_phone.svg";
        _inputType = TextInputType.phone;
        _continueLabelCurrent = AppStrings.continue_with_phone_number;
      } else {
        _icon = "assets/images/ic_username.svg";
        _inputType = TextInputType.text;
        _continueLabelCurrent = AppStrings.continue_with_username;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Container(
          width: double.infinity,
          height: double.infinity,
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [AppColors.blue_127AE2, AppColors.blue_5AA6F2],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Stack(
            children: [
              Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Icon
                      SvgPicture.asset(
                        "assets/images/ic_delivery.svg",
                        width: 88,
                        height: 88,
                        fit: BoxFit.fill,
                      ),
                      const SizedBox(height: 8),
                      //
                      Text(
                        AppStrings.fast_delivery,
                        style: const TextStyle(
                          fontFamily: "Inter_bold",
                          fontSize: 29,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      //
                      Text(
                        AppStrings.your_delivery_partner,
                        style: const TextStyle(
                          fontFamily: "Inter_regular",
                          fontSize: 15,
                          color: Colors.white,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 32),
                      //
                      Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppColors.white.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(color: AppColors.white, blurRadius: 1),
                          ],
                        ),
                        child: Column(
                          children: [
                            Text(
                              AppStrings.welcome,
                              style: const TextStyle(
                                fontFamily: "Inter_bold",
                                fontSize: 19,
                                color: AppColors.blue_344256,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 11),
                            Text(
                              AppStrings.login_to_start_delivery,
                              style: const TextStyle(
                                fontFamily: "Inter_regular",
                                color: AppColors.gray_7B899D,
                              ),
                            ),
                            const SizedBox(height: 11),
                            TextField(
                              controller: _username,
                              keyboardType: _inputType,
                              style: TextStyle(
                                fontFamily: "Inter_regular",
                                color: AppColors.gray_7B899D,
                                fontSize: 15,
                              ),
                              decoration: InputDecoration(
                                labelText: _userLabel,
                                labelStyle: TextStyle(
                                  color: AppColors.gray_7B899D,
                                  fontSize: 15,
                                  fontFamily: "Inter_regular",
                                ),
                                filled: true,
                                fillColor: AppColors.white_F8F7FC,
                                enabledBorder: const OutlineInputBorder(
                                  borderRadius: BorderRadius.all(
                                    Radius.circular(10),
                                  ),
                                  borderSide: BorderSide(
                                    color: AppColors.gray_EDEFF3,
                                  ),
                                ),
                                focusedBorder: const OutlineInputBorder(
                                  borderRadius: BorderRadius.all(
                                    Radius.circular(10),
                                  ),
                                  borderSide: BorderSide(
                                    color: AppColors.blue_127AE2,
                                    width: 2,
                                  ),
                                ),
                                prefixIcon: Padding(
                                  padding: const EdgeInsets.fromLTRB(
                                    12,
                                    16,
                                    12,
                                    16,
                                  ),
                                  child: SvgPicture.asset(
                                    _icon,
                                    colorFilter: ColorFilter.mode(
                                      AppColors.gray_7B899D,
                                      BlendMode.srcIn,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextField(
                              controller: _password,
                              obscureText: _obscurePassword,
                              style: TextStyle(
                                fontFamily: "Inter_regular",
                                color: AppColors.gray_7B899D,
                                fontSize: 15,
                              ),
                              decoration: InputDecoration(
                                labelText: AppStrings.password,
                                labelStyle: TextStyle(
                                  color: AppColors.gray_7B899D,
                                  fontSize: 15,
                                  fontFamily: "Inter_regular",
                                ),
                                filled: true,
                                fillColor: AppColors.white_F8F7FC,
                                enabledBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.all(
                                    Radius.circular(10),
                                  ),
                                  borderSide: BorderSide(
                                    color: AppColors.gray_EDEFF3,
                                  ),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderRadius: BorderRadius.all(
                                    Radius.circular(10),
                                  ),
                                  borderSide: BorderSide(
                                    color: AppColors.blue_127AE2,
                                    width: 2,
                                  ),
                                ),
                                prefixIcon: Padding(
                                  padding: EdgeInsets.fromLTRB(12, 16, 12, 16),
                                  child: SvgPicture.asset(
                                    "assets/images/ic_password.svg",
                                    colorFilter: ColorFilter.mode(
                                      AppColors.gray_7B899D,
                                      BlendMode.srcIn,
                                    ),
                                  ),
                                ),
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscurePassword
                                        ? Icons.visibility
                                        : Icons.visibility_off,
                                    color: AppColors.gray_7B899D,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscurePassword = !_obscurePassword;
                                    });
                                  },
                                ),
                              ),
                            ),
                            // const SizedBox(height: 18),
                            // Row(
                            //   children: [
                            //     const Expanded(
                            //       child: Divider(
                            //         color: AppColors.gray_DADFE7,
                            //         thickness: 1,
                            //       ),
                            //     ),
                            //     Padding(
                            //       padding: const EdgeInsets.symmetric(
                            //         horizontal: 8.0,
                            //       ),
                            //       child: Text(
                            //         AppStrings.or.toUpperCase(),
                            //         style: const TextStyle(
                            //           fontFamily: "Inter_regular",
                            //           fontSize: 12,
                            //           color: AppColors.gray_7B899D,
                            //         ),
                            //       ),
                            //     ),
                            //     const Expanded(
                            //       child: Divider(
                            //         color: AppColors.gray_DADFE7,
                            //         thickness: 1,
                            //       ),
                            //     ),
                            //   ],
                            // ),
                            // const SizedBox(height: 18),
                            // SizedBox(
                            //   width: double.infinity,
                            //   child: ElevatedButton(
                            //     style: ButtonStyle(
                            //       backgroundColor: WidgetStatePropertyAll(
                            //         AppColors.white_F8F7FC,
                            //       ),
                            //       side: WidgetStatePropertyAll(
                            //         BorderSide(
                            //           color: AppColors.gray_EDEFF3,
                            //           strokeAlign: 1,
                            //           width: 1,
                            //         ),
                            //       ),
                            //       shape: WidgetStatePropertyAll(
                            //         RoundedRectangleBorder(
                            //           borderRadius: BorderRadius.circular(10),
                            //         ),
                            //       ),
                            //       overlayColor:
                            //           WidgetStateProperty.resolveWith((
                            //             states,
                            //           ) {
                            //             if (states.contains(
                            //               WidgetState.pressed,
                            //             )) {
                            //               return AppColors.gray_EDEFF3
                            //                   .withValues(alpha: 1.0);
                            //             }
                            //             if (states.contains(
                            //               WidgetState.hovered,
                            //             )) {
                            //               return AppColors.gray_EDEFF3
                            //                   .withValues(alpha: 0.5);
                            //             }
                            //             return null;
                            //           }),
                            //     ),
                            //     onPressed: () {
                            //       _setUserInput(
                            //         _continueLabelCurrent ==
                            //                 AppStrings
                            //                     .continue_with_phone_number
                            //             ? AppStrings.username
                            //             : AppStrings.phone_number,
                            //       );
                            //     },
                            //     child: Padding(
                            //       padding: EdgeInsets.fromLTRB(0, 17, 0, 17),
                            //       child: Text(
                            //         _continueLabelCurrent ==
                            //                 AppStrings
                            //                     .continue_with_phone_number
                            //             ? AppStrings.continue_with_username
                            //             : AppStrings
                            //                   .continue_with_phone_number,
                            //         style: TextStyle(
                            //           fontFamily: "Inter_bold",
                            //           fontSize: 13,
                            //           color: AppColors.blue_344256,
                            //         ),
                            //       ),
                            //     ),
                            //   ),
                            // ),
                            // const SizedBox(height: 12),
                            // SizedBox(
                            //   width: double.infinity,
                            //   child: ElevatedButton(
                            //     style: ButtonStyle(
                            //       backgroundColor: WidgetStatePropertyAll(
                            //         AppColors.white_F8F7FC,
                            //       ),
                            //       side: WidgetStatePropertyAll(
                            //         BorderSide(
                            //           color: AppColors.gray_EDEFF3,
                            //           strokeAlign: 1,
                            //           width: 1,
                            //         ),
                            //       ),
                            //       shape: WidgetStatePropertyAll(
                            //         RoundedRectangleBorder(
                            //           borderRadius: BorderRadius.circular(10),
                            //         ),
                            //       ),
                            //       overlayColor:
                            //           WidgetStateProperty.resolveWith((
                            //             states,
                            //           ) {
                            //             if (states.contains(
                            //               WidgetState.pressed,
                            //             )) {
                            //               return AppColors.gray_EDEFF3
                            //                   .withValues(alpha: 1.0);
                            //             }
                            //             if (states.contains(
                            //               WidgetState.hovered,
                            //             )) {
                            //               return AppColors.gray_EDEFF3
                            //                   .withValues(alpha: 0.5);
                            //             }
                            //             return null;
                            //           }),
                            //     ),
                            //     onPressed: () {
                            //       _setUserInput(
                            //         _continueLabelCurrent ==
                            //                 AppStrings.continue_with_email
                            //             ? AppStrings.username
                            //             : AppStrings.email,
                            //       );
                            //     },
                            //     child: Padding(
                            //       padding: EdgeInsets.fromLTRB(0, 17, 0, 17),
                            //       child: Text(
                            //         _continueLabelCurrent ==
                            //                 AppStrings.continue_with_email
                            //             ? AppStrings.continue_with_username
                            //             : AppStrings.continue_with_email,
                            //         style: TextStyle(
                            //           fontFamily: "Inter_bold",
                            //           fontSize: 13,
                            //           color: AppColors.blue_344256,
                            //         ),
                            //       ),
                            //     ),
                            //   ),
                            // ),
                            // SizedBox(height: 15),
                            // SizedBox(
                            //   width: double.infinity,
                            //   child: TextButton(
                            //     onPressed: () {
                            //       Navigator.push(
                            //         context,
                            //         MaterialPageRoute(
                            //           builder: (context) =>
                            //               const RegisterActivity(),
                            //         ),
                            //       );
                            //     },
                            //     style: ButtonStyle(
                            //       alignment: Alignment.center,
                            //     ),
                            //     child: Text(
                            //       AppStrings.register,
                            //       style: const TextStyle(
                            //         fontFamily: "Inter_bold",
                            //         fontSize: 13,
                            //         color: AppColors.blue_127AE2,
                            //       ),
                            //     ),
                            //   ),
                            // ),
                            SizedBox(height: 15),
                            Consumer<LoginViewModel>(
                              builder: (context, viewModel, _) {
                                if (viewModel.errorMessage == null ||
                                    viewModel.errorMessage!.isEmpty) {
                                  return const SizedBox.shrink();
                                }
                                return SizedBox(
                                  width: double.infinity,
                                  child: Text(
                                    viewModel.errorMessage!,
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      fontFamily: "Inter_regular",
                                      fontSize: 13,
                                      color: AppColors.red,
                                    ),
                                  ),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 32),
                      SizedBox(
                        width: double.infinity,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [AppColors.green_22C35D, AppColors.green_22C35D],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: TextButton(
                            style: ButtonStyle(
                              backgroundColor: MaterialStatePropertyAll(
                                Colors.transparent,
                              ),
                              overlayColor: MaterialStateProperty.resolveWith((
                                states,
                              ) {
                                if (states.contains(MaterialState.pressed)) {
                                  return AppColors.gray_EDEFF3.withOpacity(0.1);
                                }
                                return null;
                              }),
                              shape: MaterialStatePropertyAll(
                                RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              shadowColor: MaterialStatePropertyAll(
                                Colors.transparent,
                              ),
                            ),
                            onPressed: _login,
                            child: Text(
                              AppStrings.login,
                              style: TextStyle(
                                fontFamily: "Inter_bold",
                                fontSize: 13,
                                color: AppColors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const ForgotActivity(),
                              ),
                            );
                          },
                          style: TextButton.styleFrom(
                            padding: EdgeInsets.zero,
                            minimumSize: Size(double.infinity, 0),
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                            alignment: Alignment.center,
                          ),
                          child: Text(
                            AppStrings.forgot_password,
                            style: const TextStyle(
                              fontFamily: "Inter_bold",
                              fontSize: 13,
                              color: AppColors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (_isLoading)
                Container(
                  color: Colors.black.withOpacity(0.3),
                  child: const Center(
                    child: CircularProgressIndicator(
                      color: AppColors.blue_4D77FD,
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
