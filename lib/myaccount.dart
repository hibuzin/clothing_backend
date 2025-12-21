import 'package:flutter/material.dart';

import 'category.dart';
import 'subcategory.dart';
import 'product_details.dart';
import 'privacy_security.dart';
import 'help_support.dart';
import 'about.dart';

class MyAccountScreen extends StatefulWidget {
  const MyAccountScreen({super.key});

  @override
  State<MyAccountScreen> createState() => _MyAccountScreenState();
}

class _MyAccountScreenState extends State<MyAccountScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Account'), centerTitle: true),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: GridView.count(
          crossAxisCount: 2,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          children: [
            AccountContainer(
              icon: Icons.person,
              title: 'Category',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => CategoryScreen()),
                );
              },
            ),
            AccountContainer(
              icon: Icons.lock,
              title: 'Subcategory',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => SubCategoryScreen()),
                );
              },
            ),
            AccountContainer(
              icon: Icons.notifications,
              title: 'Product Details',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => ProductDetailsScreen()),
                );
              },
            ),
            AccountContainer(
              icon: Icons.security,
              title: 'Privacy & Security',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => PrivacySecurityScreen()),
                );
              },
            ),
            AccountContainer(
              icon: Icons.help,
              title: 'Help & Support',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => HelpSupportScreen()),
                );
              },
            ),
            AccountContainer(
              icon: Icons.info,
              title: 'About',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => AboutScreen()),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class AccountContainer extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const AccountContainer({
    super.key,
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.deepPurple.shade50,
      borderRadius: BorderRadius.circular(16),
      elevation: 3,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          debugPrint('Tapped: $title');
          onTap();
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: Colors.deepPurple),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }
}
