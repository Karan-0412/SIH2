# Verify Credentials by ID Guide 🆔

This guide shows you how to verify verifiable credentials using their ID instead of short tokens.

## **Types of IDs** 📋

Your system uses two types of IDs:

1. **Database ID** (`id`): UUID from the `verifiable_credentials` table
2. **VC ID** (`vc_id`): URN identifier like `urn:uuid:...`

## **Method 1: SQL Query by ID** 🗄️

### **Get Credential by Database ID**
```sql
-- Replace 'YOUR_CREDENTIAL_ID_HERE' with the actual database ID
SELECT 
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status,
    vc.credential_json
FROM verifiable_credentials vc
WHERE vc.id = 'YOUR_CREDENTIAL_ID_HERE';
```

### **Get Credential by VC ID (URN)**
```sql
-- Replace 'urn:uuid:...' with the actual VC ID
SELECT 
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status,
    vc.credential_json
FROM verifiable_credentials vc
WHERE vc.vc_id = 'urn:uuid:YOUR_VC_ID_HERE';
```

## **Method 2: API Endpoints** 🔌

### **Get Credential by VC ID**
```bash
GET /api/v1/credentials/{vc_id}
```

**Example:**
```bash
curl "http://localhost:8080/api/v1/credentials/urn:uuid:12345678-1234-1234-1234-123456789abc"
```

**Response:**
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "id": "urn:uuid:12345678-1234-1234-1234-123456789abc",
  "type": ["VerifiableCredential", "StudentActivityCredential"],
  "issuer": {
    "id": "did:example:smarthub",
    "name": "Smart Student Hub"
  },
  "issuanceDate": "2024-01-15T10:30:00Z",
  "credentialSubject": {
    "id": "did:example:student:student-id",
    "name": "John Doe",
    "activityType": "Conference",
    "title": "AI Conference 2024",
    "organizer": "IEEE",
    "role": "Presenter",
    "date": "2024-01-15",
    "hours": 8,
    "metadata": {
      "studentRegistrationId": "student-id",
      "department": "Computer Science",
      "issuedByFaculty": {
        "id": "faculty-id",
        "name": "Dr. Smith",
        "department": "Computer Science"
      }
    }
  },
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2024-01-15T10:30:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:example:smarthub#key-1",
    "jws": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9..."
  }
}
```

## **Method 3: Programmatic Verification** 💻

### **Using the Service in Code**
```typescript
import { verifiableCredentialService } from './services/verifiableCredentialService';

// Get credential by VC ID
const credential = await verifiableCredentialService.getCredential('urn:uuid:12345678-1234-1234-1234-123456789abc');

if (credential) {
  console.log('Credential found:', credential);
  console.log('Title:', credential.credentialSubject.title);
  console.log('Student:', credential.credentialSubject.name);
  console.log('Issuer:', credential.issuer.name);
} else {
  console.log('Credential not found');
}
```

### **Direct Database Query**
```typescript
import { supabase } from '@/integrations/supabase/client';

// Get credential by database ID
const { data, error } = await supabase
  .from('verifiable_credentials')
  .select('*')
  .eq('id', 'your-database-id-here')
  .single();

if (data) {
  console.log('Credential:', data);
  console.log('Status:', data.revoked_at ? 'REVOKED' : 'ACTIVE');
}
```

## **Method 4: Web Interface** 🌐

### **Direct URL Access**
You can access credentials directly via URL:
```
http://localhost:8080/api/v1/credentials/{vc_id}
```

### **Example URLs**
```
http://localhost:8080/api/v1/credentials/urn:uuid:12345678-1234-1234-1234-123456789abc
```

## **Finding Credential IDs** 🔍

### **List All Credential IDs**
```sql
SELECT 
    vc.id as database_id,
    vc.vc_id as urn_id,
    vc.short_token,
    p.full_name as student_name,
    vc.issued_at,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC;
```

### **Search by Student Name**
```sql
SELECT 
    vc.id as database_id,
    vc.vc_id as urn_id,
    vc.short_token,
    p.full_name as student_name,
    vc.issued_at
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
WHERE p.full_name ILIKE '%John%'
ORDER BY vc.issued_at DESC;
```

## **Verification Status** 📊

| Status | Meaning | Description |
|--------|---------|-------------|
| ✅ **ACTIVE** | Credential is valid | Not revoked, not expired |
| 🚫 **REVOKED** | Credential was revoked | Issuer has revoked this credential |
| ⏰ **EXPIRED** | Credential has expired | Past the expiration date |

## **Complete Verification Example** 🔍

```sql
-- Complete verification with all details
SELECT 
    'VERIFICATION_RESULT' as info,
    vc.id as credential_id,
    vc.vc_id,
    vc.short_token,
    vc.issued_at,
    vc.expires_at,
    vc.revoked_at,
    vc.revocation_reason,
    CASE 
        WHEN vc.revoked_at IS NOT NULL THEN 'REVOKED'
        WHEN vc.expires_at < NOW() THEN 'EXPIRED'
        ELSE 'ACTIVE'
    END as status,
    -- Student info
    p.full_name as student_name,
    p.email as student_email,
    -- Issuer info
    i.name as issuer_name,
    i.did as issuer_did,
    -- Activity info
    vc.credential_json->'credentialSubject'->>'title' as activity_title,
    vc.credential_json->'credentialSubject'->>'organizer' as organizer,
    vc.credential_json->'credentialSubject'->>'role' as role,
    -- Faculty info
    vc.credential_json->'credentialSubject'->'metadata'->'issuedByFaculty'->>'name' as faculty_name
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
LEFT JOIN issuers i ON vc.issuer_id = i.id
WHERE vc.id = 'YOUR_CREDENTIAL_ID_HERE';
```

## **Troubleshooting** 🔧

### **Common Issues**

**"Credential not found"**
- Check if the ID is correct
- Verify the credential exists in the database
- Use the list query to find the correct ID

**"Invalid VC ID format"**
- VC IDs should be in format: `urn:uuid:...`
- Database IDs should be UUIDs
- Check the format of your ID

**"Permission denied"**
- Some endpoints may require authentication
- Check if you're logged in as the right user

### **Quick Debug Steps**
1. **List all credentials** to find the correct ID
2. **Check the ID format** (database ID vs VC ID)
3. **Verify the credential exists** using SQL
4. **Check permissions** if using API endpoints

---

**Need Help?** Use the SQL queries above to debug any issues with credential verification by ID.
