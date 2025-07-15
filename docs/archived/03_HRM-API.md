# 🏢 TazaCore HRM API Documentation

## Overview
The TazaCore HRM (Human Resource Management) API provides comprehensive endpoints for managing employee data, organizational structure, and HR processes within the TazaCore platform.

## Base URL
```
https://your-domain.com/api/hrm
```

## Authentication
All API requests require authentication using Bearer tokens:
```bash
Authorization: Bearer <your-access-token>
```

## Endpoints

### 👥 Employee Management

#### Get All Employees
```http
GET /api/hrm/employees
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `department` (optional): Filter by department ID
- `status` (optional): Filter by employee status (active, inactive, terminated)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "id": "emp_001",
        "employeeId": "EMP001",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@company.com",
        "phone": "+1-555-0123",
        "department": {
          "id": "dept_001",
          "name": "Engineering"
        },
        "position": "Senior Developer",
        "status": "active",
        "hireDate": "2023-01-15",
        "salary": 85000,
        "manager": {
          "id": "emp_002",
          "name": "Jane Smith"
        },
        "createdAt": "2023-01-15T10:30:00Z",
        "updatedAt": "2023-12-01T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

#### Get Employee by ID
```http
GET /api/hrm/employees/{id}
```

**Path Parameters:**
- `id` (required): Employee ID

**Response:**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": "emp_001",
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "phone": "+1-555-0123",
      "department": {
        "id": "dept_001",
        "name": "Engineering",
        "description": "Software Development Team"
      },
      "position": "Senior Developer",
      "status": "active",
      "hireDate": "2023-01-15",
      "salary": 85000,
      "manager": {
        "id": "emp_002",
        "name": "Jane Smith",
        "email": "jane.smith@company.com"
      },
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
      },
      "emergencyContact": {
        "name": "Mary Doe",
        "phone": "+1-555-0124",
        "relationship": "Spouse"
      },
      "skills": ["JavaScript", "Node.js", "React", "PostgreSQL"],
      "certifications": [
        {
          "name": "AWS Certified Developer",
          "issuer": "Amazon",
          "date": "2023-06-15",
          "expiryDate": "2026-06-15"
        }
      ],
      "createdAt": "2023-01-15T10:30:00Z",
      "updatedAt": "2023-12-01T14:20:00Z"
    }
  }
}
```

#### Create Employee
```http
POST /api/hrm/employees
```

**Request Body:**
```json
{
  "employeeId": "EMP003",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@company.com",
  "phone": "+1-555-0125",
  "departmentId": "dept_001",
  "position": "Software Engineer",
  "hireDate": "2024-01-15",
  "salary": 75000,
  "managerId": "emp_002",
  "address": {
    "street": "456 Oak Ave",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "Bob Johnson",
    "phone": "+1-555-0126",
    "relationship": "Spouse"
  },
  "skills": ["Python", "Django", "MySQL", "Docker"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "id": "emp_003",
      "employeeId": "EMP003",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@company.com",
      "status": "active",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### Update Employee
```http
PUT /api/hrm/employees/{id}
```

**Path Parameters:**
- `id` (required): Employee ID

**Request Body:** (Only include fields to update)
```json
{
  "position": "Senior Software Engineer",
  "salary": 90000,
  "skills": ["Python", "Django", "MySQL", "Docker", "Kubernetes"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employee": {
      "id": "emp_003",
      "updatedAt": "2024-01-15T15:45:00Z"
    }
  }
}
```

#### Delete Employee
```http
DELETE /api/hrm/employees/{id}
```

**Path Parameters:**
- `id` (required): Employee ID

**Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

### 🏢 Department Management

#### Get All Departments
```http
GET /api/hrm/departments
```

**Response:**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "dept_001",
        "name": "Engineering",
        "description": "Software Development Team",
        "managerId": "emp_002",
        "manager": {
          "id": "emp_002",
          "name": "Jane Smith"
        },
        "employeeCount": 25,
        "budget": 2500000,
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-12-01T10:00:00Z"
      }
    ]
  }
}
```

#### Create Department
```http
POST /api/hrm/departments
```

**Request Body:**
```json
{
  "name": "Marketing",
  "description": "Marketing and Communications Team",
  "managerId": "emp_004",
  "budget": 500000
}
```

### 📊 Attendance Management

#### Get Employee Attendance
```http
GET /api/hrm/attendance/{employeeId}
```

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "id": "att_001",
        "employeeId": "emp_001",
        "date": "2024-01-15",
        "clockIn": "09:00:00",
        "clockOut": "17:30:00",
        "breakTime": 60,
        "totalHours": 8.5,
        "status": "present",
        "notes": "Regular working day"
      }
    ],
    "summary": {
      "totalDays": 20,
      "presentDays": 18,
      "absentDays": 2,
      "totalHours": 153.5,
      "averageHours": 8.5
    }
  }
}
```

#### Clock In/Out
```http
POST /api/hrm/attendance/clock
```

**Request Body:**
```json
{
  "employeeId": "emp_001",
  "type": "clock_in", // or "clock_out"
  "timestamp": "2024-01-15T09:00:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

### 💰 Payroll Management

#### Get Employee Payroll
```http
GET /api/hrm/payroll/{employeeId}
```

**Query Parameters:**
- `year` (optional): Year (default: current year)
- `month` (optional): Month (1-12)

**Response:**
```json
{
  "success": true,
  "data": {
    "payroll": [
      {
        "id": "pay_001",
        "employeeId": "emp_001",
        "period": "2024-01",
        "baseSalary": 85000,
        "overtime": 2500,
        "bonuses": 5000,
        "deductions": {
          "tax": 12000,
          "insurance": 500,
          "retirement": 2000
        },
        "netPay": 78000,
        "payDate": "2024-01-31",
        "status": "paid"
      }
    ]
  }
}
```

#### Generate Payroll
```http
POST /api/hrm/payroll/generate
```

**Request Body:**
```json
{
  "employeeIds": ["emp_001", "emp_002"],
  "period": "2024-01",
  "payDate": "2024-01-31"
}
```

### 🏖️ Leave Management

#### Get Employee Leave Balance
```http
GET /api/hrm/leaves/balance/{employeeId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": {
      "employeeId": "emp_001",
      "vacation": {
        "total": 20,
        "used": 5,
        "remaining": 15
      },
      "sick": {
        "total": 10,
        "used": 2,
        "remaining": 8
      },
      "personal": {
        "total": 3,
        "used": 1,
        "remaining": 2
      }
    }
  }
}
```

#### Submit Leave Request
```http
POST /api/hrm/leaves/request
```

**Request Body:**
```json
{
  "employeeId": "emp_001",
  "type": "vacation",
  "startDate": "2024-02-15",
  "endDate": "2024-02-20",
  "reason": "Family vacation",
  "notes": "Will be available for urgent matters via email"
}
```

#### Approve/Reject Leave Request
```http
PUT /api/hrm/leaves/request/{id}
```

**Request Body:**
```json
{
  "status": "approved", // or "rejected"
  "approvedBy": "emp_002",
  "notes": "Approved. Have a great vacation!"
}
```

### 📈 Performance Management

#### Get Employee Performance Reviews
```http
GET /api/hrm/performance/{employeeId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "rev_001",
        "employeeId": "emp_001",
        "reviewerId": "emp_002",
        "period": "2023-Q4",
        "type": "quarterly",
        "scores": {
          "technical": 4.5,
          "communication": 4.0,
          "teamwork": 4.5,
          "leadership": 4.0,
          "overall": 4.25
        },
        "goals": [
          {
            "id": "goal_001",
            "title": "Complete React certification",
            "status": "completed",
            "dueDate": "2024-03-31"
          }
        ],
        "feedback": "Excellent technical skills and great team collaboration.",
        "reviewDate": "2024-01-15",
        "status": "completed"
      }
    ]
  }
}
```

#### Create Performance Review
```http
POST /api/hrm/performance/review
```

**Request Body:**
```json
{
  "employeeId": "emp_001",
  "reviewerId": "emp_002",
  "period": "2024-Q1",
  "type": "quarterly",
  "scores": {
    "technical": 4.5,
    "communication": 4.0,
    "teamwork": 4.5,
    "leadership": 4.0
  },
  "goals": [
    {
      "title": "Lead new project implementation",
      "description": "Lead the implementation of the new customer portal",
      "dueDate": "2024-06-30"
    }
  ],
  "feedback": "Continue excellent work and take on more leadership responsibilities."
}
```

### 📝 Reports

#### Get HR Analytics
```http
GET /api/hrm/reports/analytics
```

**Query Parameters:**
- `startDate` (optional): Start date for report period
- `endDate` (optional): End date for report period
- `departmentId` (optional): Filter by department

**Response:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalEmployees": 150,
      "activeEmployees": 145,
      "newHires": 12,
      "terminations": 3,
      "turnoverRate": 2.0,
      "averageSalary": 75000,
      "departmentBreakdown": [
        {
          "department": "Engineering",
          "employeeCount": 45,
          "averageSalary": 85000
        }
      ],
      "attendanceRate": 96.5,
      "leaveUtilization": 78.2
    }
  }
}
```

#### Generate Payroll Report
```http
GET /api/hrm/reports/payroll
```

**Query Parameters:**
- `period` (required): Payroll period (YYYY-MM)
- `departmentId` (optional): Filter by department
- `format` (optional): Response format (json, pdf, csv)

## Error Handling

The API uses standard HTTP status codes and returns consistent error responses:

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "Employee with ID 'emp_999' not found",
    "details": {
      "employeeId": "emp_999"
    }
  }
}
```

### Common Error Codes
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Validation Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Email address is required"
        },
        {
          "field": "salary",
          "message": "Salary must be a positive number"
        }
      ]
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- **Standard requests**: 1000 requests per hour per API key
- **Bulk operations**: 100 requests per hour per API key
- **Reports**: 50 requests per hour per API key

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Webhooks

The HRM API supports webhooks for real-time event notifications:

### Supported Events
- `employee.created`
- `employee.updated`
- `employee.deleted`
- `attendance.clocked_in`
- `attendance.clocked_out`
- `leave.requested`
- `leave.approved`
- `leave.rejected`
- `payroll.generated`
- `performance.review_completed`

### Webhook Payload Example
```json
{
  "event": "employee.created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "employee": {
      "id": "emp_003",
      "employeeId": "EMP003",
      "firstName": "Alice",
      "lastName": "Johnson",
      "email": "alice.johnson@company.com",
      "departmentId": "dept_001"
    }
  }
}
```

## SDK and Examples

### JavaScript/Node.js Example
```javascript
const axios = require('axios');

const hrmApi = axios.create({
  baseURL: 'https://your-domain.com/api/hrm',
  headers: {
    'Authorization': 'Bearer your-access-token',
    'Content-Type': 'application/json'
  }
});

// Get all employees
async function getEmployees() {
  try {
    const response = await hrmApi.get('/employees');
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}

// Create new employee
async function createEmployee(employeeData) {
  try {
    const response = await hrmApi.post('/employees', employeeData);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
}
```

### Python Example
```python
import requests

class HRMApi:
    def __init__(self, base_url, access_token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
    
    def get_employees(self, params=None):
        response = requests.get(
            f'{self.base_url}/employees',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def create_employee(self, employee_data):
        response = requests.post(
            f'{self.base_url}/employees',
            headers=self.headers,
            json=employee_data
        )
        return response.json()

# Usage
hrm = HRMApi('https://your-domain.com/api/hrm', 'your-access-token')
employees = hrm.get_employees()
```

## Testing

### Postman Collection
A comprehensive Postman collection is available at `/docs/examples/TazaCore-HRM-API.postman_collection.json`

### Test Credentials
For testing purposes, you can use the following credentials:
- **API Key**: `test_api_key_123456`
- **Base URL**: `https://demo.tazacore.com/api/hrm`

### Example Test Cases
```bash
# Test authentication
curl -X GET "https://demo.tazacore.com/api/hrm/employees" \
  -H "Authorization: Bearer test_api_key_123456"

# Test employee creation
curl -X POST "https://demo.tazacore.com/api/hrm/employees" \
  -H "Authorization: Bearer test_api_key_123456" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "TEST001",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "departmentId": "dept_001",
    "position": "Test Engineer"
  }'
```

## Support

For API support and questions:
- 📧 Email: api-support@tazacore.com
- 📚 Documentation: https://docs.tazacore.com/api/hrm
- 🐛 Bug Reports: https://github.com/tazacore/issues
- 💬 Community: https://discord.gg/tazacore

---

**Last Updated**: January 2024  
**API Version**: v1.0  
**Status**: Production Ready 🚀
