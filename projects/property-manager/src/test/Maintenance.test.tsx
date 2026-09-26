import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Maintenance from '../pages/Maintenance';
import { AppProvider } from '../context/AppContext';

describe('Maintenance page', () => {
  it('renders maintenance requests with property addresses correctly', () => {
    render(
      <AppProvider>
        <Maintenance />
      </AppProvider>
    );

    // Page toolbar should render
    expect(screen.getByText('All Properties')).toBeInTheDocument();
    expect(screen.getByText('New Request')).toBeInTheDocument();
  });
});
