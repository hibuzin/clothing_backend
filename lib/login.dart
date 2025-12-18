import 'dart:convert';

import 'package:flutter/material.dart';

import 'package:http/http.dart' as http;

import 'myaccount.dart';

// ==========================================
// 1. AUTH SERVICE (Networking Logic)
// ==========================================
class AuthService {
  // IMPORTANT:
  // - Android Emulator: use 'http://10.0.2.2:5000/api/auth'
  // - iOS Simulator:    use 'http://127.0.0.1:5000/api/auth'
  // - Physical Device:  use 'http://YOUR_PC_IP_ADDRESS:5000/api/auth'
  final String baseUrl = 'http://127.0.0.1:5000/api/auth';

  Future<Map<String, dynamic>> login(String email, String password) async {
    final url = Uri.parse('$baseUrl/login');

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final responseData = jsonDecode(response.body);
      print('API Response Status Code: ${response.statusCode}');
      print('API Response Body: $responseData');

      if (response.statusCode == 200) {
        return responseData; // Success: Returns {token: "...", user: {...}}
      } else {
        // Failure: Throw the specific error message from the backend
        throw Exception(responseData['error'] ?? 'An unknown error occurred');
      }
    } catch (e) {
      print('Network/API Error: $e');
      rethrow; // Pass the error up to the UI
    }
  }
}

// ==========================================
// 2. LOGIN SCREEN (UI Logic)
// ==========================================
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  final AuthService _authService = AuthService(); // Instance of our service
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);

      try {
        final email = _emailController.text.trim();
        final password = _passwordController.text.trim();

        // Call the backend
        final result = await _authService.login(email, password);

        if (!mounted) return;

        final userName = result['user']['name'];
        final token = result['token'];
        final userEmail = result['user']['email'];

        // Success UI Feedback
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Login Successful! Welcome $userName'),
            backgroundColor: Colors.green,
          ),
        );

        print("Logged in. Token: $token");

        // Navigate to MyAccount screen
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => MyAccountScreen(
              userName: userName,
              userEmail: userEmail,
              token: token,
            ),
          ),
        );
      } catch (e) {
        if (!mounted) return;
        // Error UI Feedback
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString().replaceAll('Exception: ', '')),
            backgroundColor: Colors.red,
          ),
        );
      } finally {
        if (mounted) {
          setState(() => _isLoading = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: const Text('Login'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Icon(
                  Icons.person_outline,
                  size: 80,
                  color: Colors.deepPurple,
                ),
                const SizedBox(height: 32),
                const Text(
                  'Welcome Back!',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 32),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.email),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty)
                      return 'Please enter your email';
                    if (!value.contains('@'))
                      return 'Please enter a valid email';
                    return null;
                  },
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.lock),
                  ),
                  obscureText: true,
                  validator: (value) {
                    if (value == null || value.isEmpty)
                      return 'Please enter your password';
                    if (value.length < 6)
                      return 'Password must be at least 6 characters';
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    backgroundColor: Colors.deepPurple,
                    foregroundColor: Colors.white,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text('Login', style: TextStyle(fontSize: 16)),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Forgot password clicked')),
                    );
                  },
                  child: const Text('Forgot Password?'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
