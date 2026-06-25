import fc from 'fast-check';
import MockAdapter from 'axios-mock-adapter';
import api from '../api';

describe('API Client - Property-Based Tests', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(api);
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  describe('Property 1: Authorization Header Attachment', () => {
    // Feature: backend-frontend-integration, Property 1: Authorization Header Attachment
    // **Validates: Requirements 1.2, 16.1**
    test('should attach Bearer token for any authenticated request', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }), // access token
          fc.constantFrom('get', 'post', 'put', 'delete'), // HTTP method
          fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9-]/g, 'a')), // endpoint path
          async (accessToken, method, endpoint) => {
            // Setup
            localStorage.getItem.mockReturnValue(accessToken);
            
            const mockHandler = (config) => {
              // Verify Authorization header format
              expect(config.headers.Authorization).toBe(`Bearer ${accessToken}`);
              return [200, { success: true }];
            };

            // Mock the appropriate method
            switch (method) {
              case 'get':
                mock.onGet(`/${endpoint}`).reply(mockHandler);
                break;
              case 'post':
                mock.onPost(`/${endpoint}`).reply(mockHandler);
                break;
              case 'put':
                mock.onPut(`/${endpoint}`).reply(mockHandler);
                break;
              case 'delete':
                mock.onDelete(`/${endpoint}`).reply(mockHandler);
                break;
            }

            // Execute request
            await api[method](`/${endpoint}`, method !== 'get' ? {} : undefined);
            
            // Cleanup
            mock.reset();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 18: Error Response Format Consistency', () => {
    // Feature: backend-frontend-integration, Property 18: Error Response Format Consistency
    // **Validates: Requirements 16.3**
    test('should transform any 4xx error into consistent format', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 400, max: 404 }), // HTTP status code (limited range for testing)
          fc.string({ minLength: 5, maxLength: 100 }), // error message
          async (statusCode, errorMessage) => {
            mock.onGet('/test-error').reply(statusCode, { error: errorMessage });

            try {
              await api.get('/test-error');
              fail('Should have thrown an error');
            } catch (error) {
              // Verify consistent error format
              expect(error).toHaveProperty('message');
              expect(error).toHaveProperty('status');
              expect(error).toHaveProperty('code');
              expect(error.status).toBe(statusCode);
              expect(typeof error.message).toBe('string');
              expect(typeof error.code).toBe('string');
            }

            mock.reset();
          }
        ),
        { numRuns: 20 }
      );
    });

    test('should transform 5xx errors into consistent format with generic message', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(500, 502, 503),
          async (statusCode) => {
            mock.onGet('/test-server-error').reply(statusCode, {});

            try {
              await api.get('/test-server-error');
              fail('Should have thrown an error');
            } catch (error) {
              expect(error).toHaveProperty('message');
              expect(error).toHaveProperty('status');
              expect(error).toHaveProperty('code');
              expect(error.status).toBe(statusCode);
              expect(error.message).toBe('Something went wrong. Please try again later.');
              expect(error.code).toBe('SERVER_ERROR');
            }

            mock.reset();
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Property 19: Success Response Format Consistency', () => {
    // Feature: backend-frontend-integration, Property 19: Success Response Format Consistency
    // **Validates: Requirements 16.4**
    test('should extract and return data for any successful 2xx response', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(200, 201, 204), // Success status codes
          fc.record({
            success: fc.boolean(),
            data: fc.array(fc.string()),
          }), // Response data
          async (statusCode, responseData) => {
            mock.onGet('/test-success').reply(statusCode, responseData);

            const result = await api.get('/test-success');
            
            // Verify data is extracted and returned directly
            expect(result).toEqual(responseData);
            
            mock.reset();
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Property: Request Parameters Preservation', () => {
    test('should preserve query parameters for any GET request', () => {
      fc.assert(
        fc.property(
          fc.record({
            page: fc.integer({ min: 1, max: 100 }),
            limit: fc.integer({ min: 1, max: 100 }),
          }),
          async (queryParams) => {
            mock.onGet('/test-params').reply((config) => {
              expect(config.params).toEqual(queryParams);
              return [200, { success: true }];
            });

            await api.get('/test-params', { params: queryParams });
            mock.reset();
          }
        ),
        { numRuns: 30 }
      );
    });

    test('should preserve request body for any POST request', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }),
            value: fc.integer(),
            active: fc.boolean(),
          }),
          async (postData) => {
            mock.onPost('/test-body').reply((config) => {
              expect(JSON.parse(config.data)).toEqual(postData);
              return [200, { success: true }];
            });

            await api.post('/test-body', postData);
            mock.reset();
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Property: Network Error Handling', () => {
    test('should return consistent error for network failures', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9-]/g, 'a')),
          async (endpoint) => {
            mock.onGet(`/${endpoint}`).networkError();

            try {
              await api.get(`/${endpoint}`);
              fail('Should have thrown an error');
            } catch (error) {
              expect(error).toMatchObject({
                message: 'Connection failed. Please check your internet connection.',
                code: 'NETWORK_ERROR',
                status: 0,
              });
            }

            mock.reset();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  describe('Property: Token Format Validation', () => {
    test('should work with JWT-like tokens', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 10, maxLength: 50 }),
            fc.string({ minLength: 10, maxLength: 100 }),
            fc.string({ minLength: 10, maxLength: 50 })
          ).map(([header, payload, signature]) => `${header}.${payload}.${signature}`),
          async (jwtToken) => {
            localStorage.getItem.mockReturnValue(jwtToken);

            mock.onGet('/test').reply((config) => {
              expect(config.headers.Authorization).toBe(`Bearer ${jwtToken}`);
              return [200, { success: true }];
            });

            await api.get('/test');
            mock.reset();
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});
