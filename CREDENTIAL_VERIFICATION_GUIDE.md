# Credential Verification Guide 🔍

This guide explains how to verify verifiable credentials in your system.

## **Method 1: Web Interface Verification** 🌐

### **Using the Verification Page**
1. **Navigate to**: `http://localhost:8080/verify?t={short_token}`
2. **Or use the "View" button** on any credential in your faculty dashboard
3. **The page will show**:
   - ✅ Credential validity status
   - 📋 Credential details (title, organizer, role, etc.)
   - 👤 Student information
   - 🏢 Faculty issuer information
   - 📅 Issue and expiration dates
   - 🔐 Digital signature status

### **QR Code Verification**
- Each credential generates a QR code
- Scan the QR code with any QR scanner
- It will open the verification page automatically

## **Method 2: API Verification** 🔌

### **REST API Endpoint**
```bash
GET /api/v1/verify?t={short_token}
```

**Example:**
```bash
curl "http://localhost:8080/api/v1/verify?t=abc123def456"
```

**Response:**
```json
{
  "vcId": "urn:uuid:...",
  "status": "valid",
  "signatureValid": true,
  "issuer": {
    "id": "did:example:smarthub",
    "name": "Smart Student Hub"
  },
  "issuedAt": "2024-01-15T10:30:00Z",
  "revoked": false,
  "evidenceValidated": true
}
```

## **Method 3: Database Verification** 🗄️

### **Using SQL Queries**
Run the `verify_credentials.sql` script in your Supabase SQL Editor to:

1. **View all credentials** with their status
2. **Check specific credentials** by short token
3. **Verify credential metadata** and faculty information
4. **Check for revoked or expired credentials**

### **Quick Verification Queries**

**Check all credentials:**
```sql
SELECT vc_id, short_token, issued_at, 
       CASE WHEN revoked_at IS NOT NULL THEN 'REVOKED'
            WHEN expires_at < NOW() THEN 'EXPIRED'
            ELSE 'ACTIVE' END as status
FROM verifiable_credentials 
ORDER BY issued_at DESC;
```

**Verify specific credential:**
```sql
SELECT * FROM verifiable_credentials 
WHERE short_token = 'YOUR_TOKEN_HERE';
```

## **Method 4: Programmatic Verification** 💻

### **Using the Service in Code**
```typescript
import { verifiableCredentialServiceSimple } from './services/verifiableCredentialServiceSimple';

// Verify a credential
const result = await verifiableCredentialServiceSimple.verifyCredential('short_token_here');

console.log('Verification result:', result);
```

### **Verification Result Structure**
```typescript
interface VerificationResult {
  vcId: string;                    // Credential ID
  status: 'valid' | 'invalid' | 'revoked';  // Overall status
  signatureValid: boolean;         // Digital signature valid
  issuer: {                        // Issuer information
    id: string;
    name: string;
  };
  issuedAt: string;               // When issued
  revoked: boolean;               // Is revoked
  revokedAt?: string;             // When revoked (if applicable)
  revocationReason?: string;      // Why revoked (if applicable)
  evidenceValidated: boolean;     // Evidence files valid
  errors?: string[];              // Any errors found
}
```

## **Verification Status Meanings** 📊

| Status | Meaning | Description |
|--------|---------|-------------|
| ✅ **Valid** | Credential is authentic and active | Signature valid, not revoked, not expired |
| ❌ **Invalid** | Credential has issues | Signature invalid, expired, or other problems |
| 🚫 **Revoked** | Credential was revoked | Issuer has revoked this credential |

## **What Gets Verified** 🔍

1. **Digital Signature**: Verifies the credential hasn't been tampered with
2. **Expiration Date**: Checks if the credential is still valid
3. **Revocation Status**: Ensures the credential hasn't been revoked
4. **Issuer Authenticity**: Confirms the issuer is legitimate
5. **Evidence Files**: Validates attached evidence (if any)
6. **Metadata Integrity**: Checks faculty and student information

## **Troubleshooting** 🔧

### **Common Issues**

**"Credential not found"**
- Check if the short token is correct
- Verify the credential exists in the database

**"Signature invalid"**
- The credential may have been tampered with
- Check if the issuer's public key is correct

**"Credential expired"**
- The credential has passed its expiration date
- Issue a new credential if needed

**"Credential revoked"**
- The issuer has revoked this credential
- Check the revocation reason

### **Debug Steps**
1. **Check the database** using the SQL queries
2. **Verify the short token** is correct
3. **Check the issuer status** in the issuers table
4. **Review the credential JSON** for any issues

## **Security Features** 🔒

- **Cryptographic Signatures**: Each credential is digitally signed
- **Tamper Detection**: Any changes invalidate the signature
- **Revocation Support**: Credentials can be revoked if needed
- **Expiration Control**: Credentials automatically expire
- **Audit Logging**: All verification attempts are logged

## **Best Practices** 💡

1. **Always verify** before trusting a credential
2. **Check the issuer** to ensure it's legitimate
3. **Verify the signature** to detect tampering
4. **Check expiration dates** for current validity
5. **Use HTTPS** for verification URLs in production
6. **Log verification attempts** for audit purposes

---

**Need Help?** If you encounter any issues with verification, check the browser console for error messages or run the SQL verification queries to debug the problem.
