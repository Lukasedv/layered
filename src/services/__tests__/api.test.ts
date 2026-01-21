import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchWeather, fetchRecommendations } from '../api'
import type { WeatherData, Activity } from '../../types'

describe('api service', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('fetchWeather', () => {
    const mockLocation = { lat: 59.9139, lon: 10.7522 }
    const mockWeatherResponse: WeatherData = {
      temperature: 15,
      feelsLike: 13,
      humidity: 70,
      windSpeed: 20,
      precipitation: 'none',
      description: 'partly cloudy',
      icon: '02d',
    }

    it('fetches weather data successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
      } as Response)

      const result = await fetchWeather(mockLocation)

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/weather?lat=${mockLocation.lat}&lon=${mockLocation.lon}`
      )
      expect(result).toEqual(mockWeatherResponse)
    })

    it('throws error when response is not ok', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      await expect(fetchWeather(mockLocation)).rejects.toThrow('Failed to fetch weather data')
    })

    it('constructs correct URL with coordinates', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockWeatherResponse,
      } as Response)

      await fetchWeather({ lat: 40.7128, lon: -74.006 })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/weather?lat=40.7128&lon=-74.006'
      )
    })
  })

  describe('fetchRecommendations', () => {
    const mockActivity: Activity = 'running'
    const mockWeather: WeatherData = {
      temperature: 15,
      feelsLike: 13,
      humidity: 70,
      windSpeed: 20,
      precipitation: 'none',
      description: 'partly cloudy',
      icon: '02d',
    }
    const mockRecommendationResponse = {
      layers: [
        { type: 'base', item: 'Running shirt', reason: 'Keep dry' },
      ],
      accessories: ['Sunglasses'],
      tips: ['Stay hydrated'],
    }

    it('fetches recommendations successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendationResponse,
      } as Response)

      const result = await fetchRecommendations(mockActivity, mockWeather)

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/recommendations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ activity: mockActivity, weather: mockWeather }),
        }
      )
      expect(result).toEqual(mockRecommendationResponse)
    })

    it('throws error when response is not ok', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response)

      await expect(fetchRecommendations(mockActivity, mockWeather)).rejects.toThrow('Failed to fetch recommendations')
    })

    it('sends activity and weather in request body', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRecommendationResponse,
      } as Response)

      await fetchRecommendations('cycling', mockWeather)

      const callArgs = vi.mocked(global.fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1]?.body as string)
      
      expect(body.activity).toBe('cycling')
      expect(body.weather).toEqual(mockWeather)
    })
  })
})
