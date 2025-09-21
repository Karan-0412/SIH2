# Verification Token Guide 🔑

This guide explains what verification tokens are and how to find them.

## **What is a Verification Token?** 🤔

A verification token is a **short, unique string** that acts as a "key" to verify a credential. It's like a password that allows you to access the credential's verification page.

### **Key Points:**
- ✅ **Short and simple**: Easy to share (e.g., `abc123def456`)
- ✅ **Unique**: Each credential has its own token
- ✅ **Secure**: Randomly generated, hard to guess
- ✅ **Stored in database**: Not in the JSON file itself

## **Where is the Token?** 📍

### **❌ NOT in the JSON file**
The verification token is **NOT stored in the downloaded JSON credential file**. The JSON contains the credential data, but not the verification token.

### **✅ In the database**
The token is stored in the `verifiable_credentials` table in the `short_token` column.

## **How to Find Your Token** 🔍

### **Method 1: From the Faculty Dashboard**
1. Go to your faculty credentials page
2. Look at the credential you want to verify
3. The "View" button contains the verification URL
4. Extract the token from the URL: `http://localhost:8080/verify?t=YOUR_TOKEN_HERE`

### **Method 2: Using SQL Query**
Run this query in Supabase SQL Editor:

```sql
-- Get verification token by VC ID (from JSON file)
SELECT 
    vc.vc_id,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url
FROM verifiable_credentials vc
WHERE vc.vc_id = 'urn:uuid:YOUR_VC_ID_FROM_JSON';
```

### **Method 3: List All Tokens**
```sql
-- Get all recent credentials with tokens
SELECT 
    vc.vc_id,
    vc.short_token as verification_token,
    'http://localhost:8080/verify?t=' || vc.short_token as verification_url,
    p.full_name as student_name,
    vc.issued_at
FROM verifiable_credentials vc
LEFT JOIN profiles p ON vc.student_id = p.id
ORDER BY vc.issued_at DESC
LIMIT 10;
```

## **Example: Finding a Token** 📝

### **Step 1: Get VC ID from JSON**
From your downloaded JSON file, find the `id` field:
```json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "id": "urn:uuid:12345678-1234-1234-1234-123456789abc",
  "type": ["VerifiableCredential", "StudentActivityCredential"],
  ...
}
```

### **Step 2: Query Database**
Use the VC ID to find the token:
```sql
SELECT short_token 
FROM verifiable_credentials 
WHERE vc_id = 'urn:uuid:12345678-1234-1234-1234-123456789abc';
```

### **Step 3: Get Verification URL**
The result might be:
- **Token**: `abc123def456`
- **Verification URL**: `http://localhost:8080/verify?t=abc123def456`

## **How Verification Works** 🔄

### **The Process:**
1. **Credential issued** → Token generated and stored in database
2. **JSON downloaded** → Contains credential data (no token)
3. **Token retrieved** → From database using VC ID
4. **Verification URL** → `http://localhost:8080/verify?t={token}`
5. **Page loads** → Shows credential details and validity

### **Why This Design?**
- **Security**: Token is separate from credential data
- **Flexibility**: Can change verification without updating JSON
- **Privacy**: Token can be revoked without affecting credential
- **Simplicity**: Easy to share verification links

## **Sample Token Examples** 💡

### **Real Token Examples:**
```
abc123def456
xyz789uvw012
qwerty123456
asdfgh789012
test-token-123
```

### **Verification URLs:**
```
http://localhost:8080/verify?t=abc123def456
http://localhost:8080/verify?t=xyz789uvw012
http://localhost:8080/verify?t=qwerty123456
```

## **Troubleshooting** 🔧

### **"Token not found"**
- Check if the VC ID is correct
- Verify the credential exists in the database
- Make sure you're using the right database

### **"Invalid token format"**
- Token should be a short string (no spaces, special chars)
- Check for typos in the token
- Ensure the token is from the correct credential

### **"Credential not found"**
- Token might be expired or revoked
- Check if the credential still exists
- Verify the token is correct

## **Quick Reference** 📋

| What | Where | Example |
|------|-------|---------|
| **VC ID** | JSON file (`id` field) | `urn:uuid:12345678-1234-1234-1234-123456789abc` |
| **Verification Token** | Database (`short_token` column) | `abc123def456` |
| **Verification URL** | Generated from token | `http://localhost:8080/verify?t=abc123def456` |
| **Database ID** | Database (`id` column) | `12345678-1234-1234-1234-123456789abc` |

## **API Endpoints** 🔌

### **Get Token by VC ID:**
```bash
# This doesn't exist - you need to use SQL
# But you can get the credential by VC ID:
curl "http://localhost:8080/api/v1/credentials/urn:uuid:YOUR_VC_ID"
```

### **Verify by Token:**
```bash
curl "http://localhost:8080/api/v1/verify?t=YOUR_TOKEN"
```

---

**Remember**: The verification token is **not in the JSON file** - it's in the database and needs to be retrieved using the VC ID from the JSON file! 🔑
