import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';

class ApiService {
  static String get baseUrl {
    return AppConstants.baseUrl;
  }

  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.tokenKey);
  }

  static Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      final token = await _getToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  static Future<ApiResponse> get(String endpoint) async {
    try {
      final headers = await _getHeaders();
      final response = await http
          .get(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
          )
          .timeout(AppConstants.connectionTimeout);

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: _getErrorMessage(e),
      );
    }
  }

  static Future<ApiResponse> post(
    String endpoint,
    Map<String, dynamic> data, {
    bool includeAuth = true,
  }) async {
    try {
      final url = '$baseUrl$endpoint';
      print('🌐 API POST: $url');
      print('📤 Request Data: ${json.encode(data)}');
      
      final headers = await _getHeaders(includeAuth: includeAuth);
      final response = await http
          .post(
            Uri.parse(url),
            headers: headers,
            body: json.encode(data),
          )
          .timeout(AppConstants.connectionTimeout);

      print('✅ Response Status: ${response.statusCode}');
      print('📥 Response Body: ${response.body}');
      
      return _handleResponse(response);
    } catch (e) {
      print('❌ API Error: $e');
      return ApiResponse(
        success: false,
        message: _getErrorMessage(e),
      );
    }
  }

  static Future<ApiResponse> put(
    String endpoint,
    Map<String, dynamic> data,
  ) async {
    try {
      final headers = await _getHeaders();
      final response = await http
          .put(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
            body: json.encode(data),
          )
          .timeout(AppConstants.connectionTimeout);

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: _getErrorMessage(e),
      );
    }
  }

  static Future<ApiResponse> delete(String endpoint) async {
    try {
      final headers = await _getHeaders();
      final response = await http
          .delete(
            Uri.parse('$baseUrl$endpoint'),
            headers: headers,
          )
          .timeout(AppConstants.connectionTimeout);

      return _handleResponse(response);
    } catch (e) {
      return ApiResponse(
        success: false,
        message: _getErrorMessage(e),
      );
    }
  }

  static ApiResponse _handleResponse(http.Response response) {
    try {
      print('🔍 Parsing response...');
      print('📊 Status Code: ${response.statusCode}');
      print('📥 Raw Response: ${response.body}');
      
      // Check if response is empty
      if (response.body.isEmpty) {
        return ApiResponse(
          success: response.statusCode >= 200 && response.statusCode < 300,
          message: response.statusCode >= 200 && response.statusCode < 300 
              ? 'Success' 
              : 'Server error',
        );
      }

      // Try to parse as JSON
      dynamic body;
      try {
        body = json.decode(response.body);
        print('📦 Parsed body: $body');
      } catch (jsonError) {
        print('❌ JSON parsing error: $jsonError');
        // If it's not JSON, it might be an HTML error page
        if (response.body.contains('<html>') || response.body.contains('<!DOCTYPE')) {
          return ApiResponse(
            success: false,
            message: 'Server error - received HTML instead of JSON',
          );
        }
        return ApiResponse(
          success: false,
          message: 'Invalid response format',
        );
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return ApiResponse(
          success: body['success'] ?? true,
          message: body['message'] ?? 'Success',
          data: body['data'],
        );
      } else {
        return ApiResponse(
          success: false,
          message: body['message'] ?? 'An error occurred',
          errors: body['errors'],
        );
      }
    } catch (e) {
      print('❌ Response parsing error: $e');
      return ApiResponse(
        success: false,
        message: 'Failed to parse response: ${e.toString()}',
      );
    }
  }

  static String _getErrorMessage(dynamic error) {
    if (error.toString().contains('SocketException')) {
      return 'No internet connection';
    } else if (error is http.ClientException) {
      return 'Connection failed';
    } else if (error.toString().contains('TimeoutException')) {
      return 'Request timeout';
    }
    return 'An error occurred';
  }
}

class ApiResponse {
  final bool success;
  final String message;
  final dynamic data;
  final dynamic errors;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.errors,
  });
}
