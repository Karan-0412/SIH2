# Sample Verification Examples 📱

This guide provides real examples of how to verify credentials using QR codes and IDs.

## **QR Code Verification** 📱

### **How QR Codes Work**
1. **QR Code contains**: `http://localhost:8080/verify?t={short_token}`
2. **When scanned**: Opens the verification page automatically
3. **Verification page**: Shows credential details and validity

### **Sample QR Code URLs**
```
http://localhost:8080/verify?t=abc123def456
http://localhost:8080/verify?t=xyz789uvw012
http://localhost:8080/verify?t=test-token-123
```

## **Sample Verification by ID** 🆔

### **Sample Database IDs**
```sql
-- Example database IDs (UUIDs)
'12345678-1234-1234-1234-123456789abc'
'87654321-4321-4321-4321-cba987654321'
'11111111-2222-3333-4444-555555555555'
```

### **Sample VC IDs (URNs)**
```
urn:uuid:12345678-1234-1234-1234-123456789abc
urn:uuid:87654321-4321-4321-4321-cba987654321
urn:uuid:11111111-2222-3333-4444-555555555555
```

### **Sample Short Tokens**
```
abc123def456
xyz789uvw012
test-token-123
qwerty123456
asdfgh789012
```

## **Complete Verification Examples** 🔍

### **Example 1: Verify by QR Code**

**Step 1: Get a credential with QR code**
```typescript
// When issuing a credential, you get:
const credential = {
  vcId: "urn:uuid:12345678-1234-1234-1234-123456789abc",
  shortToken: "abc123def456",
  qrUrl: "http://localhost:8080/verify?t=abc123def456",
  credentialUrl: "http://localhost:8080/api/v1/credentials/urn:uuid:12345678-1234-1234-1234-123456789abc"
};
```

**Step 2: Generate QR Code**
```typescript
import QRCode from 'qrcode';

const qrCodeDataUrl = await QRCode.toDataURL(credential.qrUrl, {
  width: 256,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
  errorCorrectionLevel: 'M',
});
```

**Step 3: Scan QR Code**
- QR code contains: `http://localhost:8080/verify?t=abc123def456`
- Scanning opens the verification page
- Page shows credential details and validity

### **Example 2: Verify by Short Token**

**Direct URL Access:**
```
http://localhost:8080/verify?t=abc123def456
```

**API Verification:**
```bash
curl "http://localhost:8080/api/v1/verify?t=abc123def456"
```

**Response:**
```json
{
  "vcId": "urn:uuid:12345678-1234-1234-1234-123456789abc",
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

### **Example 3: Verify by VC ID**

**API Access:**
```bash
curl "http://localhost:8080/api/v1/credentials/urn:uuid:12345678-1234-1234-1234-123456789abc"
```

**SQL Query:**
```sql
SELECT 
    vc.id,
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
WHERE vc.vc_id = 'urn:uuid:12345678-1234-1234-1234-123456789abc';
```

### **Example 4: Verify by Database ID**

**SQL Query:**
```sql
SELECT 
    vc.id,
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
WHERE vc.id = '12345678-1234-1234-1234-123456789abc';
```

## **Sample Credential Data** 📋

### **Complete Credential Example**
```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://schema.smartstudenthub.edu/credentials#"
  ],
  "id": "urn:uuid:12345678-1234-1234-1234-123456789abc",
  "type": ["VerifiableCredential", "StudentActivityCredential"],
  "issuer": {
    "id": "did:example:smarthub",
    "name": "Smart Student Hub"
  },
  "issuanceDate": "2024-01-15T10:30:00Z",
  "credentialSubject": {
    "id": "did:example:student:student-123",
    "name": "John Doe",
    "activityType": "Conference",
    "title": "AI Conference 2024",
    "organizer": "IEEE Computer Society",
    "role": "Presenter",
    "date": "2024-01-15",
    "location": "San Francisco, CA",
    "hours": 8,
    "evidence": [
      {
        "id": "https://storage.example.com/evidence/123.pdf",
        "type": "application/pdf",
        "title": "presentation.pdf",
        "hash": "sha256:abc123..."
      }
    ],
    "metadata": {
      "studentRegistrationId": "student-123",
      "department": "Computer Science",
      "issuedByFaculty": {
        "id": "faculty-456",
        "name": "Dr. Smith",
        "department": "Computer Science"
      }
    },
    "verificationUrl": "http://localhost:8080/verify?t=abc123def456"
  },
  "expirationDate": "2025-01-15T10:30:00Z",
  "credentialStatus": {
    "id": "http://localhost:8080/api/v1/status/urn:uuid:12345678-1234-1234-1234-123456789abc",
    "type": "RevocationList2021Status"
  },
  "proof": {
    "type": "JsonWebSignature2020",
    "created": "2024-01-15T10:30:00Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:example:smarthub#key-1",
    "jws": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJpc3MiOiJkaWQ6ZXhhbXBsZTpzbWFydGh1YiIsInN1YiI6InVybjp1dWlkOjEyMzQ1Njc4LTEyMzQtMTIzNC0xMjM0LTEyMzQ1Njc4OWFiYyIsIm5iZiI6MTcwNTMxNDIwMCwiZXhwIjoxNzA2MTc4MjAwLCJqdGkiOiJ1cm46dXVpZDoxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0NTY3ODlhYmMiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vc2NoZW1hLnNtYXJ0c3R1ZGVudGh1Yi5lZHUvY3JlZGVudGlhbHMjIl0sImlkIjoidXJuOnV1aWQ6MTIzNDU2NzgtMTIzNC0xMjM0LTEyMzQtMTIzNDU2Nzg5YWJjIiwidHlwZSI6WyJWZXJpZmlhYmxlQ3JlZGVudGlhbCIsIlN0dWRlbnRBY3Rpdml0eUNyZWRlbnRpYWwiXSwiaXNzdWVyIjp7ImlkIjoiZGlkOmV4YW1wbGU6c21hcnRodWIiLCJuYW1lIjoiU21hcnQgU3R1ZGVudCBIdWIifSwiaXNzdWFuY2VEYXRlIjoiMjAyNC0wMS0xNVQxMDozMDowMFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDpleGFtcGxlOnN0dWRlbnQ6c3R1ZGVudC0xMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJhY3Rpdml0eVR5cGUiOiJDb25mZXJlbmNlIiwidGl0bGUiOiJBSSBDb25mZXJlbmNlIDIwMjQiLCJvcmdhbml6ZXIiOiJJRUVEIENvbXB1dGVyIFNvY2lldHkiLCJyb2xlIjoiUHJlc2VudGVyIiwiZGF0ZSI6IjIwMjQtMDEtMTUiLCJsb2NhdGlvbiI6IlNhbiBGcmFuY2lzY28sIENBIiwiaG91cnMiOjgsImV2aWRlbmNlIjpbeyJpZCI6Imh0dHBzOi8vc3RvcmFnZS5leGFtcGxlLmNvbS9ldmlkZW5jZS8xMjMucGRmIiwidHlwZSI6ImFwcGxpY2F0aW9uL3BkZiIsInRpdGxlIjoicHJlc2VudGF0aW9uLnBkZiIsImhhc2giOiJzaGEyNTY6YWJjMTIzLi4uIn1dLCJtZXRhZGF0YSI6eyJzdHVkZW50UmVnaXN0cmF0aW9uSWQiOiJzdHVkZW50LTEyMyIsImRlcGFydG1lbnQiOiJDb21wdXRlciBTY2llbmNlIiwiaXNzdWVkQnlGYWN1bHR5Ijp7ImlkIjoiZmFjdWx0eS00NTYiLCJuYW1lIjoiRHIuIFNtaXRoIiwiZGVwYXJ0bWVudCI6IkNvbXB1dGVyIFNjaWVuY2UifX0sInZlcmlmaWNhdGlvblVybCI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MC92ZXJpZnk/dD1hYmMxMjNkZWY0NTYifSwiZXhwaXJhdGlvbkRhdGUiOiIyMDI1LTAxLTE1VDEwOjMwOjAwWiIsImNyZWRlbnRpYWxTdGF0dXMiOnsiaWQiOiJodHRwOi8vbG9jYWxob3N0OjgwODAvYXBpL3YxL3N0YXR1cy91cm46dXVpZDoxMjM0NTY3OC0xMjM0LTEyMzQtMTIzNC0xMjM0NTY3ODlhYmMiLCJ0eXBlIjoiUmV2b2NhdGlvbkxpc3QyMDIxU3RhdHVzIn19.abc123def456..."
  }
}
```

## **Testing Verification** 🧪

### **Test QR Code Generation**
```typescript
// Test QR code generation
const testUrl = "http://localhost:8080/verify?t=test-token-123";
const qrCode = await QRCode.toDataURL(testUrl);
console.log('QR Code generated:', qrCode);
```

### **Test Verification Endpoints**
```bash
# Test verification by token
curl "http://localhost:8080/api/v1/verify?t=test-token-123"

# Test credential by VC ID
curl "http://localhost:8080/api/v1/credentials/urn:uuid:test-vc-id"

# Test credential status
curl "http://localhost:8080/api/v1/credentials/urn:uuid:test-vc-id/status"
```

### **Test SQL Queries**
```sql
-- Test getting all credentials
SELECT id, vc_id, short_token, issued_at FROM verifiable_credentials LIMIT 5;

-- Test verification by short token
SELECT * FROM verifiable_credentials WHERE short_token = 'test-token-123';

-- Test verification by VC ID
SELECT * FROM verifiable_credentials WHERE vc_id = 'urn:uuid:test-vc-id';
```

## **QR Code Scanner Integration** 📱

### **Using QR Scanner Component**
```typescript
import { QRScanner } from '@/components/verifiableCredentials/QRScanner';

// In your component
const handleQRScan = (result: string) => {
  // Extract token from URL
  const url = new URL(result);
  const token = url.searchParams.get('t');
  
  if (token) {
    // Verify the credential
    verifyCredential(token);
  }
};

<QRScanner onScan={handleQRScan} />
```

### **Manual QR Code Testing**
1. **Generate a QR code** with URL: `http://localhost:8080/verify?t=test-token-123`
2. **Scan with phone** or QR scanner app
3. **Should open** the verification page
4. **Page should show** credential details and validity

## **Common Verification URLs** 🔗

```
# Verification by token
http://localhost:8080/verify?t={short_token}

# Credential by VC ID
http://localhost:8080/api/v1/credentials/{vc_id}

# Credential status
http://localhost:8080/api/v1/credentials/{vc_id}/status

# Revoke credential
http://localhost:8080/api/v1/credentials/{vc_id}/revoke
```

---

**Ready to Test!** Use these examples to test your credential verification system with real data.
