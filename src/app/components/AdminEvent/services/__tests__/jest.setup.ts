import '@testing-library/jest-dom';
import { clearAdminDataCache } from '@/app/admin/adminDataCache';

// Mock fetch globally
global.fetch = jest.fn();

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  clearAdminDataCache();
}); 