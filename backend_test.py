#!/usr/bin/env python3
"""
Backend API Testing for UMKM Pay - Store Logo & Receipt PDF Features
Tests the newly added/updated endpoints for store logo and receipt PDF generation
"""

import requests
import io
from PIL import Image

# Base URL for testing (internal)
BASE_URL = "http://localhost:8001/api"

# Test credentials from /app/memory/test_credentials.md
DEMO_UMKM_EMAIL = "demo.umkm@example.com"
DEMO_UMKM_PASSWORD = "Demo1234"

# Global variables to store test data
demo_token = None
demo_umkm_id = None
fresh_token = None
fresh_umkm_id = None
test_product_id = None
test_sale_id = None
test_customer_id = None
cashier_token = None

def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*80}")
    print(f"  {title}")
    print(f"{'='*80}\n")

def print_result(test_name, passed, details=""):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {test_name}")
    if details:
        print(f"   Details: {details}")

def create_test_image():
    """Create a small test PNG image"""
    img = Image.new('RGB', (100, 100), color='red')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf

# ============================================================================
# Test 1: Store Logo Field
# ============================================================================

def test_1_login_demo_umkm():
    """Test 1.1: Login as demo UMKM admin"""
    global demo_token, demo_umkm_id
    print_section("Test 1: Store Logo Field on UMKM Profile")
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": DEMO_UMKM_EMAIL,
            "password": DEMO_UMKM_PASSWORD
        })
        
        if response.status_code == 200:
            data = response.json()
            demo_token = data.get("access_token")
            demo_umkm_id = data.get("user", {}).get("umkm_id")
            print_result("Login as demo UMKM admin", True, f"Token obtained, UMKM ID: {demo_umkm_id}")
            return True
        else:
            print_result("Login as demo UMKM admin", False, f"Status: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        print_result("Login as demo UMKM admin", False, f"Exception: {str(e)}")
        return False

def test_1_upload_logo():
    """Test 1.2: Upload a small PNG file"""
    global demo_token
    
    try:
        img_buf = create_test_image()
        files = {'file': ('test_logo.png', img_buf, 'image/png')}
        headers = {'Authorization': f'Bearer {demo_token}'}
        
        response = requests.post(f"{BASE_URL}/upload", files=files, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            logo_path = data.get("path")
            print_result("Upload store logo PNG", True, f"Path: {logo_path}")
            return logo_path
        else:
            print_result("Upload store logo PNG", False, f"Status: {response.status_code}, Body: {response.text}")
            return None
    except Exception as e:
        print_result("Upload store logo PNG", False, f"Exception: {str(e)}")
        return None

def test_1_update_umkm_profile(logo_path):
    """Test 1.3: Update UMKM profile with logo, address, phone"""
    global demo_token
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        payload = {
            "logo_image_path": logo_path,
            "address": "Jl. Test Raya No. 123",
            "phone": "08120001111"
        }
        
        response = requests.put(f"{BASE_URL}/umkm", json=payload, headers=headers)
        
        if response.status_code == 200:
            print_result("Update UMKM profile with logo/address/phone", True, "Profile updated successfully")
            return True
        else:
            print_result("Update UMKM profile with logo/address/phone", False, f"Status: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        print_result("Update UMKM profile with logo/address/phone", False, f"Exception: {str(e)}")
        return False

def test_1_verify_umkm_profile(expected_logo_path):
    """Test 1.4: Verify GET /api/umkm returns persisted data"""
    global demo_token
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        response = requests.get(f"{BASE_URL}/umkm", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            logo_path = data.get("logo_image_path")
            address = data.get("address")
            phone = data.get("phone")
            
            all_match = (
                logo_path == expected_logo_path and
                address == "Jl. Test Raya No. 123" and
                phone == "08120001111"
            )
            
            if all_match:
                print_result("Verify UMKM profile persistence", True, f"Logo: {logo_path}, Address: {address}, Phone: {phone}")
            else:
                print_result("Verify UMKM profile persistence", False, 
                           f"Mismatch - Logo: {logo_path} (expected: {expected_logo_path}), Address: {address}, Phone: {phone}")
            return all_match
        else:
            print_result("Verify UMKM profile persistence", False, f"Status: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        print_result("Verify UMKM profile persistence", False, f"Exception: {str(e)}")
        return False

# ============================================================================
# Test 2: Receipt PDF Endpoint
# ============================================================================

def test_2_create_product():
    """Test 2.1: Create a product for sale"""
    global demo_token, test_product_id
    print_section("Test 2: Receipt PDF Endpoint")
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        payload = {
            "name": "Test Product Kopi",
            "price": 25000,
            "cost": 15000,
            "stock": 100
        }
        
        response = requests.post(f"{BASE_URL}/products", json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            test_product_id = data.get("id")
            print_result("Create test product", True, f"Product ID: {test_product_id}")
            return True
        else:
            print_result("Create test product", False, f"Status: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        print_result("Create test product", False, f"Exception: {str(e)}")
        return False

def test_2_create_sale():
    """Test 2.2: Create a sale transaction"""
    global demo_token, test_product_id, test_sale_id
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        payload = {
            "items": [
                {
                    "product_id": test_product_id,
                    "name": "Test Product Kopi",
                    "price": 25000,
                    "cost": 15000,
                    "qty": 2
                }
            ],
            "payment_method": "cash",
            "amount_paid": 60000
        }
        
        response = requests.post(f"{BASE_URL}/transactions/sale", json=payload, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            test_sale_id = data.get("id")
            print_result("Create sale transaction", True, f"Sale ID: {test_sale_id}")
            return True
        else:
            print_result("Create sale transaction", False, f"Status: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        print_result("Create sale transaction", False, f"Exception: {str(e)}")
        return False

def test_2_receipt_pdf_with_logo():
    """Test 2.3: GET receipt PDF with store logo"""
    global demo_token, test_sale_id
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        response = requests.get(f"{BASE_URL}/transactions/{test_sale_id}/receipt", headers=headers)
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            pdf_content = response.content
            
            # Verify it's a PDF
            is_pdf = pdf_content.startswith(b'%PDF')
            is_correct_type = 'application/pdf' in content_type
            is_non_trivial = len(pdf_content) > 5000  # > 5KB
            
            if is_pdf and is_correct_type and is_non_trivial:
                print_result("Receipt PDF with store logo", True, 
                           f"Content-Type: {content_type}, Size: {len(pdf_content)} bytes, Valid PDF: {is_pdf}")
                return True
            else:
                print_result("Receipt PDF with store logo", False, 
                           f"Content-Type: {content_type}, Size: {len(pdf_content)} bytes, Valid PDF: {is_pdf}, Non-trivial: {is_non_trivial}")
                return False
        else:
            print_result("Receipt PDF with store logo", False, f"Status: {response.status_code}, Body: {response.text[:200]}")
            return False
    except Exception as e:
        print_result("Receipt PDF with store logo", False, f"Exception: {str(e)}")
        return False

def test_2_receipt_404_unknown_txn():
    """Test 2.4: Receipt for unknown transaction ID returns 404"""
    global demo_token
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        response = requests.get(f"{BASE_URL}/transactions/does-not-exist-12345/receipt", headers=headers)
        
        if response.status_code == 404:
            print_result("Receipt 404 for unknown transaction", True, f"Status: {response.status_code}")
            return True
        else:
            print_result("Receipt 404 for unknown transaction", False, 
                       f"Expected 404, got {response.status_code}, Body: {response.text[:200]}")
            return False
    except Exception as e:
        print_result("Receipt 404 for unknown transaction", False, f"Exception: {str(e)}")
        return False

def test_2_register_fresh_umkm():
    """Test 2.5: Register a fresh UMKM (no store logo)"""
    global fresh_token, fresh_umkm_id
    
    try:
        import random
        random_num = random.randint(10000, 99999)
        payload = {
            "name": "Fresh Owner",
            "business_name": f"Fresh UMKM {random_num}",
            "email": f"fresh.umkm.{random_num}@test.com",
            "password": "FreshPass123",
            "phone": "08129999999"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            fresh_token = data.get("access_token")
            fresh_umkm_id = data.get("user", {}).get("umkm_id")
            print_result("Register fresh UMKM (no logo)", True, f"UMKM ID: {fresh_umkm_id}")
            return True
        else:
            print_result("Register fresh UMKM (no logo)", False, f"Status: {response.status_code}, Body: {response.text}")
            return False
    except Exception as e:
        print_result("Register fresh UMKM (no logo)", False, f"Exception: {str(e)}")
        return False

def test_2_receipt_without_logo():
    """Test 2.6: Receipt PDF works without store logo"""
    global fresh_token
    
    try:
        # Create product for fresh UMKM
        headers = {'Authorization': f'Bearer {fresh_token}'}
        product_payload = {
            "name": "Fresh Product Teh",
            "price": 15000,
            "cost": 10000,
            "stock": 50
        }
        prod_resp = requests.post(f"{BASE_URL}/products", json=product_payload, headers=headers)
        if prod_resp.status_code != 200:
            print_result("Receipt PDF without store logo", False, f"Failed to create product: {prod_resp.status_code}")
            return False
        
        fresh_product_id = prod_resp.json().get("id")
        
        # Create sale
        sale_payload = {
            "items": [
                {
                    "product_id": fresh_product_id,
                    "name": "Fresh Product Teh",
                    "price": 15000,
                    "cost": 10000,
                    "qty": 3
                }
            ],
            "payment_method": "cash",
            "amount_paid": 50000
        }
        sale_resp = requests.post(f"{BASE_URL}/transactions/sale", json=sale_payload, headers=headers)
        if sale_resp.status_code != 200:
            print_result("Receipt PDF without store logo", False, f"Failed to create sale: {sale_resp.status_code}")
            return False
        
        fresh_sale_id = sale_resp.json().get("id")
        
        # Get receipt
        receipt_resp = requests.get(f"{BASE_URL}/transactions/{fresh_sale_id}/receipt", headers=headers)
        
        if receipt_resp.status_code == 200:
            content_type = receipt_resp.headers.get('Content-Type', '')
            pdf_content = receipt_resp.content
            is_pdf = pdf_content.startswith(b'%PDF')
            is_correct_type = 'application/pdf' in content_type
            is_non_trivial = len(pdf_content) > 5000
            
            if is_pdf and is_correct_type and is_non_trivial:
                print_result("Receipt PDF without store logo", True, 
                           f"Content-Type: {content_type}, Size: {len(pdf_content)} bytes")
                return True
            else:
                print_result("Receipt PDF without store logo", False, 
                           f"Content-Type: {content_type}, Size: {len(pdf_content)} bytes, Valid PDF: {is_pdf}")
                return False
        else:
            print_result("Receipt PDF without store logo", False, f"Status: {receipt_resp.status_code}")
            return False
    except Exception as e:
        print_result("Receipt PDF without store logo", False, f"Exception: {str(e)}")
        return False

def test_2_kasbon_receipt():
    """Test 2.7: Receipt PDF for kasbon (credit) sale"""
    global demo_token, test_product_id, test_customer_id
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        
        # Create a customer first
        customer_payload = {
            "name": "Pelanggan Kasbon",
            "phone": "08123456789",
            "note": "Test customer for kasbon"
        }
        cust_resp = requests.post(f"{BASE_URL}/customers", json=customer_payload, headers=headers)
        if cust_resp.status_code != 200:
            print_result("Receipt PDF for kasbon sale", False, f"Failed to create customer: {cust_resp.status_code}")
            return False
        
        test_customer_id = cust_resp.json().get("id")
        
        # Create kasbon sale
        sale_payload = {
            "items": [
                {
                    "product_id": test_product_id,
                    "name": "Test Product Kopi",
                    "price": 25000,
                    "cost": 15000,
                    "qty": 5
                }
            ],
            "payment_method": "cash",
            "is_credit": True,
            "customer_id": test_customer_id,
            "amount_paid": 0
        }
        sale_resp = requests.post(f"{BASE_URL}/transactions/sale", json=sale_payload, headers=headers)
        if sale_resp.status_code != 200:
            print_result("Receipt PDF for kasbon sale", False, f"Failed to create kasbon sale: {sale_resp.status_code}")
            return False
        
        kasbon_sale_id = sale_resp.json().get("id")
        
        # Get receipt
        receipt_resp = requests.get(f"{BASE_URL}/transactions/{kasbon_sale_id}/receipt", headers=headers)
        
        if receipt_resp.status_code == 200:
            content_type = receipt_resp.headers.get('Content-Type', '')
            pdf_content = receipt_resp.content
            is_pdf = pdf_content.startswith(b'%PDF')
            is_correct_type = 'application/pdf' in content_type
            is_non_trivial = len(pdf_content) > 5000
            
            if is_pdf and is_correct_type and is_non_trivial:
                print_result("Receipt PDF for kasbon sale", True, 
                           f"Content-Type: {content_type}, Size: {len(pdf_content)} bytes")
                return True
            else:
                print_result("Receipt PDF for kasbon sale", False, 
                           f"Content-Type: {content_type}, Size: {len(pdf_content)} bytes, Valid PDF: {is_pdf}")
                return False
        else:
            print_result("Receipt PDF for kasbon sale", False, f"Status: {receipt_resp.status_code}")
            return False
    except Exception as e:
        print_result("Receipt PDF for kasbon sale", False, f"Exception: {str(e)}")
        return False

def test_2_cross_tenant_isolation():
    """Test 2.8: Cross-tenant isolation - UMKM B cannot access UMKM A's receipt"""
    global demo_token, fresh_token, test_sale_id
    
    try:
        # Fresh UMKM (B) tries to access demo UMKM's (A) transaction
        headers = {'Authorization': f'Bearer {fresh_token}'}
        response = requests.get(f"{BASE_URL}/transactions/{test_sale_id}/receipt", headers=headers)
        
        if response.status_code == 404:
            print_result("Cross-tenant isolation (404 for other UMKM's txn)", True, f"Status: {response.status_code}")
            return True
        else:
            print_result("Cross-tenant isolation (404 for other UMKM's txn)", False, 
                       f"Expected 404, got {response.status_code}, Body: {response.text[:200]}")
            return False
    except Exception as e:
        print_result("Cross-tenant isolation (404 for other UMKM's txn)", False, f"Exception: {str(e)}")
        return False

def test_2_cashier_role_access():
    """Test 2.9: Cashier role can access receipts"""
    global demo_token, test_sale_id, cashier_token
    
    try:
        # Create a cashier account
        headers = {'Authorization': f'Bearer {demo_token}'}
        import random
        random_num = random.randint(10000, 99999)
        cashier_payload = {
            "name": "Test Cashier",
            "email": f"cashier.{random_num}@test.com",
            "password": "CashierPass123"
        }
        
        cashier_resp = requests.post(f"{BASE_URL}/cashiers", json=cashier_payload, headers=headers)
        if cashier_resp.status_code != 200:
            print_result("Cashier role receipt access", False, f"Failed to create cashier: {cashier_resp.status_code}, Body: {cashier_resp.text}")
            return False
        
        # Login as cashier
        login_resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": cashier_payload["email"],
            "password": cashier_payload["password"]
        })
        if login_resp.status_code != 200:
            print_result("Cashier role receipt access", False, f"Failed to login as cashier: {login_resp.status_code}")
            return False
        
        cashier_token = login_resp.json().get("access_token")
        
        # Try to access receipt as cashier
        cashier_headers = {'Authorization': f'Bearer {cashier_token}'}
        receipt_resp = requests.get(f"{BASE_URL}/transactions/{test_sale_id}/receipt", headers=cashier_headers)
        
        if receipt_resp.status_code == 200:
            content_type = receipt_resp.headers.get('Content-Type', '')
            is_pdf = receipt_resp.content.startswith(b'%PDF')
            
            if is_pdf and 'application/pdf' in content_type:
                print_result("Cashier role receipt access", True, f"Cashier can access receipt, Status: {receipt_resp.status_code}")
                return True
            else:
                print_result("Cashier role receipt access", False, f"Invalid PDF response")
                return False
        else:
            print_result("Cashier role receipt access", False, f"Status: {receipt_resp.status_code}, Body: {receipt_resp.text[:200]}")
            return False
    except Exception as e:
        print_result("Cashier role receipt access", False, f"Exception: {str(e)}")
        return False

# ============================================================================
# Test 3: Reports Export with Logos
# ============================================================================

def test_3_reports_export_pdf():
    """Test 3.1: Reports export as PDF with logos"""
    global demo_token
    print_section("Test 3: Reports Export with Logos")
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        response = requests.get(f"{BASE_URL}/reports/export?format=pdf", headers=headers)
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            pdf_content = response.content
            is_pdf = pdf_content.startswith(b'%PDF')
            is_correct_type = 'application/pdf' in content_type
            is_non_trivial = len(pdf_content) > 5000
            
            if is_pdf and is_correct_type and is_non_trivial:
                print_result("Reports export as PDF", True, 
                           f"Content-Type: {content_type}, Size: {len(pdf_content)} bytes")
                return True
            else:
                print_result("Reports export as PDF", False, 
                           f"Content-Type: {content_type}, Size: {len(pdf_content)} bytes, Valid PDF: {is_pdf}")
                return False
        else:
            print_result("Reports export as PDF", False, f"Status: {response.status_code}, Body: {response.text[:200]}")
            return False
    except Exception as e:
        print_result("Reports export as PDF", False, f"Exception: {str(e)}")
        return False

def test_3_reports_export_excel():
    """Test 3.2: Reports export as Excel with logos"""
    global demo_token
    
    try:
        headers = {'Authorization': f'Bearer {demo_token}'}
        response = requests.get(f"{BASE_URL}/reports/export?format=excel", headers=headers)
        
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            excel_content = response.content
            # Excel files start with PK (ZIP signature)
            is_excel = excel_content.startswith(b'PK')
            is_correct_type = 'spreadsheet' in content_type or 'excel' in content_type
            is_non_trivial = len(excel_content) > 5000
            
            if is_excel and is_correct_type and is_non_trivial:
                print_result("Reports export as Excel", True, 
                           f"Content-Type: {content_type}, Size: {len(excel_content)} bytes")
                return True
            else:
                print_result("Reports export as Excel", False, 
                           f"Content-Type: {content_type}, Size: {len(excel_content)} bytes, Valid Excel: {is_excel}, Correct type: {is_correct_type}")
                return False
        else:
            print_result("Reports export as Excel", False, f"Status: {response.status_code}, Body: {response.text[:200]}")
            return False
    except Exception as e:
        print_result("Reports export as Excel", False, f"Exception: {str(e)}")
        return False

# ============================================================================
# Main Test Runner
# ============================================================================

def run_all_tests():
    """Run all backend tests"""
    print("\n" + "="*80)
    print("  UMKM PAY BACKEND API TESTING - Store Logo & Receipt PDF")
    print("="*80)
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    # Test 1: Store Logo Field
    tests_1 = [
        ("Login demo UMKM", test_1_login_demo_umkm),
    ]
    
    for name, test_func in tests_1:
        results["total"] += 1
        if test_func():
            results["passed"] += 1
        else:
            results["failed"] += 1
    
    # Continue with upload and profile update if login succeeded
    if demo_token:
        logo_path = test_1_upload_logo()
        results["total"] += 1
        if logo_path:
            results["passed"] += 1
            
            results["total"] += 1
            if test_1_update_umkm_profile(logo_path):
                results["passed"] += 1
            else:
                results["failed"] += 1
            
            results["total"] += 1
            if test_1_verify_umkm_profile(logo_path):
                results["passed"] += 1
            else:
                results["failed"] += 1
        else:
            results["failed"] += 1
    
    # Test 2: Receipt PDF Endpoint
    if demo_token:
        tests_2 = [
            ("Create product", test_2_create_product),
            ("Create sale", test_2_create_sale),
        ]
        
        for name, test_func in tests_2:
            results["total"] += 1
            if test_func():
                results["passed"] += 1
            else:
                results["failed"] += 1
        
        if test_sale_id:
            tests_2_receipt = [
                ("Receipt PDF with logo", test_2_receipt_pdf_with_logo),
                ("Receipt 404 unknown txn", test_2_receipt_404_unknown_txn),
                ("Register fresh UMKM", test_2_register_fresh_umkm),
            ]
            
            for name, test_func in tests_2_receipt:
                results["total"] += 1
                if test_func():
                    results["passed"] += 1
                else:
                    results["failed"] += 1
            
            if fresh_token:
                tests_2_advanced = [
                    ("Receipt without logo", test_2_receipt_without_logo),
                    ("Kasbon receipt", test_2_kasbon_receipt),
                    ("Cross-tenant isolation", test_2_cross_tenant_isolation),
                    ("Cashier role access", test_2_cashier_role_access),
                ]
                
                for name, test_func in tests_2_advanced:
                    results["total"] += 1
                    if test_func():
                        results["passed"] += 1
                    else:
                        results["failed"] += 1
    
    # Test 3: Reports Export
    if demo_token:
        tests_3 = [
            ("Reports export PDF", test_3_reports_export_pdf),
            ("Reports export Excel", test_3_reports_export_excel),
        ]
        
        for name, test_func in tests_3:
            results["total"] += 1
            if test_func():
                results["passed"] += 1
            else:
                results["failed"] += 1
    
    # Print summary
    print_section("TEST SUMMARY")
    print(f"Total Tests: {results['total']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed']/results['total']*100):.1f}%\n")
    
    return results

if __name__ == "__main__":
    run_all_tests()
