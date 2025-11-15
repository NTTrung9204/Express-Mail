import 'package:express_mail/resources/colors.dart';
import 'package:express_mail/resources/strings.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:express_mail/ui/launch/LaunchActivity.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: []);

  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    print("Error loading .env: ${e.toString()}");
  }

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: AppStrings.app_name,
      theme: ThemeData(
        primaryColor: AppColors.blue_127AE2,
        scaffoldBackgroundColor: Colors.white,
        fontFamily: "Inter_regular",
      ),
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: [
        Locale('vi'),
        Locale('en'),
      ],
      home: const LaunchActivity(),
    );
  }
}
