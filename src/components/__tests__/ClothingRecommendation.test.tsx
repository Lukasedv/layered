import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClothingRecommendation } from '../ClothingRecommendation'
import type { Recommendation } from '../../types'

describe('ClothingRecommendation', () => {
  const mockRecommendation: Recommendation = {
    layers: [
      {
        type: 'base',
        item: 'Moisture-wicking shirt',
        reason: 'Keeps you dry during activity',
      },
      {
        type: 'mid',
        item: 'Lightweight fleece',
        reason: 'Additional warmth',
      },
      {
        type: 'outer',
        item: 'Windbreaker jacket',
        reason: 'Protection from wind',
      },
    ],
    accessories: ['Sunglasses', 'Light gloves', 'Sunscreen SPF 30+'],
    tips: [
      'Stay hydrated',
      'Start with wind at your back',
    ],
  }

  it('renders the heading', () => {
    render(<ClothingRecommendation recommendation={mockRecommendation} />)
    
    expect(screen.getByText('What to Wear')).toBeInTheDocument()
  })

  it('renders all clothing layers', () => {
    render(<ClothingRecommendation recommendation={mockRecommendation} />)
    
    expect(screen.getByText('Moisture-wicking shirt')).toBeInTheDocument()
    expect(screen.getByText('Lightweight fleece')).toBeInTheDocument()
    expect(screen.getByText('Windbreaker jacket')).toBeInTheDocument()
  })

  it('renders layer types', () => {
    render(<ClothingRecommendation recommendation={mockRecommendation} />)
    
    expect(screen.getByText('Base Layer')).toBeInTheDocument()
    expect(screen.getByText('Mid Layer')).toBeInTheDocument()
    expect(screen.getByText('Outer Layer')).toBeInTheDocument()
  })

  it('renders reasons for each layer', () => {
    render(<ClothingRecommendation recommendation={mockRecommendation} />)
    
    expect(screen.getByText('Keeps you dry during activity')).toBeInTheDocument()
    expect(screen.getByText('Additional warmth')).toBeInTheDocument()
    expect(screen.getByText('Protection from wind')).toBeInTheDocument()
  })

  it('renders accessories section', () => {
    render(<ClothingRecommendation recommendation={mockRecommendation} />)
    
    expect(screen.getByText('Accessories')).toBeInTheDocument()
    expect(screen.getByText('Sunglasses')).toBeInTheDocument()
    expect(screen.getByText('Light gloves')).toBeInTheDocument()
    expect(screen.getByText('Sunscreen SPF 30+')).toBeInTheDocument()
  })

  it('renders tips section', () => {
    render(<ClothingRecommendation recommendation={mockRecommendation} />)
    
    expect(screen.getByText('Tips')).toBeInTheDocument()
    expect(screen.getByText(/Stay hydrated/)).toBeInTheDocument()
    expect(screen.getByText(/Start with wind at your back/)).toBeInTheDocument()
  })

  it('does not render accessories section when empty', () => {
    const noAccessoriesRec: Recommendation = {
      ...mockRecommendation,
      accessories: [],
    }
    render(<ClothingRecommendation recommendation={noAccessoriesRec} />)
    
    expect(screen.queryByText('Accessories')).not.toBeInTheDocument()
  })

  it('does not render tips section when empty', () => {
    const noTipsRec: Recommendation = {
      ...mockRecommendation,
      tips: [],
    }
    render(<ClothingRecommendation recommendation={noTipsRec} />)
    
    expect(screen.queryByText('Tips')).not.toBeInTheDocument()
  })

  it('renders emoji icons', () => {
    render(<ClothingRecommendation recommendation={mockRecommendation} />)
    
    // Check for backpack emoji in accessories section
    expect(screen.getByText('🎒')).toBeInTheDocument()
    // Check for lightbulb emoji in tips section
    expect(screen.getByText('💡')).toBeInTheDocument()
  })

  it('renders with only base layer', () => {
    const minimalRec: Recommendation = {
      layers: [
        {
          type: 'base',
          item: 'Athletic shorts',
          reason: 'Freedom of movement',
        },
      ],
      accessories: [],
      tips: [],
    }
    render(<ClothingRecommendation recommendation={minimalRec} />)
    
    expect(screen.getByText('Athletic shorts')).toBeInTheDocument()
    expect(screen.getByText('Freedom of movement')).toBeInTheDocument()
    expect(screen.queryByText('Mid Layer')).not.toBeInTheDocument()
    expect(screen.queryByText('Outer Layer')).not.toBeInTheDocument()
  })
})
