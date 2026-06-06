import {
  fetchContentfulPhotos,
  fetchEventData,
  generateEventMarketingAIDraft,
  generateEventMarketingAIDraftWithContext,
  getEventMarketingRecipientStats,
  previewEventMarketingEmail,
  sendEventEmail,
  sendEventMarketingCampaign,
  sendEventMarketingTestEmail,
} from '../eventService';
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

  describe('event marketing email helpers', () => {
    const marketingPayload = {
      eventId: 14,
      subject: 'Special Event',
      content: '<p>Join us!</p>',
      signOff: 'Best,',
      tiktokLinks: ['https://www.tiktok.com/@sirkinsupper.club/video/123'],
      selectedPhotos: [{ title: 'Dish', url: 'https://images.test/dish.jpg' }],
    };

    it('loads marketing recipient stats', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            recipientCount: 42,
            stats: {
              totalSubscribed: 225,
              excludedWithEventTickets: 183,
              sendCount: 42,
              audience: 'exclude_event_ticket_holders',
            },
          }),
      });

      const stats = await getEventMarketingRecipientStats(14, 'exclude_event_ticket_holders');
      expect(stats.sendCount).toBe(42);
      expect(stats.totalSubscribed).toBe(225);
      expect(global.fetch).toHaveBeenCalledWith('/api/eventMarketingEmail', expect.objectContaining({
        method: 'POST',
      }));
    });

    it('returns marketing preview response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ html: '<div>Preview</div>', recipientCount: 5 }),
      });

      const result = await previewEventMarketingEmail(marketingPayload);
      expect(result).toEqual({ html: '<div>Preview</div>', recipientCount: 5 });
    });

    it('sends test marketing email', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'ok' }),
      });

      await sendEventMarketingTestEmail(marketingPayload);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('sends marketing campaign', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            message: 'sent',
            recipientCount: 225,
            batchesSent: 1,
            stats: {
              totalSubscribed: 225,
              excludedWithEventTickets: 10,
              sendCount: 225,
              audience: 'all_subscribed',
            },
          }),
      });

      const response = await sendEventMarketingCampaign({
        ...marketingPayload,
        audience: 'all_subscribed',
      });
      expect(response.recipientCount).toBe(225);
      expect(response.batchesSent).toBe(1);
    });

    it('loads AI draft', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            subject: 'Generated Subject',
            content: '<p>Generated</p>',
            usedFallback: false,
          }),
      });

      const draft = await generateEventMarketingAIDraft(14);
      expect(draft.subject).toBe('Generated Subject');
      expect(global.fetch).toHaveBeenCalledWith('/api/eventMarketingEmail/aiDraft', expect.objectContaining({
        method: 'POST',
      }));
    });

    it('loads AI draft with campaign notes', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            subject: 'Generated Subject',
            content: '<p>Generated</p>',
            usedFallback: false,
          }),
      });

      await generateEventMarketingAIDraftWithContext({
        eventId: 14,
        generationNotes: 'Focus on couples and mention only 10 seats left.',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/eventMarketingEmail/aiDraft',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            eventId: 14,
            generationNotes: 'Focus on couples and mention only 10 seats left.',
          }),
        })
      );
    });

    it('loads Contentful photos', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            photos: [{ title: 'Pic', url: 'https://images.test/pic.jpg' }],
          }),
      });

      const photos = await fetchContentfulPhotos();
      expect(photos).toEqual([{ title: 'Pic', url: 'https://images.test/pic.jpg' }]);
    });
  });
}); 