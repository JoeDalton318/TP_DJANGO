import { render, screen } from '@testing-library/react';
import LoginPage from '../components/LoginPage';
import TestWrapper from './TestWrapper';
import '@testing-library/jest-dom';

test('Affiche les champs de connexion', () => {
  render(
    <TestWrapper>
      <LoginPage />
    </TestWrapper>
  );

  expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  expect(screen.getByText('Se connecter')).toBeInTheDocument();
});
