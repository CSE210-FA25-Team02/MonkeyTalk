
import { EmjIsService } from './emj-is-service.js';

global.fetch = jest.fn();

describe('EmjIsService', () => {
  let service;

  beforeEach(() => {
    service = new EmjIsService();
    fetch.mockClear();
  });

  it('should translate text to emoji successfully', async () => {
    const mockResponse = { emojiText: '👋' };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

    const result = await service.translateTextToEmoji('Hey');
    expect(result).toBe('👋');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and then succeed', async () => {
    const mockResponse = { emojiText: '👋' };
    fetch
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

    const result = await service.translateTextToEmoji('Hey');
    expect(result).toBe('👋');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw an error after all retries fail', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(service.translateTextToEmoji('Hey')).rejects.toThrow('emj.is API error: 500');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
