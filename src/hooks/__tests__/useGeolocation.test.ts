import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGeolocation } from '../useGeolocation'

describe('useGeolocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns initial state with null location', () => {
    const { result } = renderHook(() => useGeolocation())
    
    expect(result.current.location).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets loading state when getLocation is called', () => {
    mockGeolocation.getCurrentPosition.mockImplementation(() => {
      // Simulate async behavior - don't call callback yet
    })

    const { result } = renderHook(() => useGeolocation())
    
    act(() => {
      result.current.getLocation()
    })
    
    expect(result.current.loading).toBe(true)
  })

  it('sets location on successful geolocation', () => {
    const mockPosition = {
      coords: {
        latitude: 59.9139,
        longitude: 10.7522,
      },
    }

    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success(mockPosition)
    })

    const { result } = renderHook(() => useGeolocation())
    
    act(() => {
      result.current.getLocation()
    })
    
    expect(result.current.location).toEqual({
      lat: 59.9139,
      lon: 10.7522,
    })
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('sets error when permission is denied', () => {
    const mockError = {
      code: 1, // PERMISSION_DENIED
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(mockError)
    })

    const { result } = renderHook(() => useGeolocation())
    
    act(() => {
      result.current.getLocation()
    })
    
    expect(result.current.location).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Location permission denied. Please enable location access.')
  })

  it('sets error when position is unavailable', () => {
    const mockError = {
      code: 2, // POSITION_UNAVAILABLE
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(mockError)
    })

    const { result } = renderHook(() => useGeolocation())
    
    act(() => {
      result.current.getLocation()
    })
    
    expect(result.current.error).toBe('Location information unavailable')
  })

  it('sets error when request times out', () => {
    const mockError = {
      code: 3, // TIMEOUT
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
      error(mockError)
    })

    const { result } = renderHook(() => useGeolocation())
    
    act(() => {
      result.current.getLocation()
    })
    
    expect(result.current.error).toBe('Location request timed out')
  })

  it('sets error when geolocation is not supported', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const { result } = renderHook(() => useGeolocation())
    
    act(() => {
      result.current.getLocation()
    })
    
    expect(result.current.error).toBe('Geolocation is not supported by your browser')
  })

  it('provides stable getLocation function reference', () => {
    const { result, rerender } = renderHook(() => useGeolocation())
    
    const firstRef = result.current.getLocation
    
    rerender()
    
    expect(result.current.getLocation).toBe(firstRef)
  })

  it('clears error state when starting new location request', () => {
    const mockError = {
      code: 1,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    // First call fails
    mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) => {
      error(mockError)
    })

    const { result } = renderHook(() => useGeolocation())
    
    act(() => {
      result.current.getLocation()
    })
    
    expect(result.current.error).not.toBeNull()

    // Second call starts - error should be cleared
    mockGeolocation.getCurrentPosition.mockImplementationOnce(() => {
      // Don't resolve yet
    })

    act(() => {
      result.current.getLocation()
    })
    
    expect(result.current.error).toBeNull()
    expect(result.current.loading).toBe(true)
  })
})
