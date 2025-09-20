# Verifiable Credentials Setup Guide

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Database Migration
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `apply_vc_migration.sql`
4. Run the SQL script
5. Copy and paste the contents of `20250107_create_vc_rpc_functions.sql`
6. Run the SQL script

### Step 2: Verify Tables Exist
1. In Supabase SQL Editor, run the contents of `check_vc_tables.sql`
2. Verify all tables and functions exist
3. If no students exist, run `create_test_student.sql`

### Step 3: Test the System
1. Go to your app at `http://localhost:8082/test-data`
2. Scroll down to "Verifiable Credentials Integration Test"
3. Click "Run Integration Tests"
4. All tests should pass ✅

## 🔧 Troubleshooting

### Error: "Student not found"
- **Cause**: No students exist in the database
- **Solution**: Run `create_test_student.sql` or create a student profile through the UI

### Error: "Table doesn't exist"
- **Cause**: Migration not run
- **Solution**: Run the migration files in order

### Error: "RPC function not found"
- **Cause**: RPC functions not created
- **Solution**: Run `20250107_create_vc_rpc_functions.sql`

### Error: "process is not defined"
- **Cause**: Browser compatibility issue
- **Solution**: The code has been updated to use browser-compatible APIs

## 📋 What Gets Created

### Database Tables:
- `issuers` - Platform and institutional issuers
- `verifiable_credentials` - Issued credentials
- `evidence_files` - Credential attachments
- `audit_logs` - Action tracking
- `anchoring_jobs` - Blockchain anchoring (optional)
- `merkle_proofs` - Merkle tree proofs (optional)

### RPC Functions:
- `get_active_issuer()` - Get active issuer
- `create_issuer()` - Create new issuer
- `insert_verifiable_credential()` - Issue credential
- `get_credential_by_token()` - Get credential by QR token
- `verify_credential()` - Verify credential
- `revoke_credential()` - Revoke credential
- And many more...

## 🎯 How to Use

### For Faculty:
1. Go to Student Management
2. Click "Issue Credential" next to any student
3. Fill in activity details
4. Upload evidence files (optional)
5. Click "Issue Credential"

### For Students:
1. Go to Student Dashboard → Credentials tab
2. View all your issued credentials
3. Click "Share" to get QR code
4. Download credential as JSON

### For Verification:
1. Scan QR code or visit verification URL
2. See credential details and verification status
3. Verify signature and issuer authenticity

## 🔐 Security Features

- **Cryptographic Signatures**: ECDSA P-256 (ES256)
- **Key Rotation**: Support for rotating signing keys
- **Revocation**: Ability to revoke credentials
- **Audit Trail**: Complete logging of all operations
- **Evidence Integrity**: File hash verification
- **Public Verification**: Anyone can verify credentials

## 📱 Mobile Support

- QR codes work on all mobile devices
- Responsive design for mobile viewing
- Touch-friendly verification interface

## 🌐 Public Verification

- Credentials can be verified by anyone
- No login required for verification
- Public JWKS endpoint for signature verification
- Tamper-evident credential structure

## 🚨 Important Notes

1. **Backup Keys**: In production, store private keys securely (HSM/KMS)
2. **Key Rotation**: Implement regular key rotation schedule
3. **Evidence Storage**: Use secure file storage for evidence files
4. **Rate Limiting**: Implement rate limiting for verification endpoints
5. **Monitoring**: Monitor credential issuance and verification metrics

## 🆘 Support

If you encounter any issues:
1. Check the browser console for detailed error messages
2. Verify all database tables and functions exist
3. Ensure you have at least one student in the database
4. Check that the migration ran successfully

The system is now ready for production use! 🎉

