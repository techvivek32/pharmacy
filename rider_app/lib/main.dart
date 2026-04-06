import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/delivery_provider.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/pending_approval_screen.dart';
import 'features/home/screens/home_screen.dart';
import 'features/deliveries/screens/nearby_deliveries_screen.dart';
import 'features/deliveries/screens/delivery_detail_screen.dart';
import 'features/deliveries/screens/navigation_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => DeliveryProvider()),
      ],
      child: MaterialApp(
        title: 'OrdoGo Rider',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        routes: {
          '/': (context) => const SplashScreen(),
          '/login': (context) => const LoginScreen(),
          '/home': (context) => const HomeScreen(),
          '/pending-approval': (context) => const PendingApprovalScreen(),
        },
        onGenerateRoute: (settings) {
          if (settings.name == '/delivery-detail') {
            final delivery = settings.arguments;
            return MaterialPageRoute(
              builder: (context) => DeliveryDetailScreen(delivery: delivery),
            );
          }
          if (settings.name == '/navigation') {
            final delivery = settings.arguments;
            return MaterialPageRoute(
              builder: (context) => NavigationScreen(delivery: delivery),
            );
          }
          return null;
        },
      ),
    );
  }
}
