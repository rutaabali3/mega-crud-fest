import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopBar } from '../components/TopBar';

describe('TopBar', () => {
  it('renders correctly with accessible aria-label on toggle button', () => {
    const handleLogSession = vi.fn();
    const handleToggleSidebar = vi.fn();

    render(
      <TopBar
        title="Dashboard"
        onLogSession={handleLogSession}
        onToggleSidebar={handleToggleSidebar}
        sidebarOpen={true}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
    expect(toggleButton).toBeInTheDocument();
  });
});
