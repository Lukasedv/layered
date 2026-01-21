import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    render(<LoadingSpinner message="Getting your location..." />)
    
    expect(screen.getByText('Getting your location...')).toBeInTheDocument()
  })

  it('renders spinning element', () => {
    const { container } = render(<LoadingSpinner />)
    
    // Check for the spinner element with animate-spin class
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })
})
