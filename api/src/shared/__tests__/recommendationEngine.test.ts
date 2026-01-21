import { describe, it, expect } from 'vitest'
import { getRecommendation } from '../recommendationEngine'
import type { WeatherData, Activity } from '../types'

describe('recommendationEngine', () => {
  describe('getRecommendation', () => {
    // Helper to create weather data
    const createWeather = (overrides: Partial<WeatherData> = {}): WeatherData => ({
      temperature: 15,
      feelsLike: 15,
      humidity: 50,
      windSpeed: 10,
      precipitation: 'none',
      description: 'clear sky',
      icon: '01d',
      ...overrides,
    })

    describe('base layer recommendations', () => {
      it('recommends heavy base layer for extreme cold', () => {
        const weather = createWeather({ temperature: -15, feelsLike: -20 })
        const result = getRecommendation('running', weather)
        
        expect(result.layers).toBeDefined()
        expect(result.layers.some(l => l.type === 'base' && l.item.toLowerCase().includes('merino'))).toBe(true)
      })

      it('recommends thermal base layer for cold conditions', () => {
        const weather = createWeather({ temperature: 0, feelsLike: -2 })
        const result = getRecommendation('walking', weather)
        
        expect(result.layers.some(l => l.type === 'base' && l.item.toLowerCase().includes('thermal'))).toBe(true)
      })

      it('recommends light breathable clothing for warm conditions', () => {
        const weather = createWeather({ temperature: 28, feelsLike: 30 })
        const result = getRecommendation('running', weather)
        
        expect(result.layers.some(l => l.type === 'base' && (
          l.item.toLowerCase().includes('lightweight') || 
          l.item.toLowerCase().includes('mesh')
        ))).toBe(true)
      })
    })

    describe('mid layer recommendations', () => {
      it('recommends insulated mid layer for freezing temperatures', () => {
        const weather = createWeather({ temperature: -5, feelsLike: -10 })
        const result = getRecommendation('hiking', weather)
        
        expect(result.layers.some(l => l.type === 'mid')).toBe(true)
      })

      it('does not recommend mid layer in warm weather', () => {
        const weather = createWeather({ temperature: 25, feelsLike: 26 })
        const result = getRecommendation('walking', weather)
        
        expect(result.layers.some(l => l.type === 'mid')).toBe(false)
      })
    })

    describe('outer layer recommendations', () => {
      it('recommends rain jacket for rainy conditions', () => {
        const weather = createWeather({ precipitation: 'rain' })
        const result = getRecommendation('hiking', weather)
        
        expect(result.layers.some(l => l.type === 'outer' && (
          l.item.toLowerCase().includes('rain') ||
          l.item.toLowerCase().includes('waterproof')
        ))).toBe(true)
      })

      it('recommends snow gear for snowy conditions', () => {
        const weather = createWeather({ precipitation: 'snow', temperature: -5, feelsLike: -8 })
        const result = getRecommendation('skiing', weather)
        
        expect(result.layers.some(l => l.type === 'outer' && (
          l.item.toLowerCase().includes('ski') ||
          l.item.toLowerCase().includes('waterproof')
        ))).toBe(true)
      })

      it('recommends windbreaker for strong winds', () => {
        const weather = createWeather({ windSpeed: 35 })
        const result = getRecommendation('cycling', weather)
        
        expect(result.layers.some(l => l.type === 'outer' && l.item.toLowerCase().includes('wind'))).toBe(true)
      })
    })

    describe('activity-specific recommendations', () => {
      const activities: Activity[] = ['running', 'cycling', 'skiing', 'hiking', 'walking']

      activities.forEach(activity => {
        it(`returns valid recommendation for ${activity}`, () => {
          const weather = createWeather()
          const result = getRecommendation(activity, weather)
          
          expect(result).toBeDefined()
          expect(result.layers).toBeInstanceOf(Array)
          expect(result.layers.length).toBeGreaterThan(0)
          expect(result.accessories).toBeInstanceOf(Array)
          expect(result.tips).toBeInstanceOf(Array)
        })
      })

      it('recommends cycling-specific gear for cycling', () => {
        const weather = createWeather({ temperature: 8, feelsLike: 6, windSpeed: 20 })
        const result = getRecommendation('cycling', weather)
        
        expect(result.layers.some(l => l.item.toLowerCase().includes('cycling'))).toBe(true)
      })

      it('recommends ski-specific gear for skiing', () => {
        const weather = createWeather({ temperature: -5, feelsLike: -10, precipitation: 'snow' })
        const result = getRecommendation('skiing', weather)
        
        expect(result.layers.some(l => l.item.toLowerCase().includes('ski'))).toBe(true)
      })
    })

    describe('accessories', () => {
      it('recommends warm head protection in cold weather', () => {
        const weather = createWeather({ temperature: -5, feelsLike: -10 })
        const result = getRecommendation('running', weather)
        
        expect(result.accessories.some(a => 
          a.toLowerCase().includes('beanie') || 
          a.toLowerCase().includes('balaclava') ||
          a.toLowerCase().includes('ear')
        )).toBe(true)
      })

      it('recommends gloves in cold weather', () => {
        const weather = createWeather({ temperature: 0, feelsLike: -3 })
        const result = getRecommendation('hiking', weather)
        
        expect(result.accessories.some(a => a.toLowerCase().includes('glove'))).toBe(true)
      })

      it('recommends sunscreen for daytime activities', () => {
        const weather = createWeather({ icon: '01d', temperature: 20, feelsLike: 20 })
        const result = getRecommendation('running', weather)
        
        expect(result.accessories.some(a => a.toLowerCase().includes('sunscreen'))).toBe(true)
      })

      it('recommends reflective gear for night activities', () => {
        const weather = createWeather({ icon: '01n' })
        const result = getRecommendation('running', weather)
        
        expect(result.accessories.some(a => a.toLowerCase().includes('reflective'))).toBe(true)
      })

      it('recommends helmet for skiing', () => {
        const weather = createWeather({ temperature: -5, feelsLike: -10 })
        const result = getRecommendation('skiing', weather)
        
        expect(result.accessories.some(a => a.toLowerCase().includes('helmet'))).toBe(true)
      })

      it('recommends goggles for skiing', () => {
        const weather = createWeather({ temperature: -5, feelsLike: -10 })
        const result = getRecommendation('skiing', weather)
        
        expect(result.accessories.some(a => a.toLowerCase().includes('goggles'))).toBe(true)
      })
    })

    describe('tips', () => {
      it('provides hydration tips for hot weather', () => {
        const weather = createWeather({ temperature: 30, feelsLike: 32 })
        const result = getRecommendation('running', weather)
        
        expect(result.tips.some(t => t.toLowerCase().includes('hydrat'))).toBe(true)
      })

      it('provides tips for rain', () => {
        const weather = createWeather({ precipitation: 'rain' })
        const result = getRecommendation('cycling', weather)
        
        expect(result.tips.some(t => 
          t.toLowerCase().includes('wet') || 
          t.toLowerCase().includes('water') ||
          t.toLowerCase().includes('rain')
        )).toBe(true)
      })

      it('provides warm-up tips for cold weather', () => {
        const weather = createWeather({ temperature: -5, feelsLike: -10 })
        const result = getRecommendation('running', weather)
        
        expect(result.tips.some(t => t.toLowerCase().includes('warm'))).toBe(true)
      })

      it('limits tips to a reasonable number', () => {
        const weather = createWeather()
        const result = getRecommendation('hiking', weather)
        
        expect(result.tips.length).toBeLessThanOrEqual(4)
      })
    })

    describe('wind chill effect', () => {
      it('adjusts recommendations for high wind speeds', () => {
        const calmWeather = createWeather({ temperature: 10, feelsLike: 10, windSpeed: 5 })
        const windyWeather = createWeather({ temperature: 10, feelsLike: 10, windSpeed: 30 })
        
        const calmResult = getRecommendation('walking', calmWeather)
        const windyResult = getRecommendation('walking', windyWeather)
        
        // Windy conditions should have more layers or outer layer
        const windyHasOuter = windyResult.layers.some(l => l.type === 'outer')
        
        expect(windyHasOuter || windyResult.layers.length >= calmResult.layers.length).toBe(true)
      })
    })

    describe('humidity effects', () => {
      it('accounts for high humidity in warm weather', () => {
        const weather = createWeather({ 
          temperature: 25, 
          feelsLike: 27, 
          humidity: 85 
        })
        const result = getRecommendation('running', weather)
        
        // Should mention humidity in tips
        expect(result.tips.some(t => t.toLowerCase().includes('humidity'))).toBe(true)
      })
    })
  })
})
