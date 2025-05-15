import { fetchEventData, sendEventEmail } from '../eventService';
import { getAdminEvent } from '@/app/lib/apiClient';

// Mock the apiClient
jest.mock('@/app/lib/apiClient', () => ({
  getAdminEvent: jest.fn()
}));

describe('eventService', () => {
  const mockEventData = {
    data: {
      tickets: [
        {
          ticketId: 1,
          purchases: [
            { customerEmail: 'test1@example.com' },
            { customerEmail: 'test2@example.com' }
          ]
        },
        {
          ticketId: 2,
          purchases: [
            { customerEmail: 'test2@example.com' },
            { customerEmail: 'test3@example.com' }
          ]
        }
      ],
      title: 'Test Event',
      date: 1234567890
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock) = jest.fn();
  });

  describe('fetchEventData', () => {
    it('should fetch and transform event data successfully', async () => {
      // Mock the API response
      (getAdminEvent as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEventData)
      });

      const result = await fetchEventData(1);

      expect(result).toEqual({
        tickets: mockEventData.data.tickets,
        title: mockEventData.data.title,
        date: mockEventData.data.date,
        recipientEmails: ['test1@example.com', 'test2@example.com', 'test3@example.com']
      });

      expect(getAdminEvent).toHaveBeenCalledWith(1);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      (getAdminEvent as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: errorMessage })
      });

      await expect(fetchEventData(1)).rejects.toThrow(errorMessage);
    });

    it('should handle missing data', async () => {
      (getAdminEvent as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: null })
      });

      await expect(fetchEventData(1)).rejects.toThrow('Failed to load event data');
    });

    it('should handle network errors', async () => {
      (getAdminEvent as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(fetchEventData(1)).rejects.toThrow('Network error');
    });
  });

  describe('sendEventEmail', () => {
    const mockRecipients = ['test1@example.com', 'test2@example.com'];
    const mockSubject = 'Test Subject';
    const mockContent = 'Test Content';

    it('should send email successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      await sendEventEmail(mockRecipients, mockSubject, mockContent);

      expect(global.fetch).toHaveBeenCalledWith('/api/sendBulkEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: mockSubject,
          content: mockContent,
          type: 'specific',
          recipients: mockRecipients
        }),
      });
    });

    it('should handle email sending errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(sendEventEmail(mockRecipients, mockSubject, mockContent))
        .rejects
        .toThrow('Failed to send email');
    });

    it('should handle network errors during email sending', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(sendEventEmail(mockRecipients, mockSubject, mockContent))
        .rejects
        .toThrow('Network error');
    });
  });
}); 