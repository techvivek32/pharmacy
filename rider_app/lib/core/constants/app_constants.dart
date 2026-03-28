class AppConstants {
  static const String baseUrl = 'http://localhost:3000/api';
  static const String androidEmulatorUrl = 'http://10.0.2.2:3000/api';
  static const String iosSimulatorUrl = 'http://localhost:3000/api';
  
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  
  static const Duration connectionTimeout = Duration(seconds: 30);
}
