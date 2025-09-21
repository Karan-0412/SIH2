# LMS/ERP Integration Implementation Guide

## Quick Start

### 1. Database Setup
Run the migration to create integration tables:
```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrations/20250107_lms_erp_integration.sql
```

### 2. API Endpoints
The following API endpoints are now available:

#### Students API
```
GET    /api/students                    # List all students
GET    /api/students/{id}               # Get specific student
POST   /api/students                    # Create student
GET    /api/students?format=csv         # Export as CSV
GET    /api/students?format=xml         # Export as XML
```

#### Courses API
```
GET    /api/courses                     # List all courses
GET    /api/courses/{id}                # Get specific course
POST   /api/courses                     # Create course
GET    /api/courses?format=csv          # Export as CSV
```

#### Achievements API
```
GET    /api/achievements?student_id={id} # Get student achievements
POST   /api/achievements                # Create achievement
GET    /api/achievements?format=csv     # Export as CSV
```

#### Webhooks API
```
GET    /api/webhooks                    # List webhooks
POST   /api/webhooks                    # Create webhook
PUT    /api/webhooks/{id}               # Update webhook
DELETE /api/webhooks/{id}               # Delete webhook
```

### 3. Authentication
All API endpoints require authentication via:
- **Bearer Token**: `Authorization: Bearer <api_key>`
- **API Key**: Generated through admin interface

### 4. Admin Interface
Access the integration management interface at `/admin/integrations` (admin role required).

## Integration Examples

### Moodle Integration

#### 1. Configure Moodle Connector
```typescript
import MoodleConnector from '@/services/integrations/moodleConnector';

const moodleConfig = {
  baseUrl: 'https://your-moodle-site.com',
  token: 'your-moodle-token',
  service: 'moodle_mobile_app',
  version: '2022112800'
};

const moodle = new MoodleConnector(moodleConfig);
```

#### 2. Sync Students to Moodle
```typescript
// Sync all SIH2 students to Moodle
const result = await moodle.syncStudentsToMoodle();
console.log(`Synced ${result.success} students, ${result.failed} failed`);
```

#### 3. Sync Courses from Moodle
```typescript
// Import courses from Moodle to SIH2
const result = await moodle.syncCoursesFromMoodle();
console.log(`Synced ${result.success} courses, ${result.failed} failed`);
```

### Canvas Integration

#### 1. Configure Canvas Connector
```typescript
import CanvasConnector from '@/services/integrations/canvasConnector';

const canvasConfig = {
  baseUrl: 'https://your-canvas-instance.instructure.com',
  accessToken: 'your-canvas-access-token',
  apiVersion: 'v1'
};

const canvas = new CanvasConnector(canvasConfig);
```

#### 2. Sync Data
```typescript
// Sync students to Canvas
const studentResult = await canvas.syncStudentsToCanvas();

// Sync courses from Canvas
const courseResult = await canvas.syncCoursesFromCanvas();
```

## Webhook Configuration

### 1. Register Webhook
```bash
curl -X POST https://your-sih2-instance.com/api/webhooks \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-lms.com/webhook-endpoint",
    "events": ["student.created", "student.updated", "achievement.earned"],
    "secret": "your-webhook-secret"
  }'
```

### 2. Webhook Payload Example
```json
{
  "event_type": "student.created",
  "resource_type": "student",
  "resource_id": "uuid-here",
  "data": {
    "id": "uuid-here",
    "student_id": "STU001",
    "full_name": "John Doe",
    "email": "john@example.com",
    "department": "Computer Science"
  },
  "timestamp": "2025-01-07T10:30:00Z",
  "webhook_id": "webhook-uuid"
}
```

## Data Export Examples

### 1. Export Students as CSV
```bash
curl -X GET "https://your-sih2-instance.com/api/students?format=csv" \
  -H "Authorization: Bearer your-api-key" \
  -o students.csv
```

### 2. Export Courses as JSON
```bash
curl -X GET "https://your-sih2-instance.com/api/courses?format=json" \
  -H "Authorization: Bearer your-api-key"
```

### 3. Export with Filters
```bash
# Export students from specific department
curl -X GET "https://your-sih2-instance.com/api/students?department=Computer Science&format=csv" \
  -H "Authorization: Bearer your-api-key"
```

## Custom Integration Development

### 1. Create Custom Connector
```typescript
// src/services/integrations/customConnector.ts
export class CustomConnector {
  private config: CustomConfig;

  constructor(config: CustomConfig) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    // Implement authentication logic
  }

  async syncStudents(): Promise<{ success: number; failed: number }> {
    // Implement student sync logic
  }

  async syncCourses(): Promise<{ success: number; failed: number }> {
    // Implement course sync logic
  }
}
```

### 2. Register Custom Connector
```typescript
// Add to integration service
const customConnector = new CustomConnector(config);
await customConnector.syncStudents();
```

## Error Handling

### 1. API Error Responses
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "additional error details"
  }
}
```

### 2. Webhook Retry Logic
- Failed webhooks are automatically retried
- Retry count is tracked in database
- Exponential backoff for retries

### 3. Data Validation
- All input data is validated
- Required fields are enforced
- Data types are checked

## Security Considerations

### 1. API Key Management
- API keys are hashed before storage
- Keys can be revoked at any time
- Expiration dates are supported

### 2. Webhook Security
- Webhook signatures are verified
- HTTPS is required for webhook URLs
- Rate limiting is implemented

### 3. Data Protection
- All data is encrypted in transit
- Sensitive data is not logged
- Access is role-based

## Monitoring and Logging

### 1. Integration Logs
- All integration activities are logged
- Success/failure rates are tracked
- Performance metrics are collected

### 2. Webhook Logs
- Webhook deliveries are logged
- Response times are tracked
- Error details are recorded

### 3. API Usage
- API usage is monitored
- Rate limiting is enforced
- Usage statistics are available

## Troubleshooting

### Common Issues

#### 1. Authentication Failures
- Check API key validity
- Verify token expiration
- Ensure proper permissions

#### 2. Webhook Failures
- Verify webhook URL accessibility
- Check webhook secret configuration
- Review webhook logs for errors

#### 3. Data Sync Issues
- Check field mappings
- Verify data format compatibility
- Review error logs for details

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=integration:*
```

## Performance Optimization

### 1. Batch Operations
- Use batch APIs for bulk operations
- Implement pagination for large datasets
- Cache frequently accessed data

### 2. Rate Limiting
- Respect API rate limits
- Implement exponential backoff
- Use connection pooling

### 3. Data Filtering
- Use filters to reduce data transfer
- Implement incremental sync
- Archive old data

## Support and Maintenance

### 1. Regular Updates
- Keep connectors updated
- Monitor for API changes
- Test integrations regularly

### 2. Documentation
- Maintain integration documentation
- Update API specifications
- Provide usage examples

### 3. Support Channels
- Technical support available
- Community forum for discussions
- Issue tracking system

## Conclusion

This integration system provides a comprehensive framework for connecting SIH2 with external LMS and ERP systems. The modular design allows for easy extension and customization based on specific institutional needs.

For additional support or questions, please refer to the technical documentation or contact the development team.
