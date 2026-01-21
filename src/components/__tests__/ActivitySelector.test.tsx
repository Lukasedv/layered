import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActivitySelector } from '../ActivitySelector'

describe('ActivitySelector', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('renders all activity options', () => {
    render(
      <ActivitySelector
        selectedActivity={null}
        onSelect={mockOnSelect}
      />
    )
    
    expect(screen.getByText('Running')).toBeInTheDocument()
    expect(screen.getByText('Cycling')).toBeInTheDocument()
    expect(screen.getByText('Skiing')).toBeInTheDocument()
    expect(screen.getByText('Hiking')).toBeInTheDocument()
    expect(screen.getByText('Walking')).toBeInTheDocument()
  })

  it('renders activity icons', () => {
    render(
      <ActivitySelector
        selectedActivity={null}
        onSelect={mockOnSelect}
      />
    )
    
    expect(screen.getByText('🏃')).toBeInTheDocument()
    expect(screen.getByText('🚴')).toBeInTheDocument()
    expect(screen.getByText('⛷️')).toBeInTheDocument()
    expect(screen.getByText('🥾')).toBeInTheDocument()
    expect(screen.getByText('🚶')).toBeInTheDocument()
  })

  it('calls onSelect when an activity is clicked', () => {
    render(
      <ActivitySelector
        selectedActivity={null}
        onSelect={mockOnSelect}
      />
    )
    
    fireEvent.click(screen.getByText('Running'))
    expect(mockOnSelect).toHaveBeenCalledWith('running')
    
    fireEvent.click(screen.getByText('Cycling'))
    expect(mockOnSelect).toHaveBeenCalledWith('cycling')
  })

  it('highlights the selected activity', () => {
    render(
      <ActivitySelector
        selectedActivity="running"
        onSelect={mockOnSelect}
      />
    )
    
    const runningButton = screen.getByRole('button', { name: /Running/i })
    expect(runningButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('disables buttons when disabled prop is true', () => {
    render(
      <ActivitySelector
        selectedActivity={null}
        onSelect={mockOnSelect}
        disabled={true}
      />
    )
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toBeDisabled()
    })
  })

  it('does not call onSelect when disabled', () => {
    render(
      <ActivitySelector
        selectedActivity={null}
        onSelect={mockOnSelect}
        disabled={true}
      />
    )
    
    const button = screen.getByText('Running').closest('button')
    if (button) {
      fireEvent.click(button)
    }
    
    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('shows correct heading', () => {
    render(
      <ActivitySelector
        selectedActivity={null}
        onSelect={mockOnSelect}
      />
    )
    
    expect(screen.getByText('Choose your activity')).toBeInTheDocument()
  })
})
