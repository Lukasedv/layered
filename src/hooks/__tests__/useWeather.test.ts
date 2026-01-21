import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWeather } from '../useWeather'
import * as api from '../../services/api'
import type { WeatherData, Location } from '../../types'

vi.mock('../../services/api')

describe('useWeather', () => {
  const mockLocation: Location = { lat: 59.9139, lon: 10.7522 }
  const mockWeatherData: WeatherData = {
    temperature: 15,
    feelsLike: 13,
    humidity: 70,
    windSpeed: 20,
    precipitation: 'none',
    description: 'partly cloudy',
    icon: '02d',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns initial state with null values', () => {
    const { result } = renderHook(() => useWeather(null))
    
    expect(result.current.weather).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches weather when location is provided', async () => {
    vi.mocked(api.fetchWeather).mockResolvedValueOnce(mockWeatherData)

    const { result } = renderHook(() => useWeather(mockLocation))

    // Should be loading initially
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.weather).toEqual(mockWeatherData)
    expect(result.current.error).toBeNull()
    expect(api.fetchWeather).toHaveBeenCalledWith(mockLocation)
  })

  it('sets error when fetch fails', async () => {
    const errorMessage = 'Network error'
    vi.mocked(api.fetchWeather).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useWeather(mockLocation))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.weather).toBeNull()
    expect(result.current.error).toBe(errorMessage)
  })

  it('does not fetch when location is null', async () => {
    const { result } = renderHook(() => useWeather(null))
    
    // Wait a bit to ensure no fetch is made
    await new Promise(resolve => setTimeout(resolve, 100))
    
    expect(api.fetchWeather).not.toHaveBeenCalled()
    expect(result.current.loading).toBe(false)
  })

  it('refetches when location changes', async () => {
    const newLocation: Location = { lat: 40.7128, lon: -74.006 }
    const newWeatherData: WeatherData = {
      ...mockWeatherData,
      temperature: 22,
    }

    vi.mocked(api.fetchWeather)
      .mockResolvedValueOnce(mockWeatherData)
      .mockResolvedValueOnce(newWeatherData)

    const { result, rerender } = renderHook(
      ({ location }) => useWeather(location),
      { initialProps: { location: mockLocation } }
    )

    await waitFor(() => {
      expect(result.current.weather).toEqual(mockWeatherData)
    })

    rerender({ location: newLocation })

    await waitFor(() => {
      expect(result.current.weather).toEqual(newWeatherData)
    })

    expect(api.fetchWeather).toHaveBeenCalledTimes(2)
    expect(api.fetchWeather).toHaveBeenLastCalledWith(newLocation)
  })

  it('provides refetch function', async () => {
    vi.mocked(api.fetchWeather).mockResolvedValue(mockWeatherData)

    const { result } = renderHook(() => useWeather(mockLocation))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.refetch).toBeDefined()
    expect(typeof result.current.refetch).toBe('function')
  })
})
