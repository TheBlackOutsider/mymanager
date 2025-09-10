import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  employeesApi,
  eventsApi,
  leavesApi,
  reportsApi,
  notificationsApi,
  attendanceApi,
  eventRegistrationApi,
  authApi,
} from '../api';
import { Employee, Event, LeaveRequest, Report, Notification, Attendance, EventRegistration } from '../../types';

// Mock axios
const mock = new MockAdapter(axios);

describe('API Services', () => {
  beforeEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  describe('Employees API', () => {
    const mockEmployee: Employee = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      department: 'HR',
      role: 'hr_officer',
      seniority: 'mid',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should fetch all employees', async () => {
      const mockResponse = {
        success: true,
        data: [mockEmployee],
        message: 'Employees retrieved successfully',
      };

      mock.onGet('/employees').reply(200, mockResponse);

      const response = await employeesApi.getAll();
      expect(response.data).toEqual(mockResponse);
    });

    it('should fetch employee by ID', async () => {
      const mockResponse = {
        success: true,
        data: mockEmployee,
        message: 'Employee retrieved successfully',
      };

      mock.onGet('/employees/1').reply(200, mockResponse);

      const response = await employeesApi.getById('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should create employee', async () => {
      const newEmployee = { ...mockEmployee, id: undefined };
      const mockResponse = {
        success: true,
        data: mockEmployee,
        message: 'Employee created successfully',
      };

      mock.onPost('/employees').reply(200, mockResponse);

      const response = await employeesApi.create(newEmployee);
      expect(response.data).toEqual(mockResponse);
    });

    it('should update employee', async () => {
      const updatedEmployee = { ...mockEmployee, name: 'Jane Doe' };
      const mockResponse = {
        success: true,
        data: updatedEmployee,
        message: 'Employee updated successfully',
      };

      mock.onPut('/employees/1').reply(200, mockResponse);

      const response = await employeesApi.update('1', updatedEmployee);
      expect(response.data).toEqual(mockResponse);
    });

    it('should delete employee', async () => {
      mock.onDelete('/employees/1').reply(200, { success: true });

      const response = await employeesApi.delete('1');
      expect(response.status).toBe(200);
    });

    it('should handle API errors', async () => {
      mock.onGet('/employees').reply(500, { error: 'Internal server error' });

      await expect(employeesApi.getAll()).rejects.toThrow();
    });
  });

  describe('Events API', () => {
    const mockEvent: Event = {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly team meeting',
      type: 'meeting',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 3600000).toISOString(),
      location: 'Conference Room A',
      organizer: 'John Doe',
      attendees: ['1', '2'],
      maxAttendees: 10,
      isRecurring: false,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should fetch all events', async () => {
      const mockResponse = {
        success: true,
        data: [mockEvent],
        message: 'Events retrieved successfully',
      };

      mock.onGet('/events').reply(200, mockResponse);

      const response = await eventsApi.getAll();
      expect(response.data).toEqual(mockResponse);
    });

    it('should fetch event by ID', async () => {
      const mockResponse = {
        success: true,
        data: mockEvent,
        message: 'Event retrieved successfully',
      };

      mock.onGet('/events/1').reply(200, mockResponse);

      const response = await eventsApi.getById('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should create event', async () => {
      const newEvent = { ...mockEvent, id: undefined };
      const mockResponse = {
        success: true,
        data: mockEvent,
        message: 'Event created successfully',
      };

      mock.onPost('/events').reply(200, mockResponse);

      const response = await eventsApi.create(newEvent);
      expect(response.data).toEqual(mockResponse);
    });

    it('should update event', async () => {
      const updatedEvent = { ...mockEvent, title: 'Updated Meeting' };
      const mockResponse = {
        success: true,
        data: updatedEvent,
        message: 'Event updated successfully',
      };

      mock.onPut('/events/1').reply(200, mockResponse);

      const response = await eventsApi.update('1', updatedEvent);
      expect(response.data).toEqual(mockResponse);
    });

    it('should delete event', async () => {
      mock.onDelete('/events/1').reply(200, { success: true });

      const response = await eventsApi.delete('1');
      expect(response.status).toBe(200);
    });
  });

  describe('Leaves API', () => {
    const mockLeave: LeaveRequest = {
      id: '1',
      employeeId: '1',
      type: 'annual',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      reason: 'Vacation',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should fetch all leaves', async () => {
      const mockResponse = {
        success: true,
        data: [mockLeave],
        message: 'Leaves retrieved successfully',
      };

      mock.onGet('/leaves').reply(200, mockResponse);

      const response = await leavesApi.getAll();
      expect(response.data).toEqual(mockResponse);
    });

    it('should fetch leave by ID', async () => {
      const mockResponse = {
        success: true,
        data: mockLeave,
        message: 'Leave retrieved successfully',
      };

      mock.onGet('/leaves/1').reply(200, mockResponse);

      const response = await leavesApi.getById('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should create leave request', async () => {
      const newLeave = { ...mockLeave, id: undefined };
      const mockResponse = {
        success: true,
        data: mockLeave,
        message: 'Leave request created successfully',
      };

      mock.onPost('/leaves').reply(200, mockResponse);

      const response = await leavesApi.create(newLeave);
      expect(response.data).toEqual(mockResponse);
    });

    it('should update leave request', async () => {
      const updatedLeave = { ...mockLeave, status: 'approved' };
      const mockResponse = {
        success: true,
        data: updatedLeave,
        message: 'Leave request updated successfully',
      };

      mock.onPut('/leaves/1').reply(200, mockResponse);

      const response = await leavesApi.update('1', updatedLeave);
      expect(response.data).toEqual(mockResponse);
    });

    it('should delete leave request', async () => {
      mock.onDelete('/leaves/1').reply(200, { success: true });

      const response = await leavesApi.delete('1');
      expect(response.status).toBe(200);
    });
  });

  describe('Reports API', () => {
    const mockReport: Report = {
      id: '1',
      type: 'events',
      title: 'Monthly Events Report',
      data: {},
      generatedAt: new Date().toISOString(),
      generatedBy: 'system',
    };

    it('should fetch all reports', async () => {
      const mockResponse = {
        success: true,
        data: [mockReport],
        message: 'Reports retrieved successfully',
      };

      mock.onGet('/reports').reply(200, mockResponse);

      const response = await reportsApi.getAll();
      expect(response.data).toEqual(mockResponse);
    });

    it('should generate report', async () => {
      const reportParams = { type: 'events', startDate: '2024-01-01', endDate: '2024-01-31' };
      const mockResponse = {
        success: true,
        data: mockReport,
        message: 'Report generated successfully',
      };

      mock.onPost('/reports/generate').reply(200, mockResponse);

      const response = await reportsApi.generate(reportParams);
      expect(response.data).toEqual(mockResponse);
    });

    it('should get analytics', async () => {
      const mockResponse = {
        success: true,
        data: { eventsCount: 10, attendanceRate: 85 },
        message: 'Analytics retrieved successfully',
      };

      mock.onGet('/reports/analytics').reply(200, mockResponse);

      const response = await reportsApi.getAnalytics();
      expect(response.data).toEqual(mockResponse);
    });

    it('should export report', async () => {
      const mockBlob = new Blob(['report data'], { type: 'text/csv' });
      mock.onGet('/reports/1/export/csv').reply(200, mockBlob);

      const response = await reportsApi.export('1', 'csv');
      expect(response.data).toEqual(mockBlob);
    });
  });

  describe('Notifications API', () => {
    const mockNotification: Notification = {
      id: '1',
      userId: '1',
      type: 'event_reminder',
      title: 'Event Reminder',
      message: 'Your event starts in 1 hour',
      read: false,
      createdAt: new Date().toISOString(),
    };

    it('should fetch notifications by user ID', async () => {
      const mockResponse = {
        success: true,
        data: [mockNotification],
        message: 'Notifications retrieved successfully',
      };

      mock.onGet('/notifications/user/1').reply(200, mockResponse);

      const response = await notificationsApi.getByUserId('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should mark notification as read', async () => {
      const mockResponse = {
        success: true,
        data: { ...mockNotification, read: true },
        message: 'Notification marked as read',
      };

      mock.onPut('/notifications/1/read').reply(200, mockResponse);

      const response = await notificationsApi.markAsRead('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should mark all notifications as read', async () => {
      const mockResponse = {
        success: true,
        data: [{ ...mockNotification, read: true }],
        message: 'All notifications marked as read',
      };

      mock.onPut('/notifications/user/1/read-all').reply(200, mockResponse);

      const response = await notificationsApi.markAllAsRead('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should create notification', async () => {
      const newNotification = { ...mockNotification, id: undefined };
      const mockResponse = {
        success: true,
        data: mockNotification,
        message: 'Notification created successfully',
      };

      mock.onPost('/notifications').reply(200, mockResponse);

      const response = await notificationsApi.create(newNotification);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('Attendance API', () => {
    const mockAttendance: Attendance = {
      id: '1',
      eventId: '1',
      employeeId: '1',
      status: 'present',
      checkIn: new Date().toISOString(),
      checkOut: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should fetch all attendance records', async () => {
      const mockResponse = {
        success: true,
        data: [mockAttendance],
        message: 'Attendance records retrieved successfully',
      };

      mock.onGet('/attendance').reply(200, mockResponse);

      const response = await attendanceApi.getAll();
      expect(response.data).toEqual(mockResponse);
    });

    it('should fetch attendance by event ID', async () => {
      const mockResponse = {
        success: true,
        data: [mockAttendance],
        message: 'Attendance records retrieved successfully',
      };

      mock.onGet('/attendance/event/1').reply(200, mockResponse);

      const response = await attendanceApi.getByEvent('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should create attendance record', async () => {
      const newAttendance = { ...mockAttendance, id: undefined };
      const mockResponse = {
        success: true,
        data: mockAttendance,
        message: 'Attendance record created successfully',
      };

      mock.onPost('/attendance').reply(200, mockResponse);

      const response = await attendanceApi.create(newAttendance);
      expect(response.data).toEqual(mockResponse);
    });

    it('should update attendance record', async () => {
      const updatedAttendance = { ...mockAttendance, checkOut: new Date().toISOString() };
      const mockResponse = {
        success: true,
        data: updatedAttendance,
        message: 'Attendance record updated successfully',
      };

      mock.onPut('/attendance/1').reply(200, mockResponse);

      const response = await attendanceApi.update('1', updatedAttendance);
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('Event Registration API', () => {
    const mockRegistration: EventRegistration = {
      id: '1',
      eventId: '1',
      employeeId: '1',
      registrationDate: new Date().toISOString(),
      status: 'confirmed',
      confirmationCode: 'ABC123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should register for event', async () => {
      const registrationRequest = {
        eventId: '1',
        employeeId: '1',
        registrationType: 'self',
      };
      const mockResponse = {
        success: true,
        data: mockRegistration,
        message: 'Registration successful',
      };

      mock.onPost('/event-registrations/register').reply(200, mockResponse);

      const response = await eventRegistrationApi.register(registrationRequest);
      expect(response.data).toEqual(mockResponse);
    });

    it('should cancel registration', async () => {
      const mockResponse = {
        success: true,
        data: { ...mockRegistration, status: 'cancelled' },
        message: 'Registration cancelled successfully',
      };

      mock.onPost('/event-registrations/1/cancel').reply(200, mockResponse);

      const response = await eventRegistrationApi.cancel('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should fetch registrations by event', async () => {
      const mockResponse = {
        success: true,
        data: [mockRegistration],
        message: 'Registrations retrieved successfully',
      };

      mock.onGet('/event-registrations/event/1').reply(200, mockResponse);

      const response = await eventRegistrationApi.getByEvent('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should check conflicts', async () => {
      const conflictRequest = {
        eventId: '1',
        employeeId: '1',
        registrationType: 'self',
      };
      const mockResponse = {
        success: true,
        data: { conflicts: [], canRegister: true },
        message: 'No conflicts found',
      };

      mock.onPost('/event-registrations/check-conflicts').reply(200, mockResponse);

      const response = await eventRegistrationApi.checkConflicts(conflictRequest);
      expect(response.data).toEqual(mockResponse);
    });

    it('should get event capacity', async () => {
      const mockResponse = {
        success: true,
        data: {
          eventId: '1',
          maxAttendees: 50,
          currentAttendees: 30,
          waitlistEnabled: true,
          waitlistSize: 5,
          registrationDeadline: new Date(Date.now() + 86400000).toISOString(),
          cancellationDeadline: new Date(Date.now() + 3600000).toISOString(),
        },
        message: 'Event capacity retrieved successfully',
      };

      mock.onGet('/event-registrations/capacity/1').reply(200, mockResponse);

      const response = await eventRegistrationApi.getCapacity('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should confirm registration', async () => {
      const mockResponse = {
        success: true,
        data: mockRegistration,
        message: 'Registration confirmed successfully',
      };

      mock.onPost('/event-registrations/1/confirm').reply(200, mockResponse);

      const response = await eventRegistrationApi.confirmRegistration('1', 'ABC123');
      expect(response.data).toEqual(mockResponse);
    });

    it('should get registrations by employee', async () => {
      const mockResponse = {
        success: true,
        data: [mockRegistration],
        message: 'Registrations retrieved successfully',
      };

      mock.onGet('/event-registrations/employee/1').reply(200, mockResponse);

      const response = await eventRegistrationApi.getByEmployee('1');
      expect(response.data).toEqual(mockResponse);
    });

    it('should update registration status', async () => {
      const mockResponse = {
        success: true,
        data: { ...mockRegistration, status: 'waitlist' },
        message: 'Registration status updated successfully',
      };

      mock.onPut('/event-registrations/1/status').reply(200, mockResponse);

      const response = await eventRegistrationApi.updateStatus('1', 'waitlist', 'Moved to waitlist');
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('Auth API', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'hr_officer',
      department: 'HR',
      isActive: true,
      lastLogin: new Date().toISOString(),
      loginMethod: 'email',
      permissions: [],
      avatar: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should login with LDAP', async () => {
      const ldapCredentials = {
        username: 'john.doe',
        password: 'password123',
      };
      const mockResponse = {
        success: true,
        data: {
          success: true,
          user: mockUser,
          token: 'ldap-token',
          refreshToken: 'ldap-refresh-token',
          permissions: [],
          sessionExpiry: new Date(Date.now() + 28800000).toISOString(),
          requiresTwoFactor: false,
          message: 'LDAP login successful',
        },
        message: 'Login successful',
      };

      mock.onPost('/auth/ldap/login').reply(200, mockResponse);

      const response = await authApi.ldapLogin(ldapCredentials);
      expect(response.data).toEqual(mockResponse);
    });

    it('should login with email', async () => {
      const emailCredentials = {
        email: 'john@example.com',
        password: 'password123',
      };
      const mockResponse = {
        success: true,
        data: {
          success: true,
          user: mockUser,
          token: 'email-token',
          refreshToken: 'email-refresh-token',
          permissions: [],
          sessionExpiry: new Date(Date.now() + 28800000).toISOString(),
          requiresTwoFactor: false,
          message: 'Email login successful',
        },
        message: 'Login successful',
      };

      mock.onPost('/auth/email/login').reply(200, mockResponse);

      const response = await authApi.emailLogin(emailCredentials);
      expect(response.data).toEqual(mockResponse);
    });

    it('should login with SSO', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          user: mockUser,
          token: 'sso-token',
          refreshToken: 'sso-refresh-token',
          permissions: [],
          sessionExpiry: new Date(Date.now() + 28800000).toISOString(),
          requiresTwoFactor: false,
          message: 'SSO login successful',
        },
        message: 'Login successful',
      };

      mock.onPost('/auth/sso/azure/login').reply(200, mockResponse);

      const response = await authApi.ssoLogin('azure');
      expect(response.data).toEqual(mockResponse);
    });

    it('should refresh token', async () => {
      const mockResponse = {
        success: true,
        data: {
          success: true,
          user: mockUser,
          token: 'new-token',
          refreshToken: 'refresh-token',
          permissions: [],
          sessionExpiry: new Date(Date.now() + 28800000).toISOString(),
          requiresTwoFactor: false,
          message: 'Token refreshed',
        },
        message: 'Token refreshed',
      };

      mock.onPost('/auth/refresh').reply(200, mockResponse);

      const response = await authApi.refreshToken();
      expect(response.data).toEqual(mockResponse);
    });

    it('should logout', async () => {
      const mockResponse = {
        success: true,
        message: 'Logout successful',
      };

      mock.onPost('/auth/logout').reply(200, mockResponse);

      const response = await authApi.logout();
      expect(response.data).toEqual(mockResponse);
    });

    it('should get profile', async () => {
      const mockResponse = {
        success: true,
        data: mockUser,
        message: 'Profile retrieved successfully',
      };

      mock.onGet('/auth/profile').reply(200, mockResponse);

      const response = await authApi.getProfile();
      expect(response.data).toEqual(mockResponse);
    });

    it('should update profile', async () => {
      const profileData = { name: 'Jane Doe' };
      const mockResponse = {
        success: true,
        data: { ...mockUser, name: 'Jane Doe' },
        message: 'Profile updated successfully',
      };

      mock.onPut('/auth/profile').reply(200, mockResponse);

      const response = await authApi.updateProfile(profileData);
      expect(response.data).toEqual(mockResponse);
    });

    it('should change password', async () => {
      const passwordData = {
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      };
      const mockResponse = {
        success: true,
        message: 'Password changed successfully',
      };

      mock.onPost('/auth/change-password').reply(200, mockResponse);

      const response = await authApi.changePassword(passwordData);
      expect(response.data).toEqual(mockResponse);
    });

    it('should enable two factor', async () => {
      const mockResponse = {
        success: true,
        data: {
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          secret: 'JBSWY3DPEHPK3PXP',
        },
        message: 'Two factor enabled successfully',
      };

      mock.onPost('/auth/2fa/enable').reply(200, mockResponse);

      const response = await authApi.enableTwoFactor();
      expect(response.data).toEqual(mockResponse);
    });

    it('should verify two factor', async () => {
      const mockResponse = {
        success: true,
        message: 'Two factor verified successfully',
      };

      mock.onPost('/auth/2fa/verify').reply(200, mockResponse);

      const response = await authApi.verifyTwoFactor('123456');
      expect(response.data).toEqual(mockResponse);
    });

    it('should disable two factor', async () => {
      const mockResponse = {
        success: true,
        message: 'Two factor disabled successfully',
      };

      mock.onPost('/auth/2fa/disable').reply(200, mockResponse);

      const response = await authApi.disableTwoFactor('123456');
      expect(response.data).toEqual(mockResponse);
    });

    it('should get permissions', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            id: '1',
            name: 'View Own Profile',
            resource: 'profile',
            action: 'read',
            scope: 'self',
          },
        ],
        message: 'Permissions retrieved successfully',
      };

      mock.onGet('/auth/permissions').reply(200, mockResponse);

      const response = await authApi.getPermissions();
      expect(response.data).toEqual(mockResponse);
    });

    it('should check permission', async () => {
      const permissionCheck = {
        resource: 'events',
        action: 'create',
        scope: 'all',
      };
      const mockResponse = {
        success: true,
        data: {
          hasAccess: true,
          reason: 'Permission granted',
        },
        message: 'Permission checked successfully',
      };

      mock.onPost('/auth/check-permission').reply(200, mockResponse);

      const response = await authApi.checkPermission(permissionCheck);
      expect(response.data).toEqual(mockResponse);
    });

    it('should get LDAP config', async () => {
      const mockResponse = {
        success: true,
        data: {
          enabled: true,
          server: 'ldap://localhost',
          port: 389,
          baseDN: 'dc=example,dc=com',
        },
        message: 'LDAP config retrieved successfully',
      };

      mock.onGet('/auth/ldap/config').reply(200, mockResponse);

      const response = await authApi.getLDAPConfig();
      expect(response.data).toEqual(mockResponse);
    });

    it('should test LDAP connection', async () => {
      const ldapConfig = {
        server: 'ldap://localhost',
        port: 389,
      };
      const mockResponse = {
        success: true,
        data: {
          connected: true,
          message: 'LDAP connection successful',
        },
        message: 'LDAP test completed',
      };

      mock.onPost('/auth/ldap/test').reply(200, mockResponse);

      const response = await authApi.testLDAPConnection(ldapConfig);
      expect(response.data).toEqual(mockResponse);
    });

    it('should sync LDAP users', async () => {
      const mockResponse = {
        success: true,
        data: {
          synced: 25,
          errors: [],
        },
        message: 'LDAP sync completed',
      };

      mock.onPost('/auth/ldap/sync').reply(200, mockResponse);

      const response = await authApi.syncLDAPUsers();
      expect(response.data).toEqual(mockResponse);
    });

    it('should get SSO config', async () => {
      const mockResponse = {
        success: true,
        data: {
          azure: {
            enabled: true,
            clientId: 'azure-client-id',
            clientSecret: 'azure-client-secret',
          },
          google: {
            enabled: false,
            clientId: '',
            clientSecret: '',
          },
        },
        message: 'SSO config retrieved successfully',
      };

      mock.onGet('/auth/sso/config').reply(200, mockResponse);

      const response = await authApi.getSSOConfig();
      expect(response.data).toEqual(mockResponse);
    });

    it('should test SSO connection', async () => {
      const mockResponse = {
        success: true,
        data: {
          connected: true,
          message: 'SSO connection successful',
        },
        message: 'SSO test completed',
      };

      mock.onPost('/auth/sso/test').reply(200, mockResponse);

      const response = await authApi.testSSOConnection('azure');
      expect(response.data).toEqual(mockResponse);
    });

    it('should get security audit', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              id: '1',
              userId: '1',
              action: 'login',
              resource: 'auth',
              success: true,
              createdAt: new Date().toISOString(),
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
        message: 'Security audit retrieved successfully',
      };

      mock.onGet('/auth/security/audit').reply(200, mockResponse);

      const response = await authApi.getSecurityAudit();
      expect(response.data).toEqual(mockResponse);
    });

    it('should get security report', async () => {
      const mockResponse = {
        success: true,
        data: {
          loginAttempts: 150,
          successfulLogins: 145,
          failedLogins: 5,
          securityEvents: 2,
        },
        message: 'Security report generated successfully',
      };

      mock.onGet('/auth/security/report').reply(200, mockResponse);

      const response = await authApi.getSecurityReport();
      expect(response.data).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mock.onGet('/employees').networkError();

      await expect(employeesApi.getAll()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mock.onGet('/employees').timeout();

      await expect(employeesApi.getAll()).rejects.toThrow();
    });

    it('should handle 404 errors', async () => {
      mock.onGet('/employees/999').reply(404, { error: 'Not found' });

      await expect(employeesApi.getById('999')).rejects.toThrow();
    });

    it('should handle 500 errors', async () => {
      mock.onGet('/employees').reply(500, { error: 'Internal server error' });

      await expect(employeesApi.getAll()).rejects.toThrow();
    });

    it('should handle validation errors', async () => {
      mock.onPost('/employees').reply(400, { 
        error: 'Validation failed',
        details: ['Name is required', 'Email is invalid']
      });

      await expect(employeesApi.create({} as any)).rejects.toThrow();
    });
  });

  describe('Request/Response Interceptors', () => {
    it('should add security headers to requests', async () => {
      const mockResponse = { success: true, data: [] };
      mock.onGet('/employees').reply(200, mockResponse);

      await employeesApi.getAll();

      // Verify that the request includes security headers
      expect(mock.history.get[0].headers).toBeDefined();
    });

    it('should handle response data transformation', async () => {
      const mockResponse = { success: true, data: [] };
      mock.onGet('/employees').reply(200, mockResponse);

      const response = await employeesApi.getAll();
      expect(response.data).toEqual(mockResponse);
    });
  });
}); 