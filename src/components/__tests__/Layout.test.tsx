import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Layout } from '../Layout'

describe('Layout', () => {
  it('renders the header with app name', () => {
    render(<Layout>Test Content</Layout>)
    
    expect(screen.getByText('Layered')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(
      <Layout>
        <div>Test Child Content</div>
      </Layout>
    )
    
    expect(screen.getByText('Test Child Content')).toBeInTheDocument()
  })

  it('has proper accessibility structure', () => {
    render(
      <Layout>
        <p>Content</p>
      </Layout>
    )
    
    // Check for header element
    expect(document.querySelector('header')).toBeInTheDocument()
    // Check for main element
    expect(document.querySelector('main')).toBeInTheDocument()
  })
})
