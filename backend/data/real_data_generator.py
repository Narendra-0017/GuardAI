"""
Real Data Generator for GuardAI
Generates realistic transaction and email data for testing
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any
import json

class RealDataGenerator:
    def __init__(self):
        np.random.seed(42)
        random.seed(42)
        
        # Realistic merchant categories
        self.merchant_categories = [
            'retail', 'food', 'gas', 'online', 'travel', 'electronics', 
            'healthcare', 'entertainment', 'utilities', 'education'
        ]
        
        # Realistic locations
        self.countries = ['US', 'CA', 'UK', 'AU', 'DE', 'FR', 'JP', 'CN']
        self.high_risk_countries = ['NG', 'PK', 'BD', 'KE', 'GH']
        
        # Real transaction patterns
        self.hourly_patterns = {
            0: 0.1, 1: 0.05, 2: 0.03, 3: 0.02, 4: 0.02, 5: 0.05,
            6: 0.15, 7: 0.3, 8: 0.4, 9: 0.35, 10: 0.3, 11: 0.25,
            12: 0.2, 13: 0.25, 14: 0.3, 15: 0.35, 16: 0.4, 17: 0.45,
            18: 0.5, 19: 0.45, 20: 0.35, 21: 0.25, 22: 0.15, 23: 0.1
        }
    
    def generate_transactions(self, n_transactions: int = 100, fraud_rate: float = 0.05) -> List[Dict[str, Any]]:
        """Generate realistic transaction data"""
        transactions = []
        n_fraud = int(n_transactions * fraud_rate)
        n_legit = n_transactions - n_fraud
        
        # Generate legitimate transactions
        for i in range(n_legit):
            transaction = self._generate_legitimate_transaction(i)
            transactions.append(transaction)
        
        # Generate fraudulent transactions
        for i in range(n_fraud):
            transaction = self._generate_fraudulent_transaction(n_legit + i)
            transactions.append(transaction)
        
        # Shuffle and sort by timestamp
        random.shuffle(transactions)
        transactions.sort(key=lambda x: x['timestamp'])
        
        return transactions
    
    def _generate_legitimate_transaction(self, index: int) -> Dict[str, Any]:
        """Generate a legitimate transaction"""
        # Time-based patterns
        hour = self._sample_hour_by_pattern()
        
        # Amount based on merchant category
        merchant_cat = random.choices(
            self.merchant_categories, 
            weights=[30, 20, 15, 15, 10, 5, 3, 2, 2, 1]
        )[0]
        
        amount = self._get_realistic_amount(merchant_cat, is_fraud=False)
        
        # Location (mostly domestic)
        is_foreign = random.choices([0, 1], weights=[0.95, 0.05])[0]
        country = random.choice(self.high_risk_countries) if is_foreign else random.choice(self.countries)
        is_high_risk = 1 if country in self.high_risk_countries else 0
        
        # Account characteristics
        age_of_account = random.lognormvariate(5.5, 1.0)  # Most accounts are older
        age_of_account = max(1, min(age_of_account, 2000))  # Clamp between 1 day and ~5.5 years
        
        return {
            'transaction_id': f'TXN_{index:06d}',
            'timestamp': (datetime.now() - timedelta(hours=random.randint(0, 168))).isoformat(),
            'amount': round(amount, 2),
            'hour_of_day': hour,
            'day_of_week': datetime.now().weekday(),
            'merchant_category': merchant_cat,
            'merchant_name': self._get_merchant_name(merchant_cat),
            'card_present': random.choices([1, 0], weights=[0.7, 0.3])[0],
            'distance_from_home': np.random.exponential(10) if not is_foreign else np.random.exponential(100),
            'transactions_last_hour': max(0, int(np.random.poisson(2))),
            'age_of_account': int(age_of_account),
            'is_foreign': is_foreign,
            'is_high_risk_country': is_high_risk,
            'country': country,
            'is_fraud': 0,
            'fraud_probability': random.uniform(0.01, 0.3),
            'user_id': f'user_{random.randint(1, 1000):04d}',
            'device_id': f'device_{random.randint(1, 100):03d}',
            'ip_address': f'{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}'
        }
    
    def _generate_fraudulent_transaction(self, index: int) -> Dict[str, Any]:
        """Generate a fraudulent transaction with suspicious patterns"""
        # Fraudulent transactions often occur at unusual hours
        hour = random.choices(
            list(range(24)), 
            weights=[0.15, 0.2, 0.15, 0.1, 0.05, 0.05] + [0.02]*14 + [0.05, 0.1, 0.08, 0.05]
        )[0]
        
        # Higher amounts for fraud
        merchant_cat = random.choices(
            ['online', 'travel', 'electronics'], 
            weights=[50, 30, 20]
        )[0]
        
        amount = self._get_realistic_amount(merchant_cat, is_fraud=True)
        
        # More likely to be international
        is_foreign = random.choices([0, 1], weights=[0.3, 0.7])[0]
        country = random.choice(self.high_risk_countries) if is_foreign else random.choice(self.countries)
        is_high_risk = 1 if country in self.high_risk_countries else 0
        
        # Newer accounts are more vulnerable
        age_of_account = random.lognormvariate(3.5, 1.0)  # Younger accounts
        age_of_account = max(1, min(age_of_account, 500))
        
        return {
            'transaction_id': f'TXN_{index:06d}',
            'timestamp': (datetime.now() - timedelta(hours=random.randint(0, 168))).isoformat(),
            'amount': round(amount, 2),
            'hour_of_day': hour,
            'day_of_week': datetime.now().weekday(),
            'merchant_category': merchant_cat,
            'merchant_name': self._get_merchant_name(merchant_cat),
            'card_present': random.choices([1, 0], weights=[0.1, 0.9])[0],  # Mostly card-not-present
            'distance_from_home': np.random.exponential(50) if not is_foreign else np.random.exponential(200),
            'transactions_last_hour': max(0, int(np.random.poisson(8))),  # Higher frequency
            'age_of_account': int(age_of_account),
            'is_foreign': is_foreign,
            'is_high_risk_country': is_high_risk,
            'country': country,
            'is_fraud': 1,
            'fraud_probability': random.uniform(0.7, 0.95),
            'user_id': f'user_{random.randint(1, 1000):04d}',
            'device_id': f'device_{random.randint(1, 100):03d}',
            'ip_address': f'{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}.{random.randint(1,255)}'
        }
    
    def _sample_hour_by_pattern(self) -> int:
        """Sample hour based on realistic transaction patterns"""
        hours = list(self.hourly_patterns.keys())
        weights = list(self.hourly_patterns.values())
        return random.choices(hours, weights=weights)[0]
    
    def _get_realistic_amount(self, merchant_category: str, is_fraud: bool = False) -> float:
        """Get realistic amount based on merchant category"""
        base_amounts = {
            'retail': 45.0,
            'food': 25.0,
            'gas': 40.0,
            'online': 80.0,
            'travel': 350.0,
            'electronics': 250.0,
            'healthcare': 150.0,
            'entertainment': 60.0,
            'utilities': 120.0,
            'education': 500.0
        }
        
        base = base_amounts.get(merchant_category, 50.0)
        
        if is_fraud:
            base *= random.uniform(1.5, 5.0)  # Higher amounts for fraud
        
        # Use lognormal distribution for realistic amounts
        amount = random.lognormvariate(np.log(base), 0.5)
        return max(1.0, min(amount, 50000.0))  # Clamp between $1 and $50,000
    
    def _get_merchant_name(self, category: str) -> str:
        """Get realistic merchant name by category"""
        merchants = {
            'retail': ['Walmart', 'Target', 'Best Buy', 'Home Depot', 'Costco'],
            'food': ['McDonalds', 'Starbucks', 'Subway', 'Chipotle', 'Panera'],
            'gas': ['Shell', 'Chevron', 'BP', 'Exxon', 'Mobil'],
            'online': ['Amazon', 'eBay', 'Etsy', 'Shopify', 'AliExpress'],
            'travel': ['Expedia', 'Booking.com', 'Airbnb', 'Uber', 'Lyft'],
            'electronics': ['Apple Store', 'Best Buy', 'Newegg', 'Fry\'s', 'Micro Center'],
            'healthcare': ['CVS Pharmacy', 'Walgreens', 'Rite Aid', 'Kaiser', 'Mayo Clinic'],
            'entertainment': ['Netflix', 'Spotify', 'Disney+', 'Hulu', 'Amazon Prime'],
            'utilities': ['Con Edison', 'PG&E', 'Duke Energy', 'Florida Power', 'Comcast'],
            'education': ['Coursera', 'Udemy', 'Khan Academy', 'edX', 'Pluralsight']
        }
        
        return random.choice(merchants.get(category, ['Generic Store']))
    
    def generate_email_data(self, n_emails: int = 50, phishing_rate: float = 0.15) -> List[Dict[str, Any]]:
        """Generate realistic email data for phishing detection"""
        emails = []
        n_phishing = int(n_emails * phishing_rate)
        n_legit = n_emails - n_phishing
        
        # Generate legitimate emails
        for i in range(n_legit):
            email = self._generate_legitimate_email(i)
            emails.append(email)
        
        # Generate phishing emails
        for i in range(n_phishing):
            email = self._generate_phishing_email(n_legit + i)
            emails.append(email)
        
        random.shuffle(emails)
        return emails
    
    def _generate_legitimate_email(self, index: int) -> Dict[str, Any]:
        """Generate a legitimate email"""
        senders = ['noreply@amazon.com', 'support@paypal.com', 'team@netflix.com', 
                  'service@uber.com', 'help@github.com', 'updates@linkedin.com']
        
        subjects = [
            'Your order has been shipped',
            'Monthly statement is ready',
            'New features available',
            'Security update reminder',
            'Thank you for your purchase'
        ]
        
        return {
            'email_id': f'EMAIL_{index:06d}',
            'sender': random.choice(senders),
            'subject': random.choice(subjects),
            'body': self._generate_legitimate_body(),
            'timestamp': (datetime.now() - timedelta(hours=random.randint(0, 720))).isoformat(),
            'is_phishing': 0,
            'phishing_probability': random.uniform(0.01, 0.3),
            'user_id': f'user_{random.randint(1, 1000):04d}'
        }
    
    def _generate_phishing_email(self, index: int) -> Dict[str, Any]:
        """Generate a phishing email"""
        senders = ['security@paypal.com', 'support@amazon-secure.com', 'admin@microsft.com',
                  'verify@netflix-security.com', 'urgent@bank-america.com']
        
        subjects = [
            'URGENT: Account verification required',
            'Your account will be suspended',
            'Verify your identity immediately',
            'Security breach detected',
            'Click here to unlock your account'
        ]
        
        return {
            'email_id': f'EMAIL_{index:06d}',
            'sender': random.choice(senders),
            'subject': random.choice(subjects),
            'body': self._generate_phishing_body(),
            'timestamp': (datetime.now() - timedelta(hours=random.randint(0, 720))).isoformat(),
            'is_phishing': 1,
            'phishing_probability': random.uniform(0.7, 0.95),
            'user_id': f'user_{random.randint(1, 1000):04d}'
        }
    
    def _generate_legitimate_body(self) -> str:
        """Generate legitimate email body"""
        templates = [
            "Dear customer, your recent order #{} has been shipped and will arrive within 3-5 business days. Track your package online.",
            "Hi there, your monthly statement is now available for download. Please review your transactions and contact us with any questions.",
            "Thank you for your recent purchase! We've added some new features to enhance your experience. Log in to check them out.",
            "This is a friendly reminder to update your security settings. Keeping your account secure helps protect your information.",
            "We appreciate your business! Here's a special discount code for your next purchase: SAVE20"
        ]
        return random.choice(templates)
    
    def _generate_phishing_body(self) -> str:
        """Generate phishing email body"""
        templates = [
            "URGENT: Your account has been locked due to suspicious activity. Click here immediately to verify your identity: http://bit.ly/verify-now",
            "Dear user, we detected unauthorized access to your account. Please click the link below to secure your account immediately: http://secure-login.com",
            "Your account will be suspended in 24 hours unless you verify your identity. Click here: http://urgent-verification.com",
            "Security breach detected! Your personal information may be compromised. Click here to protect your account: http://emergency-security.com",
            "Congratulations! You've won a $1000 gift card. Click here to claim your prize now: http://claim-prize.com"
        ]
        return random.choice(templates)
    
    def save_to_json(self, data: List[Dict[str, Any]], filename: str) -> None:
        """Save data to JSON file"""
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"✅ Saved {len(data)} records to {filename}")

# Usage example
if __name__ == "__main__":
    generator = RealDataGenerator()
    
    # Generate transactions
    transactions = generator.generate_transactions(n_transactions=1000, fraud_rate=0.05)
    generator.save_to_json(transactions, 'data/transactions.json')
    
    # Generate emails
    emails = generator.generate_email_data(n_emails=500, phishing_rate=0.15)
    generator.save_to_json(emails, 'data/emails.json')
    
    print("🎯 Real data generation completed!")
