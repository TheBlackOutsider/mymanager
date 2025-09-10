import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateDate,
  validatePhone,
  validateEmployeeData,
  validateEventData,
  validateLeaveData,
} from '../validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('test@example')).toBe(false);
      expect(validateEmail('test..name@example.com')).toBe(false);
      expect(validateEmail('test@example..com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('StrongPass123!')).toBe(true);
      expect(validatePassword('ComplexP@ssw0rd')).toBe(true);
      expect(validatePassword('Secure123#')).toBe(true);
    });

    it('should reject weak passwords', () => {
      expect(validatePassword('weak')).toBe(false);
      expect(validatePassword('12345678')).toBe(false);
      expect(validatePassword('password')).toBe(false);
      expect(validatePassword('PASSWORD')).toBe(false);
      expect(validatePassword('')).toBe(false);
    });

    it('should enforce minimum requirements', () => {
      expect(validatePassword('Short1!')).toBe(false); // Too short
      expect(validatePassword('nouppercase123!')).toBe(false); // No uppercase
      expect(validatePassword('NOLOWERCASE123!')).toBe(false); // No lowercase
      expect(validatePassword('NoNumbers!')).toBe(false); // No numbers
      expect(validatePassword('NoSpecial123')).toBe(false); // No special chars
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('0')).toBe(true);
      expect(validateRequired('false')).toBe(true);
      expect(validateRequired(123)).toBe(true);
      expect(validateRequired(true)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });

    it('should handle whitespace correctly', () => {
      expect(validateRequired('  test  ')).toBe(true);
      expect(validateRequired('  ')).toBe(false);
      expect(validateRequired('\t\n')).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should validate correct date formats', () => {
      expect(validateDate('2024-01-01')).toBe(true);
      expect(validateDate('2024-12-31')).toBe(true);
      expect(validateDate('2024-02-29')).toBe(true); // Leap year
    });

    it('should reject invalid date formats', () => {
      expect(validateDate('invalid-date')).toBe(false);
      expect(validateDate('2024-13-01')).toBe(false); // Invalid month
      expect(validateDate('2024-02-30')).toBe(false); // Invalid day
      expect(validateDate('2024-00-01')).toBe(false); // Invalid month
      expect(validateDate('2024-01-00')).toBe(false); // Invalid day
    });

    it('should handle edge cases', () => {
      expect(validateDate('')).toBe(false);
      expect(validateDate('2024-2-1')).toBe(false); // Missing leading zeros
      expect(validateDate('2024-02-1')).toBe(false); // Missing leading zero
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone formats', () => {
      expect(validatePhone('+33 1 23 45 67 89')).toBe(true);
      expect(validatePhone('01 23 45 67 89')).toBe(true);
      expect(validatePhone('0123456789')).toBe(true);
      expect(validatePhone('+1 (555) 123-4567')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(validatePhone('invalid-phone')).toBe(false);
      expect(validatePhone('123')).toBe(false); // Too short
      expect(validatePhone('')).toBe(false);
      expect(validatePhone('abc-def-ghij')).toBe(false);
    });

    it('should handle international formats', () => {
      expect(validatePhone('+33 1 23 45 67 89')).toBe(true);
      expect(validatePhone('+1 555 123 4567')).toBe(true);
      expect(validatePhone('+44 20 7946 0958')).toBe(true);
    });
  });

  describe('validateEmployeeData', () => {
    const validEmployee = {
      name: 'John Doe',
      email: 'john@example.com',
      department: 'HR',
      role: 'hr_officer',
      seniority: 'mid',
    };

    it('should validate correct employee data', () => {
      const result = validateEmployeeData(validEmployee);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject employee data with missing required fields', () => {
      const invalidEmployee = { ...validEmployee, name: '' };
      const result = validateEmployeeData(invalidEmployee);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeDefined();
    });

    it('should reject employee data with invalid email', () => {
      const invalidEmployee = { ...validEmployee, email: 'invalid-email' };
      const result = validateEmployeeData(invalidEmployee);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBeDefined();
    });

    it('should reject employee data with invalid role', () => {
      const invalidEmployee = { ...validEmployee, role: 'invalid_role' };
      const result = validateEmployeeData(invalidEmployee);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.role).toBeDefined();
    });

    it('should reject employee data with invalid seniority', () => {
      const invalidEmployee = { ...validEmployee, seniority: 'invalid_seniority' };
      const result = validateEmployeeData(invalidEmployee);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.seniority).toBeDefined();
    });
  });

  describe('validateEventData', () => {
    const validEvent = {
      title: 'Team Meeting',
      description: 'Weekly team meeting',
      type: 'meeting',
      startDate: '2024-01-01T09:00:00Z',
      endDate: '2024-01-01T10:00:00Z',
      location: 'Conference Room A',
      organizer: 'John Doe',
      maxAttendees: 10,
    };

    it('should validate correct event data', () => {
      const result = validateEventData(validEvent);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject event data with missing required fields', () => {
      const invalidEvent = { ...validEvent, title: '' };
      const result = validateEventData(invalidEvent);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toBeDefined();
    });

    it('should reject event data with invalid dates', () => {
      const invalidEvent = { 
        ...validEvent, 
        startDate: '2024-01-01T10:00:00Z',
        endDate: '2024-01-01T09:00:00Z' // End before start
      };
      const result = validateEventData(invalidEvent);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.endDate).toBeDefined();
    });

    it('should reject event data with invalid type', () => {
      const invalidEvent = { ...validEvent, type: 'invalid_type' };
      const result = validateEventData(invalidEvent);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.type).toBeDefined();
    });

    it('should reject event data with invalid maxAttendees', () => {
      const invalidEvent = { ...validEvent, maxAttendees: -1 };
      const result = validateEventData(invalidEvent);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.maxAttendees).toBeDefined();
    });
  });

  describe('validateLeaveData', () => {
    const validLeave = {
      employeeId: '1',
      type: 'annual',
      startDate: '2024-01-01',
      endDate: '2024-01-05',
      reason: 'Vacation',
    };

    it('should validate correct leave data', () => {
      const result = validateLeaveData(validLeave);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject leave data with missing required fields', () => {
      const invalidLeave = { ...validLeave, reason: '' };
      const result = validateLeaveData(invalidLeave);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.reason).toBeDefined();
    });

    it('should reject leave data with invalid dates', () => {
      const invalidLeave = { 
        ...validLeave, 
        startDate: '2024-01-05',
        endDate: '2024-01-01' // End before start
      };
      const result = validateLeaveData(invalidLeave);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.endDate).toBeDefined();
    });

    it('should reject leave data with invalid type', () => {
      const invalidLeave = { ...validLeave, type: 'invalid_type' };
      const result = validateLeaveData(invalidLeave);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.type).toBeDefined();
    });

    it('should validate leave duration limits', () => {
      const longLeave = { 
        ...validLeave, 
        startDate: '2024-01-01',
        endDate: '2024-02-01' // 31 days
      };
      const result = validateLeaveData(longLeave);
      
      // Assuming there's a maximum leave duration limit
      expect(result.isValid).toBe(false);
      expect(result.errors.endDate).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined values gracefully', () => {
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });

    it('should handle empty objects and arrays', () => {
      expect(validateRequired({})).toBe(true);
      expect(validateRequired([])).toBe(true);
      expect(validateRequired('')).toBe(false);
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      expect(validateRequired(longString)).toBe(true);
      
      const longEmail = `${longString}@example.com`;
      expect(validateEmail(longEmail)).toBe(false); // Too long for email
    });

    it('should handle special characters in validation', () => {
      expect(validateRequired('!@#$%^&*()')).toBe(true);
      expect(validateRequired('test@example.com')).toBe(true);
      expect(validateRequired('test+tag@example.org')).toBe(true);
    });
  });
}); 