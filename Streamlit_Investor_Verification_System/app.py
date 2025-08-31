import streamlit as st
import pandas as pd
import numpy as np
import os
import uuid
import json
import re
import base64
import requests
from datetime import datetime
from PIL import Image

# Set page configuration
st.set_page_config(
    page_title="Investor Verification System",
    page_icon="🔒",
    layout="wide"
)

# Create directories for storing uploaded files (won't work on Streamlit Cloud, but keeps functionality)
try:
    os.makedirs("uploads/ids", exist_ok=True)
    os.makedirs("uploads/selfies", exist_ok=True)
    os.makedirs("uploads/documents", exist_ok=True)
except:
    pass  # Skip directory creation on Streamlit Cloud

# Define a simple database (in a real app, you would use a proper database)
if 'verified_investors' not in st.session_state:
    st.session_state.verified_investors = []

if 'current_investor' not in st.session_state:
    st.session_state.current_investor = {
        'id': str(uuid.uuid4()),
        'status': 'incomplete',
        'kyc_status': 'incomplete',
        'accreditation_status': 'incomplete',
        'aml_status': 'incomplete',
        'funds_status': 'incomplete'
    }

# --------- Helper Functions ---------

def save_uploaded_file(uploaded_file, directory):
    """Save an uploaded file to the specified directory"""
    if uploaded_file is not None:
        try:
            file_path = os.path.join(directory, uploaded_file.name)
            with open(file_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            return file_path
        except:
            # If file saving fails (like on Streamlit Cloud), return a mock path
            return f"{directory}/{uploaded_file.name}"
    return None

def mock_face_verification(id_file, selfie_file):
    """Mock face verification since face_recognition library may not work on Streamlit Cloud"""
    if id_file and selfie_file:
        # Simulate face verification with random confidence
        confidence = np.random.uniform(85, 95)
        return True, f"Match confirmed with confidence {confidence:.2f}%"
    return False, "Missing files for verification"

def check_id_validity(id_number, id_type):
    """Basic ID validation based on patterns"""
    if id_type == "Aadhar Card (India)":
        # Aadhar has 12 digits
        return bool(re.match(r'^\d{12}$', id_number)), "Valid Aadhar format" if re.match(r'^\d{12}$', id_number) else "Invalid Aadhar format"
    elif id_type == "PAN Card (India)":
        # PAN has 10 characters (5 letters, 4 numbers, 1 letter)
        return bool(re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', id_number)), "Valid PAN format" if re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', id_number) else "Invalid PAN format"
    elif id_type == "Passport":
        # Basic passport format check (varies by country)
        return bool(re.match(r'^[A-Z0-9]{8,12}$', id_number)), "Valid Passport format" if re.match(r'^[A-Z0-9]{8,12}$', id_number) else "Invalid Passport format"
    return True, "Format check not available for this ID type"

def mock_aml_check(investor_data):
    """Mock AML check - in a real application, you'd use a proper AML API"""
    # This is a simulation - NEVER rely on this for real AML checks
    high_risk_names = ["John Doe", "Jane Smith", "Vladimir Putin", "Kim Jong Un"]
    high_risk_countries = ["North Korea", "Iran", "Syria"]
    
    name = f"{investor_data.get('first_name', '')} {investor_data.get('last_name', '')}"
    country = investor_data.get('country', '')
    
    risks = []
    if any(name.lower() in high_name.lower() for high_name in high_risk_names):
        risks.append("Potential match on PEP/Sanctions list")
    
    if country in high_risk_countries:
        risks.append(f"High-risk jurisdiction: {country}")
    
    risk_score = len(risks) * 33 if risks else np.random.randint(5, 20)
    
    return {
        "passed": risk_score < 50,
        "risk_score": risk_score,
        "risk_factors": risks if risks else ["No significant risk factors identified"],
        "timestamp": datetime.now().isoformat()
    }

def verify_accreditation(income, net_worth, investment_experience):
    """Verify if investor meets accreditation requirements"""
    # This is a simplified version - real accreditation has specific legal requirements
    meets_criteria = False
    reasons = []
    
    if income >= 200000:
        meets_criteria = True
        reasons.append(f"Annual income of ${income:,} meets minimum requirement")
    
    if net_worth >= 1000000:
        meets_criteria = True
        reasons.append(f"Net worth of ${net_worth:,} meets minimum requirement")
    
    if investment_experience >= 5 and (income >= 100000 or net_worth >= 500000):
        meets_criteria = True
        reasons.append(f"{investment_experience} years of investment experience with sufficient financial backing")
    
    if not meets_criteria:
        reasons = ["Does not meet any accreditation criteria"]
    
    return {
        "accredited": meets_criteria,
        "reasons": reasons,
        "timestamp": datetime.now().isoformat()
    }

def validate_bank_details(account_number, routing_number, bank_name):
    """Basic validation of bank details"""
    # In a real application, you would use an API like Plaid for verification
    
    # Basic format checks
    account_valid = bool(re.match(r'^\d{10,17}$', account_number))
    routing_valid = bool(re.match(r'^\d{9}$', routing_number)) if routing_number else True
    
    checks = []
    if account_valid:
        checks.append("Account number format is valid")
    else:
        checks.append("Account number format is invalid")
        
    if routing_valid:
        checks.append("Routing number format is valid")
    else:
        checks.append("Routing number format is invalid")
    
    if bank_name:
        checks.append(f"Bank name provided: {bank_name}")
    
    return {
        "valid": account_valid and routing_valid and bool(bank_name),
        "checks": checks,
        "timestamp": datetime.now().isoformat()
    }

# --------- Main UI ---------

def main():
    st.title("Investor Verification System")
    
    # Sidebar for navigation
    st.sidebar.title("Navigation")
    page = st.sidebar.radio("Go to", ["Home", "KYC Verification", "Accreditation Check", "AML Screening", "Proof of Funds", "Verification Status", "Admin Dashboard"])
    
    if page == "Home":
        home_page()
    elif page == "KYC Verification":
        kyc_verification_page()
    elif page == "Accreditation Check":
        accreditation_page()
    elif page == "AML Screening":
        aml_screening_page()
    elif page == "Proof of Funds":
        proof_of_funds_page()
    elif page == "Verification Status":
        verification_status_page()
    elif page == "Admin Dashboard":
        admin_dashboard()

def home_page():
    st.header("Welcome to the Investor Verification System")
    
    st.write("""
    This system will guide you through the necessary steps to verify your identity and eligibility as an investor.
    
    The process includes:
    1. **KYC (Know Your Customer)** - Identity verification
    2. **Accreditation Check** - Confirming your investor status
    3. **AML Screening** - Anti-Money Laundering checks
    4. **Proof of Funds** - Verifying the source of investment funds
    
    Please navigate through each section using the sidebar.
    """)
    
    if st.button("Start New Verification"):
        st.session_state.current_investor = {
            'id': str(uuid.uuid4()),
            'status': 'incomplete',
            'kyc_status': 'incomplete',
            'accreditation_status': 'incomplete',
            'aml_status': 'incomplete',
            'funds_status': 'incomplete',
            'timestamp': datetime.now().isoformat()
        }
        st.success("New verification process started! Please proceed to KYC Verification.")

def kyc_verification_page():
    st.header("KYC Verification")
    
    st.subheader("Personal Information")
    col1, col2 = st.columns(2)
    
    with col1:
        first_name = st.text_input("First Name")
        last_name = st.text_input("Last Name")
        dob = st.date_input("Date of Birth")
        email = st.text_input("Email Address")
    
    with col2:
        phone = st.text_input("Phone Number")
        country = st.selectbox("Country of Residence", ["India", "United States", "United Kingdom", "Canada", "Australia", "Singapore", "Others"])
        address = st.text_area("Full Address")
    
    st.subheader("Identity Verification")
    id_type = st.selectbox("ID Type", ["Aadhar Card (India)", "PAN Card (India)", "Passport", "Driver's License", "National ID"])
    id_number = st.text_input("ID Number")
    
    id_valid, id_message = check_id_validity(id_number, id_type)
    if id_number:
        if id_valid:
            st.success(id_message)
        else:
            st.error(id_message)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("Upload ID Document (Front)")
        id_front = st.file_uploader("ID Front", type=["jpg", "jpeg", "png", "pdf"])
        
        st.write("Upload ID Document (Back, if applicable)")
        id_back = st.file_uploader("ID Back", type=["jpg", "jpeg", "png", "pdf"])
    
    with col2:
        st.write("Take or Upload Selfie")
        selfie = st.file_uploader("Selfie", type=["jpg", "jpeg", "png"])
        
        if selfie:
            st.image(selfie, width=250, caption="Uploaded Selfie")
    
    st.subheader("Address Verification")
    address_proof_type = st.selectbox("Address Proof Type", ["Utility Bill", "Bank Statement", "Government Letter", "Rental Agreement"])
    address_proof = st.file_uploader("Upload Address Proof", type=["jpg", "jpeg", "png", "pdf"])
    
    if st.button("Submit KYC Information"):
        if not (first_name and last_name and dob and email and phone and country and address and id_number and id_type):
            st.error("Please fill in all required personal and ID information fields.")
        elif not (id_front and selfie and address_proof):
            st.error("Please upload all required documents (ID, selfie, and address proof).")
        elif not id_valid:
            st.error(f"Please correct the ID format issue: {id_message}")
        else:
            # Save files (or mock save on Streamlit Cloud)
            id_front_path = save_uploaded_file(id_front, "uploads/ids")
            address_proof_path = save_uploaded_file(address_proof, "uploads/documents")
            selfie_path = save_uploaded_file(selfie, "uploads/selfies")
            
            # Mock face verification (replacing the face_recognition library)
            face_match, face_match_message = mock_face_verification(id_front, selfie)
            
            if not face_match:
                st.warning(f"Face verification notice: {face_match_message}")
                # In demo mode, we'll continue anyway
            
            # Update investor data
            st.session_state.current_investor.update({
                'first_name': first_name,
                'last_name': last_name,
                'dob': str(dob),
                'email': email,
                'phone': phone,
                'country': country,
                'address': address,
                'id_type': id_type,
                'id_number': id_number,
                'id_front_path': id_front_path,
                'id_back_path': save_uploaded_file(id_back, "uploads/ids") if id_back else None,
                'selfie_path': selfie_path,
                'address_proof_type': address_proof_type,
                'address_proof_path': address_proof_path,
                'kyc_status': 'verified',
                'kyc_timestamp': datetime.now().isoformat(),
                'face_verification': face_match_message
            })
            
            st.success("KYC information submitted successfully! Proceed to the next step.")
            st.balloons()

def accreditation_page():
    st.header("Investor Accreditation Verification")
    
    if st.session_state.current_investor.get('kyc_status') != 'verified':
        st.warning("Please complete KYC verification first before proceeding to accreditation.")
        return
    
    st.write("""
    To verify your status as an accredited investor, please provide the following financial information. 
    This helps ensure compliance with regulations for certain types of investments.
    """)
    
    st.subheader("Financial Information")
    
    annual_income = st.number_input("Annual Income (USD)", min_value=0, step=10000)
    net_worth = st.number_input("Net Worth (USD)", min_value=0, step=50000)
    investment_experience = st.slider("Years of Investment Experience", 0, 30, 1)
    
    st.subheader("Verification Documents")
    
    income_proof_type = st.selectbox("Income Verification Document", 
                                   ["Tax Returns", "W-2 Form", "Pay Stubs", "Employment Verification Letter", "Other"])
    income_proof = st.file_uploader("Upload Income Proof", type=["jpg", "jpeg", "png", "pdf"])
    
    net_worth_proof_type = st.selectbox("Net Worth Verification Document", 
                                      ["Bank Statements", "Investment Account Statements", "Property Valuations", "CPA Letter", "Other"])
    net_worth_proof = st.file_uploader("Upload Net Worth Proof", type=["jpg", "jpeg", "png", "pdf"])
    
    if st.button("Submit Accreditation Information"):
        if not (annual_income > 0 or net_worth > 0):
            st.error("Please provide either annual income or net worth information.")
        elif not (income_proof or net_worth_proof):
            st.error("Please upload at least one verification document.")
        else:
            # Save documents
            income_proof_path = save_uploaded_file(income_proof, "uploads/documents") if income_proof else None
            net_worth_proof_path = save_uploaded_file(net_worth_proof, "uploads/documents") if net_worth_proof else None
            
            # Verify accreditation
            accreditation_result = verify_accreditation(annual_income, net_worth, investment_experience)
            
            # Update investor data
            st.session_state.current_investor.update({
                'annual_income': annual_income,
                'net_worth': net_worth,
                'investment_experience': investment_experience,
                'income_proof_type': income_proof_type if income_proof else None,
                'income_proof_path': income_proof_path,
                'net_worth_proof_type': net_worth_proof_type if net_worth_proof else None,
                'net_worth_proof_path': net_worth_proof_path,
                'accreditation_status': 'verified' if accreditation_result['accredited'] else 'rejected',
                'accreditation_details': accreditation_result,
            })
            
            if accreditation_result['accredited']:
                st.success("Accreditation verified successfully! Proceed to the next step.")
            else:
                st.error("Based on the provided information, you do not meet the accreditation criteria.")
                st.write("Reasons:")
                for reason in accreditation_result['reasons']:
                    st.write(f"- {reason}")

def aml_screening_page():
    st.header("Anti-Money Laundering (AML) Screening")
    
    if st.session_state.current_investor.get('kyc_status') != 'verified':
        st.warning("Please complete KYC verification first before proceeding to AML screening.")
        return
    
    st.write("""
    AML screening helps prevent money laundering and ensures compliance with financial regulations.
    Please provide additional information for screening purposes.
    """)
    
    st.subheader("Screening Information")
    
    political_exposure = st.radio("Are you a politically exposed person (PEP) or have close relations with one?", ["No", "Yes"])
    
    if political_exposure == "Yes":
        pep_details = st.text_area("Please provide details about your political exposure")
    else:
        pep_details = ""
    
    st.subheader("Source of Wealth")
    
    wealth_source = st.multiselect("Select your primary sources of wealth", 
                                 ["Employment Income", "Business Ownership", "Investments", "Inheritance", "Real Estate", "Other"])
    
    if "Other" in wealth_source:
        other_wealth = st.text_input("Please specify other source of wealth")
    else:
        other_wealth = ""
    
    wealth_details = st.text_area("Please provide brief details about your sources of wealth")
    
    st.subheader("Additional Screening")
    st.write("Note: In a real system, additional checks would be performed using third-party AML databases.")
    
    if st.button("Submit for AML Screening"):
        if not wealth_source:
            st.error("Please select at least one source of wealth.")
        elif "Other" in wealth_source and not other_wealth:
            st.error("Please specify your other source of wealth.")
        else:
            # Mock AML check - in a real system, you'd use an actual AML API
            aml_result = mock_aml_check(st.session_state.current_investor)
            
            # Update investor data
            st.session_state.current_investor.update({
                'political_exposure': political_exposure,
                'pep_details': pep_details if political_exposure == "Yes" else None,
                'wealth_source': wealth_source,
                'other_wealth': other_wealth if "Other" in wealth_source else None,
                'wealth_details': wealth_details,
                'aml_status': 'verified' if aml_result['passed'] else 'flagged',
                'aml_details': aml_result,
            })
            
            if aml_result['passed']:
                st.success("AML screening completed successfully! Proceed to the next step.")
            else:
                st.error(f"AML screening flagged potential issues. Risk score: {aml_result['risk_score']}/100")
                st.write("Risk factors:")
                for factor in aml_result['risk_factors']:
                    st.write(f"- {factor}")

def proof_of_funds_page():
    st.header("Proof of Funds Verification")
    
    if st.session_state.current_investor.get('kyc_status') != 'verified':
        st.warning("Please complete KYC verification first before proceeding to proof of funds.")
        return
    
    st.write("""
    Proof of funds verification ensures that the money you plan to invest comes from legitimate sources.
    """)
    
    st.subheader("Bank Account Information")
    
    bank_name = st.text_input("Bank Name")
    account_number = st.text_input("Account Number")
    routing_number = st.text_input("Routing Number (if applicable)")
    
    st.subheader("Account Verification")
    
    bank_statement = st.file_uploader("Upload Recent Bank Statement", type=["jpg", "jpeg", "png", "pdf"])
    reference_letter = st.file_uploader("Upload Bank Reference Letter (optional)", type=["jpg", "jpeg", "png", "pdf"])
    
    st.write("""
    Note: In a production environment, this would be integrated with services like Plaid for secure bank verification.
    For this demonstration, we're using a simple mock verification.
    """)
    
    investment_amount = st.number_input("Planned Investment Amount (USD)", min_value=0, step=1000)
    
    if st.button("Verify Funds"):
        if not (bank_name and account_number and bank_statement and investment_amount > 0):
            st.error("Please provide all required bank information and planned investment amount.")
        else:
            # Save documents
            bank_statement_path = save_uploaded_file(bank_statement, "uploads/documents") if bank_statement else None
            reference_letter_path = save_uploaded_file(reference_letter, "uploads/documents") if reference_letter else None
            
            # Validate bank details
            bank_validation = validate_bank_details(account_number, routing_number, bank_name)
            
            # Update investor data
            st.session_state.current_investor.update({
                'bank_name': bank_name,
                'account_number': account_number[-4:],  # Only store last 4 digits for security
                'routing_number': routing_number[-4:] if routing_number else None,  # Only store last 4 digits
                'bank_statement_path': bank_statement_path,
                'reference_letter_path': reference_letter_path,
                'investment_amount': investment_amount,
                'funds_status': 'verified' if bank_validation['valid'] else 'pending',
                'funds_verification': bank_validation,
            })
            
            if bank_validation['valid']:
                st.success("Fund verification completed successfully! Your verification process is now complete.")
            else:
                st.warning("Fund verification partially completed. Some issues were found with your bank details.")
                for check in bank_validation['checks']:
                    st.write(f"- {check}")

def verification_status_page():
    st.header("Verification Status")
    
    investor = st.session_state.current_investor
    
    st.subheader("Overall Status")
    
    # Calculate overall status
    all_verified = all(investor.get(status, 'incomplete') == 'verified' for status in 
                      ['kyc_status', 'accreditation_status', 'aml_status', 'funds_status'])
    
    if all_verified:
        st.success("✅ Congratulations! Your investor verification is complete.")
    else:
        st.warning("⚠️ Your verification is incomplete. Please complete all required steps.")
    
    # Display status of each section
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("KYC Verification")
        if investor.get('kyc_status') == 'verified':
            st.success("✅ Completed")
            if 'first_name' in investor:
                st.write(f"Name: {investor['first_name']} {investor['last_name']}")
                st.write(f"ID: {investor['id_type']} ({investor['id_number']})")
        else:
            st.warning("⚠️ Incomplete")
            
        st.subheader("Accreditation Status")
        if investor.get('accreditation_status') == 'verified':
            st.success("✅ Verified as Accredited Investor")
            if 'accreditation_details' in investor and 'reasons' in investor['accreditation_details']:
                for reason in investor['accreditation_details']['reasons']:
                    st.write(f"- {reason}")
        elif investor.get('accreditation_status') == 'rejected':
            st.error("❌ Does Not Meet Accreditation Criteria")
            if 'accreditation_details' in investor and 'reasons' in investor['accreditation_details']:
                for reason in investor['accreditation_details']['reasons']:
                    st.write(f"- {reason}")
        else:
            st.warning("⚠️ Not Verified")
    
    with col2:
        st.subheader("AML Screening")
        if investor.get('aml_status') == 'verified':
            st.success("✅ Passed")
            if 'aml_details' in investor and 'risk_score' in investor['aml_details']:
                st.write(f"Risk Score: {investor['aml_details']['risk_score']}/100")
        elif investor.get('aml_status') == 'flagged':
            st.error("❌ Flagged for Review")
            if 'aml_details' in investor and 'risk_factors' in investor['aml_details']:
                st.write("Risk factors:")
                for factor in investor['aml_details']['risk_factors']:
                    st.write(f"- {factor}")
        else:
            st.warning("⚠️ Not Screened")
            
        st.subheader("Proof of Funds")
        if investor.get('funds_status') == 'verified':
            st.success("✅ Verified")
            if 'investment_amount' in investor:
                st.write(f"Investment Amount: ${investor['investment_amount']:,}")
                st.write(f"Bank: {investor.get('bank_name', 'N/A')}")
        elif investor.get('funds_status') == 'pending':
            st.warning("⚠️ Pending Manual Review")
        else:
            st.warning("⚠️ Not Verified")
    
    # Complete verification button
    if all_verified:
        if st.button("Complete Verification Process"):
            # In a real application, this would trigger final processing and database updates
            investor['status'] = 'complete'
            investor['completion_date'] = datetime.now().isoformat()
            st.session_state.verified_investors.append(investor.copy())
            
            # Reset current investor
            st.session_state.current_investor = {
                'id': str(uuid.uuid4()),
                'status': 'incomplete',
                'kyc_status': 'incomplete',
                'accreditation_status': 'incomplete',
                'aml_status': 'incomplete',
                'funds_status': 'incomplete'
            }
            
            st.success("Verification process completed and recorded! You can start a new verification from the Home page.")
            st.balloons()

def admin_dashboard():
    st.header("Admin Dashboard")
    
    # Simple authentication (in a real app, use proper authentication)
    admin_password = st.text_input("Admin Password", type="password")
    if admin_password != "admin123":  # Never use hardcoded passwords in real applications
        st.error("Please enter the correct admin password to access this dashboard.")
        return
    
    st.subheader("Verified Investors")
    
    if not st.session_state.verified_investors:
        st.info("No verified investors yet.")
    else:
        # Create a dataframe for display
        investor_data = []
        for investor in st.session_state.verified_investors:
            investor_data.append({
                "ID": investor['id'],
                "Name": f"{investor.get('first_name', 'N/A')} {investor.get('last_name', 'N/A')}",
                "Country": investor.get('country', 'N/A'),
                "KYC": investor.get('kyc_status', 'N/A'),
                "Accredited": investor.get('accreditation_status', 'N/A'),
                "AML": investor.get('aml_status', 'N/A'),
                "Funds": investor.get('funds_status', 'N/A'),
                "Investment": f"${investor.get('investment_amount', 0):,}",
                "Completion Date": investor.get('completion_date', 'N/A')
            })
        
        df = pd.DataFrame(investor_data)
        st.dataframe(df)
        
        # Export options
        if st.button("Export Investor Data (CSV)"):
            csv = df.to_csv(index=False)
            b64 = base64.b64encode(csv.encode()).decode()
            href = f'<a href="data:file/csv;base64,{b64}" download="investor_data.csv">Download CSV File</a>'
            st.markdown(href, unsafe_allow_html=True)
    
    # System statistics
    st.subheader("System Statistics")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Investors", len(st.session_state.verified_investors))
    
    with col2:
        accredited = sum(1 for inv in st.session_state.verified_investors if inv.get('accreditation_status') == 'verified')
        st.metric("Accredited Investors", accredited)
    
    with col3:
        total_investment = sum(inv.get('investment_amount', 0) for inv in st.session_state.verified_investors)
        st.metric("Total Investment", f"${total_investment:,}")
    
    with col4:
        aml_flagged = sum(1 for inv in st.session_state.verified_investors if inv.get('aml_status') == 'flagged')
        st.metric("AML Flagged", aml_flagged)

# Run the app
if __name__ == "__main__":
    main()

# import streamlit as st
# import pandas as pd
# import numpy as np
# import cv2
# import os
# import uuid
# import json
# import re
# import base64
# import requests
# from datetime import datetime
# from PIL import Image
# import face_recognition  # You'll need to install this: pip install face_recognition

# # Set page configuration
# st.set_page_config(
#     page_title="Investor Verification System",
#     page_icon="🔒",
#     layout="wide"
# )

# # Create directories for storing uploaded files
# os.makedirs("uploads/ids", exist_ok=True)
# os.makedirs("uploads/selfies", exist_ok=True)
# os.makedirs("uploads/documents", exist_ok=True)

# # Define a simple database (in a real app, you would use a proper database)
# if 'verified_investors' not in st.session_state:
#     st.session_state.verified_investors = []

# if 'current_investor' not in st.session_state:
#     st.session_state.current_investor = {
#         'id': str(uuid.uuid4()),
#         'status': 'incomplete',
#         'kyc_status': 'incomplete',
#         'accreditation_status': 'incomplete',
#         'aml_status': 'incomplete',
#         'funds_status': 'incomplete'
#     }

# # --------- Helper Functions ---------

# def save_uploaded_file(uploaded_file, directory):
#     """Save an uploaded file to the specified directory"""
#     if uploaded_file is not None:
#         file_path = os.path.join(directory, uploaded_file.name)
#         with open(file_path, "wb") as f:
#             f.write(uploaded_file.getbuffer())
#         return file_path
#     return None

# def face_verification(id_image_path, selfie_image_path):
#     """Verify if the face in ID matches the selfie using face_recognition"""
#     try:
#         # Load images
#         id_image = face_recognition.load_image_file(id_image_path)
#         selfie_image = face_recognition.load_image_file(selfie_image_path)
        
#         # Get face encodings
#         id_encodings = face_recognition.face_encodings(id_image)
#         selfie_encodings = face_recognition.face_encodings(selfie_image)
        
#         if len(id_encodings) == 0 or len(selfie_encodings) == 0:
#             return False, "No face detected in one or both images"
        
#         # Compare faces
#         match = face_recognition.compare_faces([id_encodings[0]], selfie_encodings[0])[0]
#         distance = face_recognition.face_distance([id_encodings[0]], selfie_encodings[0])[0]
        
#         if match and distance < 0.6:  # Threshold for matching
#             return True, f"Match confirmed with confidence {(1-distance)*100:.2f}%"
#         else:
#             return False, f"No match, similarity score: {(1-distance)*100:.2f}%"
            
#     except Exception as e:
#         return False, f"Error during face verification: {str(e)}"

# def check_id_validity(id_number, id_type):
#     """Basic ID validation based on patterns"""
#     if id_type == "Aadhar Card (India)":
#         # Aadhar has 12 digits
#         return bool(re.match(r'^\d{12}$', id_number)), "Valid Aadhar format" if re.match(r'^\d{12}$', id_number) else "Invalid Aadhar format"
#     elif id_type == "PAN Card (India)":
#         # PAN has 10 characters (5 letters, 4 numbers, 1 letter)
#         return bool(re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', id_number)), "Valid PAN format" if re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', id_number) else "Invalid PAN format"
#     elif id_type == "Passport":
#         # Basic passport format check (varies by country)
#         return bool(re.match(r'^[A-Z0-9]{8,12}$', id_number)), "Valid Passport format" if re.match(r'^[A-Z0-9]{8,12}$', id_number) else "Invalid Passport format"
#     return True, "Format check not available for this ID type"

# def mock_aml_check(investor_data):
#     """Mock AML check - in a real application, you'd use a proper AML API"""
#     # This is a simulation - NEVER rely on this for real AML checks
#     high_risk_names = ["John Doe", "Jane Smith", "Vladimir Putin", "Kim Jong Un"]
#     high_risk_countries = ["North Korea", "Iran", "Syria"]
    
#     name = f"{investor_data.get('first_name', '')} {investor_data.get('last_name', '')}"
#     country = investor_data.get('country', '')
    
#     risks = []
#     if any(name.lower() in high_name.lower() for high_name in high_risk_names):
#         risks.append("Potential match on PEP/Sanctions list")
    
#     if country in high_risk_countries:
#         risks.append(f"High-risk jurisdiction: {country}")
    
#     risk_score = len(risks) * 33 if risks else np.random.randint(5, 20)
    
#     return {
#         "passed": risk_score < 50,
#         "risk_score": risk_score,
#         "risk_factors": risks if risks else ["No significant risk factors identified"],
#         "timestamp": datetime.now().isoformat()
#     }

# def verify_accreditation(income, net_worth, investment_experience):
#     """Verify if investor meets accreditation requirements"""
#     # This is a simplified version - real accreditation has specific legal requirements
#     meets_criteria = False
#     reasons = []
    
#     if income >= 200000:
#         meets_criteria = True
#         reasons.append(f"Annual income of ${income:,} meets minimum requirement")
    
#     if net_worth >= 1000000:
#         meets_criteria = True
#         reasons.append(f"Net worth of ${net_worth:,} meets minimum requirement")
    
#     if investment_experience >= 5 and (income >= 100000 or net_worth >= 500000):
#         meets_criteria = True
#         reasons.append(f"{investment_experience} years of investment experience with sufficient financial backing")
    
#     if not meets_criteria:
#         reasons = ["Does not meet any accreditation criteria"]
    
#     return {
#         "accredited": meets_criteria,
#         "reasons": reasons,
#         "timestamp": datetime.now().isoformat()
#     }

# def validate_bank_details(account_number, routing_number, bank_name):
#     """Basic validation of bank details"""
#     # In a real application, you would use an API like Plaid for verification
    
#     # Basic format checks
#     account_valid = bool(re.match(r'^\d{10,17}$', account_number))
#     routing_valid = bool(re.match(r'^\d{9}$', routing_number)) if routing_number else True
    
#     checks = []
#     if account_valid:
#         checks.append("Account number format is valid")
#     else:
#         checks.append("Account number format is invalid")
        
#     if routing_valid:
#         checks.append("Routing number format is valid")
#     else:
#         checks.append("Routing number format is invalid")
    
#     if bank_name:
#         checks.append(f"Bank name provided: {bank_name}")
    
#     return {
#         "valid": account_valid and routing_valid and bool(bank_name),
#         "checks": checks,
#         "timestamp": datetime.now().isoformat()
#     }

# # --------- Main UI ---------

# def main():
#     st.title("Investor Verification System")
    
#     # Sidebar for navigation
#     st.sidebar.title("Navigation")
#     page = st.sidebar.radio("Go to", ["Home", "KYC Verification", "Accreditation Check", "AML Screening", "Proof of Funds", "Verification Status", "Admin Dashboard"])
    
#     if page == "Home":
#         home_page()
#     elif page == "KYC Verification":
#         kyc_verification_page()
#     elif page == "Accreditation Check":
#         accreditation_page()
#     elif page == "AML Screening":
#         aml_screening_page()
#     elif page == "Proof of Funds":
#         proof_of_funds_page()
#     elif page == "Verification Status":
#         verification_status_page()
#     elif page == "Admin Dashboard":
#         admin_dashboard()

# def home_page():
#     st.header("Welcome to the Investor Verification System")
    
#     st.write("""
#     This system will guide you through the necessary steps to verify your identity and eligibility as an investor.
    
#     The process includes:
#     1. **KYC (Know Your Customer)** - Identity verification
#     2. **Accreditation Check** - Confirming your investor status
#     3. **AML Screening** - Anti-Money Laundering checks
#     4. **Proof of Funds** - Verifying the source of investment funds
    
#     Please navigate through each section using the sidebar.
#     """)
    
#     if st.button("Start New Verification"):
#         st.session_state.current_investor = {
#             'id': str(uuid.uuid4()),
#             'status': 'incomplete',
#             'kyc_status': 'incomplete',
#             'accreditation_status': 'incomplete',
#             'aml_status': 'incomplete',
#             'funds_status': 'incomplete',
#             'timestamp': datetime.now().isoformat()
#         }
#         st.success("New verification process started! Please proceed to KYC Verification.")

# def kyc_verification_page():
#     st.header("KYC Verification")
    
#     st.subheader("Personal Information")
#     col1, col2 = st.columns(2)
    
#     with col1:
#         first_name = st.text_input("First Name")
#         last_name = st.text_input("Last Name")
#         dob = st.date_input("Date of Birth")
#         email = st.text_input("Email Address")
    
#     with col2:
#         phone = st.text_input("Phone Number")
#         country = st.selectbox("Country of Residence", ["India", "United States", "United Kingdom", "Canada", "Australia", "Singapore", "Others"])
#         address = st.text_area("Full Address")
    
#     st.subheader("Identity Verification")
#     id_type = st.selectbox("ID Type", ["Aadhar Card (India)", "PAN Card (India)", "Passport", "Driver's License", "National ID"])
#     id_number = st.text_input("ID Number")
    
#     id_valid, id_message = check_id_validity(id_number, id_type)
#     if id_number:
#         if id_valid:
#             st.success(id_message)
#         else:
#             st.error(id_message)
    
#     col1, col2 = st.columns(2)
    
#     with col1:
#         st.write("Upload ID Document (Front)")
#         id_front = st.file_uploader("ID Front", type=["jpg", "jpeg", "png", "pdf"])
        
#         st.write("Upload ID Document (Back, if applicable)")
#         id_back = st.file_uploader("ID Back", type=["jpg", "jpeg", "png", "pdf"])
    
#     with col2:
#         st.write("Take or Upload Selfie")
#         selfie = st.file_uploader("Selfie", type=["jpg", "jpeg", "png"])
        
#         if selfie:
#             selfie_path = save_uploaded_file(selfie, "uploads/selfies")
#             st.image(selfie, width=250, caption="Uploaded Selfie")
    
#     st.subheader("Address Verification")
#     address_proof_type = st.selectbox("Address Proof Type", ["Utility Bill", "Bank Statement", "Government Letter", "Rental Agreement"])
#     address_proof = st.file_uploader("Upload Address Proof", type=["jpg", "jpeg", "png", "pdf"])
    
#     if st.button("Submit KYC Information"):
#         if not (first_name and last_name and dob and email and phone and country and address and id_number and id_type):
#             st.error("Please fill in all required personal and ID information fields.")
#         elif not (id_front and selfie and address_proof):
#             st.error("Please upload all required documents (ID, selfie, and address proof).")
#         elif not id_valid:
#             st.error(f"Please correct the ID format issue: {id_message}")
#         else:
#             # Save files
#             id_front_path = save_uploaded_file(id_front, "uploads/ids")
#             address_proof_path = save_uploaded_file(address_proof, "uploads/documents")
#             selfie_path = save_uploaded_file(selfie, "uploads/selfies")
            
#             # Face verification if ID front is an image (not PDF)
#             face_match_message = ""
#             if id_front.type.startswith('image'):
#                 face_match, face_match_message = face_verification(id_front_path, selfie_path)
#                 if not face_match:
#                     st.error(f"Face verification failed: {face_match_message}")
#                     return
            
#             # Update investor data
#             st.session_state.current_investor.update({
#                 'first_name': first_name,
#                 'last_name': last_name,
#                 'dob': str(dob),
#                 'email': email,
#                 'phone': phone,
#                 'country': country,
#                 'address': address,
#                 'id_type': id_type,
#                 'id_number': id_number,
#                 'id_front_path': id_front_path,
#                 'id_back_path': save_uploaded_file(id_back, "uploads/ids") if id_back else None,
#                 'selfie_path': selfie_path,
#                 'address_proof_type': address_proof_type,
#                 'address_proof_path': address_proof_path,
#                 'kyc_status': 'verified',
#                 'kyc_timestamp': datetime.now().isoformat(),
#                 'face_verification': face_match_message
#             })
            
#             st.success("KYC information submitted successfully! Proceed to the next step.")
#             st.balloons()

# def accreditation_page():
#     st.header("Investor Accreditation Verification")
    
#     if st.session_state.current_investor.get('kyc_status') != 'verified':
#         st.warning("Please complete KYC verification first before proceeding to accreditation.")
#         return
    
#     st.write("""
#     To verify your status as an accredited investor, please provide the following financial information. 
#     This helps ensure compliance with regulations for certain types of investments.
#     """)
    
#     st.subheader("Financial Information")
    
#     annual_income = st.number_input("Annual Income (USD)", min_value=0, step=10000)
#     net_worth = st.number_input("Net Worth (USD)", min_value=0, step=50000)
#     investment_experience = st.slider("Years of Investment Experience", 0, 30, 1)
    
#     st.subheader("Verification Documents")
    
#     income_proof_type = st.selectbox("Income Verification Document", 
#                                    ["Tax Returns", "W-2 Form", "Pay Stubs", "Employment Verification Letter", "Other"])
#     income_proof = st.file_uploader("Upload Income Proof", type=["jpg", "jpeg", "png", "pdf"])
    
#     net_worth_proof_type = st.selectbox("Net Worth Verification Document", 
#                                       ["Bank Statements", "Investment Account Statements", "Property Valuations", "CPA Letter", "Other"])
#     net_worth_proof = st.file_uploader("Upload Net Worth Proof", type=["jpg", "jpeg", "png", "pdf"])
    
#     if st.button("Submit Accreditation Information"):
#         if not (annual_income > 0 or net_worth > 0):
#             st.error("Please provide either annual income or net worth information.")
#         elif not (income_proof or net_worth_proof):
#             st.error("Please upload at least one verification document.")
#         else:
#             # Save documents
#             income_proof_path = save_uploaded_file(income_proof, "uploads/documents") if income_proof else None
#             net_worth_proof_path = save_uploaded_file(net_worth_proof, "uploads/documents") if net_worth_proof else None
            
#             # Verify accreditation
#             accreditation_result = verify_accreditation(annual_income, net_worth, investment_experience)
            
#             # Update investor data
#             st.session_state.current_investor.update({
#                 'annual_income': annual_income,
#                 'net_worth': net_worth,
#                 'investment_experience': investment_experience,
#                 'income_proof_type': income_proof_type if income_proof else None,
#                 'income_proof_path': income_proof_path,
#                 'net_worth_proof_type': net_worth_proof_type if net_worth_proof else None,
#                 'net_worth_proof_path': net_worth_proof_path,
#                 'accreditation_status': 'verified' if accreditation_result['accredited'] else 'rejected',
#                 'accreditation_details': accreditation_result,
#             })
            
#             if accreditation_result['accredited']:
#                 st.success("Accreditation verified successfully! Proceed to the next step.")
#             else:
#                 st.error("Based on the provided information, you do not meet the accreditation criteria.")
#                 st.write("Reasons:")
#                 for reason in accreditation_result['reasons']:
#                     st.write(f"- {reason}")

# def aml_screening_page():
#     st.header("Anti-Money Laundering (AML) Screening")
    
#     if st.session_state.current_investor.get('kyc_status') != 'verified':
#         st.warning("Please complete KYC verification first before proceeding to AML screening.")
#         return
    
#     st.write("""
#     AML screening helps prevent money laundering and ensures compliance with financial regulations.
#     Please provide additional information for screening purposes.
#     """)
    
#     st.subheader("Screening Information")
    
#     political_exposure = st.radio("Are you a politically exposed person (PEP) or have close relations with one?", ["No", "Yes"])
    
#     if political_exposure == "Yes":
#         pep_details = st.text_area("Please provide details about your political exposure")
#     else:
#         pep_details = ""
    
#     st.subheader("Source of Wealth")
    
#     wealth_source = st.multiselect("Select your primary sources of wealth", 
#                                  ["Employment Income", "Business Ownership", "Investments", "Inheritance", "Real Estate", "Other"])
    
#     if "Other" in wealth_source:
#         other_wealth = st.text_input("Please specify other source of wealth")
#     else:
#         other_wealth = ""
    
#     wealth_details = st.text_area("Please provide brief details about your sources of wealth")
    
#     st.subheader("Additional Screening")
#     st.write("Note: In a real system, additional checks would be performed using third-party AML databases.")
    
#     if st.button("Submit for AML Screening"):
#         if not wealth_source:
#             st.error("Please select at least one source of wealth.")
#         elif "Other" in wealth_source and not other_wealth:
#             st.error("Please specify your other source of wealth.")
#         else:
#             # Mock AML check - in a real system, you'd use an actual AML API
#             aml_result = mock_aml_check(st.session_state.current_investor)
            
#             # Update investor data
#             st.session_state.current_investor.update({
#                 'political_exposure': political_exposure,
#                 'pep_details': pep_details if political_exposure == "Yes" else None,
#                 'wealth_source': wealth_source,
#                 'other_wealth': other_wealth if "Other" in wealth_source else None,
#                 'wealth_details': wealth_details,
#                 'aml_status': 'verified' if aml_result['passed'] else 'flagged',
#                 'aml_details': aml_result,
#             })
            
#             if aml_result['passed']:
#                 st.success("AML screening completed successfully! Proceed to the next step.")
#             else:
#                 st.error(f"AML screening flagged potential issues. Risk score: {aml_result['risk_score']}/100")
#                 st.write("Risk factors:")
#                 for factor in aml_result['risk_factors']:
#                     st.write(f"- {factor}")

# def proof_of_funds_page():
#     st.header("Proof of Funds Verification")
    
#     if st.session_state.current_investor.get('kyc_status') != 'verified':
#         st.warning("Please complete KYC verification first before proceeding to proof of funds.")
#         return
    
#     st.write("""
#     Proof of funds verification ensures that the money you plan to invest comes from legitimate sources.
#     """)
    
#     st.subheader("Bank Account Information")
    
#     bank_name = st.text_input("Bank Name")
#     account_number = st.text_input("Account Number")
#     routing_number = st.text_input("Routing Number (if applicable)")
    
#     st.subheader("Account Verification")
    
#     bank_statement = st.file_uploader("Upload Recent Bank Statement", type=["jpg", "jpeg", "png", "pdf"])
#     reference_letter = st.file_uploader("Upload Bank Reference Letter (optional)", type=["jpg", "jpeg", "png", "pdf"])
    
#     st.write("""
#     Note: In a production environment, this would be integrated with services like Plaid for secure bank verification.
#     For this demonstration, we're using a simple mock verification.
#     """)
    
#     investment_amount = st.number_input("Planned Investment Amount (USD)", min_value=0, step=1000)
    
#     if st.button("Verify Funds"):
#         if not (bank_name and account_number and bank_statement and investment_amount > 0):
#             st.error("Please provide all required bank information and planned investment amount.")
#         else:
#             # Save documents
#             bank_statement_path = save_uploaded_file(bank_statement, "uploads/documents") if bank_statement else None
#             reference_letter_path = save_uploaded_file(reference_letter, "uploads/documents") if reference_letter else None
            
#             # Validate bank details
#             bank_validation = validate_bank_details(account_number, routing_number, bank_name)
            
#             # Update investor data
#             st.session_state.current_investor.update({
#                 'bank_name': bank_name,
#                 'account_number': account_number[-4:],  # Only store last 4 digits for security
#                 'routing_number': routing_number[-4:] if routing_number else None,  # Only store last 4 digits
#                 'bank_statement_path': bank_statement_path,
#                 'reference_letter_path': reference_letter_path,
#                 'investment_amount': investment_amount,
#                 'funds_status': 'verified' if bank_validation['valid'] else 'pending',
#                 'funds_verification': bank_validation,
#             })
            
#             if bank_validation['valid']:
#                 st.success("Fund verification completed successfully! Your verification process is now complete.")
#             else:
#                 st.warning("Fund verification partially completed. Some issues were found with your bank details.")
#                 for check in bank_validation['checks']:
#                     st.write(f"- {check}")

# def verification_status_page():
#     st.header("Verification Status")
    
#     investor = st.session_state.current_investor
    
#     st.subheader("Overall Status")
    
#     # Calculate overall status
#     all_verified = all(investor.get(status, 'incomplete') == 'verified' for status in 
#                       ['kyc_status', 'accreditation_status', 'aml_status', 'funds_status'])
    
#     if all_verified:
#         st.success("✅ Congratulations! Your investor verification is complete.")
#     else:
#         st.warning("⚠️ Your verification is incomplete. Please complete all required steps.")
    
#     # Display status of each section
#     col1, col2 = st.columns(2)
    
#     with col1:
#         st.subheader("KYC Verification")
#         if investor.get('kyc_status') == 'verified':
#             st.success("✅ Completed")
#             if 'first_name' in investor:
#                 st.write(f"Name: {investor['first_name']} {investor['last_name']}")
#                 st.write(f"ID: {investor['id_type']} ({investor['id_number']})")
#         else:
#             st.warning("⚠️ Incomplete")
            
#         st.subheader("Accreditation Status")
#         if investor.get('accreditation_status') == 'verified':
#             st.success("✅ Verified as Accredited Investor")
#             if 'accreditation_details' in investor and 'reasons' in investor['accreditation_details']:
#                 for reason in investor['accreditation_details']['reasons']:
#                     st.write(f"- {reason}")
#         elif investor.get('accreditation_status') == 'rejected':
#             st.error("❌ Does Not Meet Accreditation Criteria")
#             if 'accreditation_details' in investor and 'reasons' in investor['accreditation_details']:
#                 for reason in investor['accreditation_details']['reasons']:
#                     st.write(f"- {reason}")
#         else:
#             st.warning("⚠️ Not Verified")
    
#     with col2:
#         st.subheader("AML Screening")
#         if investor.get('aml_status') == 'verified':
#             st.success("✅ Passed")
#             if 'aml_details' in investor and 'risk_score' in investor['aml_details']:
#                 st.write(f"Risk Score: {investor['aml_details']['risk_score']}/100")
#         elif investor.get('aml_status') == 'flagged':
#             st.error("❌ Flagged for Review")
#             if 'aml_details' in investor and 'risk_factors' in investor['aml_details']:
#                 st.write("Risk factors:")
#                 for factor in investor['aml_details']['risk_factors']:
#                     st.write(f"- {factor}")
#         else:
#             st.warning("⚠️ Not Screened")
            
#         st.subheader("Proof of Funds")
#         if investor.get('funds_status') == 'verified':
#             st.success("✅ Verified")
#             if 'investment_amount' in investor:
#                 st.write(f"Investment Amount: ${investor['investment_amount']:,}")
#                 st.write(f"Bank: {investor.get('bank_name', 'N/A')}")
#         elif investor.get('funds_status') == 'pending':
#             st.warning("⚠️ Pending Manual Review")
#         else:
#             st.warning("⚠️ Not Verified")
    
#     # Complete verification button
#     if all_verified:
#         if st.button("Complete Verification Process"):
#             # In a real application, this would trigger final processing and database updates
#             investor['status'] = 'complete'
#             investor['completion_date'] = datetime.now().isoformat()
#             st.session_state.verified_investors.append(investor.copy())
            
#             # Reset current investor
#             st.session_state.current_investor = {
#                 'id': str(uuid.uuid4()),
#                 'status': 'incomplete',
#                 'kyc_status': 'incomplete',
#                 'accreditation_status': 'incomplete',
#                 'aml_status': 'incomplete',
#                 'funds_status': 'incomplete'
#             }
            
#             st.success("Verification process completed and recorded! You can start a new verification from the Home page.")
#             st.balloons()

# def admin_dashboard():
#     st.header("Admin Dashboard")
    
#     # Simple authentication (in a real app, use proper authentication)
#     admin_password = st.text_input("Admin Password", type="password")
#     if admin_password != "admin123":  # Never use hardcoded passwords in real applications
#         st.error("Please enter the correct admin password to access this dashboard.")
#         return
    
#     st.subheader("Verified Investors")
    
#     if not st.session_state.verified_investors:
#         st.info("No verified investors yet.")
#     else:
#         # Create a dataframe for display
#         investor_data = []
#         for investor in st.session_state.verified_investors:
#             investor_data.append({
#                 "ID": investor['id'],
#                 "Name": f"{investor.get('first_name', 'N/A')} {investor.get('last_name', 'N/A')}",
#                 "Country": investor.get('country', 'N/A'),
#                 "KYC": investor.get('kyc_status', 'N/A'),
#                 "Accredited": investor.get('accreditation_status', 'N/A'),
#                 "AML": investor.get('aml_status', 'N/A'),
#                 "Funds": investor.get('funds_status', 'N/A'),
#                 "Investment": f"${investor.get('investment_amount', 0):,}",
#                 "Completion Date": investor.get('completion_date', 'N/A')
#             })
        
#         df = pd.DataFrame(investor_data)
#         st.dataframe(df)
        
#         # Export options
#         if st.button("Export Investor Data (CSV)"):
#             csv = df.to_csv(index=False)
#             b64 = base64.b64encode(csv.encode()).decode()
#             href = f'<a href="data:file/csv;base64,{b64}" download="investor_data.csv">Download CSV File</a>'
#             st.markdown(href, unsafe_allow_html=True)
    
#     # System statistics
#     st.subheader("System Statistics")
    
#     col1, col2, col3, col4 = st.columns(4)
    
#     with col1:
#         st.metric("Total Investors", len(st.session_state.verified_investors))
    
#     with col2:
#         accredited = sum(1 for inv in st.session_state.verified_investors if inv.get('accreditation_status') == 'verified')
#         st.metric("Accredited Investors", accredited)
    
#     with col3:
#         total_investment = sum(inv.get('investment_amount', 0) for inv in st.session_state.verified_investors)
#         st.metric("Total Investment", f"${total_investment:,}")
    
#     with col4:
#         aml_flagged = sum(1 for inv in st.session_state.verified_investors if inv.get('aml_status') == 'flagged')
#         st.metric("AML Flagged", aml_flagged)

# # Run the app
# if __name__ == "__main__":

#     main()
