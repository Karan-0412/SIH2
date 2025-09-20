# Verifiable Credentials System for Smart Student Hub

A comprehensive implementation of W3C Verifiable Credentials with QR code generation, blockchain anchoring, and verification capabilities for educational credentials.

## 🎯 Overview

This system allows faculty and administrators to issue digitally signed, verifiable credentials to students for their activities, achievements, and accomplishments. Credentials can be shared via QR codes and verified by anyone with access to the verification URL.

## ✨ Features

### Core Features
- **Digital Credential Issuance**: Issue W3C-compliant JSON-LD Verifiable Credentials
- **QR Code Generation**: Generate shareable QR cards with short URLs
- **Credential Verification**: Public verification endpoint for credential validation
- **Digital Signatures**: ECDSA P-256 (ES256) JWT-based signatures
- **Key Management**: JWKS endpoint with key rotation support
- **Revocation Support**: Revoke credentials with reason tracking
- **Evidence Files**: Attach and validate evidence files with integrity checks
- **Blockchain Anchoring**: Optional Merkle tree anchoring for tamper evidence
- **Audit Logging**: Comprehensive audit trail for all operations

### Security Features
- **Cryptographic Signatures**: Industry-standard ECDSA P-256 signatures
- **Key Rotation**: Automated key rotation with backward compatibility
- **Revocation Lists**: Real-time revocation status checking
- **Evidence Integrity**: SHA-256 hashing for evidence file validation
- **Secure Storage**: Private keys stored in secure key management
- **Access Control**: Role-based access control for all operations

## 🏗️ Architecture

### Database Schema
- `issuers`: Platform and institutional issuers with public keys
- `verifiable_credentials`: Issued credentials with metadata
- `evidence_files`: Evidence attachments with integrity hashes
- `audit_logs`: Comprehensive audit trail
- `anchoring_jobs`: Blockchain anchoring jobs
- `merkle_proofs`: Merkle tree inclusion proofs

### Key Components
1. **Key Management Service**: Handles key generation, rotation, and JWKS
2. **Verifiable Credential Service**: Core credential issuance and verification
3. **Blockchain Anchoring Service**: Optional Merkle tree anchoring
4. **QR Card Generator**: Generates shareable QR cards
5. **Verification UI**: Public verification interface
6. **Student UI**: Credential management for students
7. **Faculty UI**: Credential issuance interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account (or compatible PostgreSQL setup)

### Installation

1. **Install Dependencies**
```bash
npm install jose qrcode merkletreejs
npm install -D vitest @vitest/ui
```

2. **Database Setup**
```bash
# Run the migration
psql -d your_database -f supabase/migrations/20250107_create_verifiable_credentials_tables.sql
```

3. **Environment Variables**
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_BASE_URL=https://your-domain.com
REACT_APP_BLOCKCHAIN_RPC_URL=your_blockchain_rpc_url
REACT_APP_BLOCKCHAIN_PRIVATE_KEY=your_private_key
REACT_APP_BLOCKCHAIN_CONTRACT_ADDRESS=your_contract_address
```

4. **Start Development Server**
```bash
npm run dev
```

## 📖 API Documentation

### Authentication
All API endpoints (except public verification) require authentication via Bearer token.

### Endpoints

#### Public Endpoints

**GET /.well-known/jwks.json**
- Returns public keys for signature verification
- No authentication required

**GET /api/v1/verify?t={token}**
- Verifies a credential by short token
- Returns verification result with status and metadata

**GET /api/v1/status/{vcId}**
- Returns revocation status of a credential
- Used by credential verification process

#### Authenticated Endpoints

**POST /api/v1/credentials/issue**
```json
{
  "activityId": "act_123",
  "studentId": "student_456",
  "evidenceIds": ["ev_1", "ev_2"],
  "activityData": {
    "title": "International Conference on AI",
    "type": "Conference",
    "organizer": "IEEE Computer Society",
    "role": "Presenter",
    "date": "2025-01-15",
    "location": "Mumbai, India",
    "hours": 8,
    "department": "Computer Science"
  }
}
```

**GET /api/v1/credentials/{vcId}**
- Returns full credential JSON-LD

**POST /api/v1/credentials/{vcId}/revoke**
```json
{
  "reason": "Credential compromised"
}
```

**GET /api/v1/credentials/student**
- Returns all credentials for authenticated student

## 🔧 Usage Examples

### Issuing a Credential

```typescript
import { verifiableCredentialService } from './services/verifiableCredentialService';

const result = await verifiableCredentialService.issueCredential({
  activityId: 'conf-2025-ai',
  studentId: 'student-123',
  evidenceIds: ['certificate.pdf', 'presentation.pdf'],
  issuedByUserId: 'faculty-456',
  activityData: {
    title: 'AI Conference 2025',
    type: 'Conference',
    organizer: 'IEEE',
    role: 'Presenter',
    date: '2025-01-15',
    location: 'Mumbai, India',
    hours: 8,
    department: 'Computer Science',
  },
});

console.log('QR URL:', result.qrUrl);
console.log('Credential ID:', result.vcId);
```

### Verifying a Credential

```typescript
const verificationResult = await verifiableCredentialService.verifyCredential('short-token');

if (verificationResult.status === 'valid') {
  console.log('Credential is valid!');
  console.log('Issuer:', verificationResult.issuer.name);
  console.log('Issued:', verificationResult.issuedAt);
} else {
  console.log('Credential is invalid or revoked');
}
```

### Key Management

```typescript
import { keyManagementService } from './services/keyManagementService';

// Generate new key pair
const keyPair = await keyManagementService.generateKeyPair();

// Get JWKS for verification
const jwks = await keyManagementService.getJWKS();

// Rotate issuer key
const newKeyPair = await keyManagementService.rotateIssuerKey('issuer-id');
```

## 🎨 UI Components

### QR Card Generator
```tsx
import { QRCardGenerator } from './components/verifiableCredentials/QRCardGenerator';

<QRCardGenerator
  credential={{
    vcId: 'urn:uuid:...',
    credentialJson: credential,
    shortToken: 'abc123',
    qrUrl: 'https://example.com/verify?t=abc123',
    credentialUrl: 'https://example.com/api/v1/credentials/...',
  }}
  onDownload={() => console.log('Downloaded')}
  onShare={() => console.log('Shared')}
/>
```

### Student Credentials View
```tsx
import { StudentCredentials } from './components/verifiableCredentials/StudentCredentials';

<StudentCredentials studentId="student-123" />
```

### Issue Credential Modal
```tsx
import { IssueCredentialModal } from './components/verifiableCredentials/IssueCredentialModal';

<IssueCredentialModal
  studentId="student-123"
  studentName="John Doe"
  activityId="activity-456"
  onCredentialIssued={(credential) => console.log('Issued:', credential)}
>
  <Button>Issue Credential</Button>
</IssueCredentialModal>
```

## 🔒 Security Considerations

### Private Key Management
- **Never store private keys in the database**
- Use secure key management services (AWS KMS, Azure Key Vault, etc.)
- Implement key rotation policies
- Use hardware security modules (HSM) for production

### Credential Privacy
- Minimize PII in credentials
- Use hashed identifiers where possible
- Implement data retention policies
- Allow students to control sharing

### Verification Security
- Rate limit verification endpoints
- Implement CORS policies
- Log verification attempts
- Monitor for abuse

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test verifiableCredentials.test.ts
```

### Test Coverage
- Unit tests for all services
- Integration tests for API endpoints
- Security tests for signature validation
- Performance tests for issuance speed
- Acceptance criteria validation

## 📊 Monitoring and Analytics

### Audit Logs
All operations are logged with:
- Action type (issued, revoked, verified, etc.)
- User ID and IP address
- Timestamp and details
- Success/failure status

### Metrics to Monitor
- Credential issuance rate
- Verification success rate
- Key rotation frequency
- Revocation rate
- API response times

## 🚀 Deployment

### Production Checklist
- [ ] Configure secure key management
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Set up CDN for static assets
- [ ] Configure rate limiting
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS policies
- [ ] Set up log aggregation

### Environment-Specific Configuration
- Development: Use test keys and mock blockchain
- Staging: Use testnet blockchain
- Production: Use mainnet blockchain and secure keys

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test cases for examples

## 🔮 Future Enhancements

- [ ] DID (Decentralized Identifier) support
- [ ] ZK-proofs for privacy-preserving verification
- [ ] Multi-signature credentials
- [ ] Credential templates and workflows
- [ ] Mobile app for credential management
- [ ] Integration with external verification services
- [ ] Advanced analytics and reporting
- [ ] Credential marketplace

---

**Built with ❤️ for the Smart Student Hub project**

