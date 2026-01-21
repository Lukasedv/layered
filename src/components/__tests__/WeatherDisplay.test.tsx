import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeatherDisplay } from '../WeatherDisplay'
import type { WeatherData } from '../../types'

describe('WeatherDisplay', () => {
  const mockWeather: WeatherData = {
    temperature: 18,
    feelsLike: 16,
    humidity: 65,
    windSpeed: 12,
    precipitation: 'none',
    description: 'clear sky',
    icon: '01d',
  }

  it('renders temperature', () => {
    render(<WeatherDisplay weather={mockWeather} />)
    
    expect(screen.getByText('18°')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('renders feels like temperature', () => {
    render(<WeatherDisplay weather={mockWeather} />)
    
    expect(screen.getByText('Feels like 16°')).toBeInTheDocument()
  })

  it('renders weather description', () => {
    render(<WeatherDisplay weather={mockWeather} />)
    
    expect(screen.getByText('clear sky')).toBeInTheDocument()
  })

  it('renders wind speed', () => {
    render(<WeatherDisplay weather={mockWeather} />)
    
    expect(screen.getByText('12 km/h')).toBeInTheDocument()
    expect(screen.getByText('Wind')).toBeInTheDocument()
  })

  it('renders humidity', () => {
    render(<WeatherDisplay weather={mockWeather} />)
    
    expect(screen.getByText('65%')).toBeInTheDocument()
    expect(screen.getByText('Humidity')).toBeInTheDocument()
  })

  it('renders precipitation status', () => {
    render(<WeatherDisplay weather={mockWeather} />)
    
    expect(screen.getByText('none')).toBeInTheDocument()
    expect(screen.getByText('Precipitation')).toBeInTheDocument()
  })

  it('displays correct weather emoji for sunny day', () => {
    render(<WeatherDisplay weather={mockWeather} />)
    
    expect(screen.getByText('☀️')).toBeInTheDocument()
  })

  it('displays correct weather emoji for rainy conditions', () => {
    const rainyWeather: WeatherData = {
      ...mockWeather,
      icon: '10d',
      precipitation: 'rain',
    }
    render(<WeatherDisplay weather={rainyWeather} />)
    
    expect(screen.getByText('🌦️')).toBeInTheDocument()
  })

  it('displays correct weather emoji for night', () => {
    const nightWeather: WeatherData = {
      ...mockWeather,
      icon: '01n',
    }
    render(<WeatherDisplay weather={nightWeather} />)
    
    expect(screen.getByText('🌙')).toBeInTheDocument()
  })

  it('displays correct weather emoji for snow', () => {
    const snowWeather: WeatherData = {
      ...mockWeather,
      icon: '13d',
      precipitation: 'snow',
    }
    render(<WeatherDisplay weather={snowWeather} />)
    
    expect(screen.getByText('🌨️')).toBeInTheDocument()
  })

  it('rounds temperature values', () => {
    const weatherWithDecimals: WeatherData = {
      ...mockWeather,
      temperature: 18.7,
      feelsLike: 16.2,
    }
    render(<WeatherDisplay weather={weatherWithDecimals} />)
    
    expect(screen.getByText('19°')).toBeInTheDocument()
    expect(screen.getByText('Feels like 16°')).toBeInTheDocument()
  })

  it('displays Current Weather label', () => {
    render(<WeatherDisplay weather={mockWeather} />)
    
    expect(screen.getByText('Current Weather')).toBeInTheDocument()
  })
})
