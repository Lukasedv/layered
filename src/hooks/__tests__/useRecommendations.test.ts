import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecommendations } from '../useRecommendations'
import * as api from '../../services/api'
import type { WeatherData, Activity, Recommendation } from '../../types'

vi.mock('../../services/api')

describe('useRecommendations', () => {
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
  const mockRecommendation: Recommendation = {
    layers: [
      { type: 'base', item: 'Running shirt', reason: 'Keep dry' },
    ],
    accessories: ['Sunglasses'],
    tips: ['Stay hydrated'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns initial state with null recommendation', () => {
    const { result } = renderHook(() => useRecommendations())
    
    expect(result.current.recommendation).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches recommendation when getRecommendation is called', async () => {
    vi.mocked(api.fetchRecommendations).mockResolvedValueOnce(mockRecommendation)

    const { result } = renderHook(() => useRecommendations())
    
    // Call getRecommendation wrapped in act
    await act(async () => {
      await result.current.getRecommendation(mockActivity, mockWeather)
    })

    expect(result.current.recommendation).toEqual(mockRecommendation)
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(api.fetchRecommendations).toHaveBeenCalledWith(mockActivity, mockWeather)
  })

  it('sets loading state while fetching', async () => {
    let resolvePromise: (value: Recommendation) => void
    vi.mocked(api.fetchRecommendations).mockImplementationOnce(() => 
      new Promise(resolve => { resolvePromise = resolve })
    )

    const { result } = renderHook(() => useRecommendations())
    
    // Start the fetch without awaiting
    act(() => {
      result.current.getRecommendation(mockActivity, mockWeather)
    })
    
    // Should be loading
    expect(result.current.loading).toBe(true)

    // Resolve the promise
    await act(async () => {
      resolvePromise!(mockRecommendation)
      // Small delay to let the promise resolution propagate
      await new Promise(r => setTimeout(r, 0))
    })

    expect(result.current.loading).toBe(false)
  })

  it('sets error when fetch fails', async () => {
    const errorMessage = 'Failed to get recommendations'
    vi.mocked(api.fetchRecommendations).mockRejectedValueOnce(new Error(errorMessage))

    const { result } = renderHook(() => useRecommendations())
    
    await act(async () => {
      await result.current.getRecommendation(mockActivity, mockWeather)
    })

    expect(result.current.recommendation).toBeNull()
    expect(result.current.error).toBe(errorMessage)
    expect(result.current.loading).toBe(false)
  })

  it('clears error on new fetch', async () => {
    vi.mocked(api.fetchRecommendations)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce(mockRecommendation)

    const { result } = renderHook(() => useRecommendations())
    
    // First call - should error
    await act(async () => {
      await result.current.getRecommendation(mockActivity, mockWeather)
    })
    expect(result.current.error).toBe('First error')

    // Second call - should succeed and clear error
    await act(async () => {
      await result.current.getRecommendation(mockActivity, mockWeather)
    })
    
    expect(result.current.error).toBeNull()
    expect(result.current.recommendation).toEqual(mockRecommendation)
  })

  it('provides stable getRecommendation function reference', async () => {
    const { result, rerender } = renderHook(() => useRecommendations())
    
    const firstRef = result.current.getRecommendation
    
    rerender()
    
    expect(result.current.getRecommendation).toBe(firstRef)
  })
})
