import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = jest.fn();

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 