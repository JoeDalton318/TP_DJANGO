import { render, screen, fireEvent } from '@testing-library/react';
import LandingPage from '../components/LandingPage';
import TestWrapper from './TestWrapper';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../api/auth', () => ({
  login: vi.fn(() => Promise.resolve({ access: 'fake-token', refresh: 'fake-refresh' })),
}));

vi.mock('../api/profile', () => ({
  selectProfile: vi.fn(() => Promise.resolve({ profile_type: 'tourist', selected_country: 'France' })),
}));

test('Connexion et sélection de profil fonctionne', async () => {
  render(
    <TestWrapper>
      <LandingPage />
    </TestWrapper>
  );

  expect(screen.getByText('Bienvenue')).toBeInTheDocument();
});
