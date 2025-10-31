import { render, screen } from '@testing-library/react';
import App from '../App';
import TestWrapper from './TestWrapper';
import '@testing-library/jest-dom';

test('affiche le titre Bienvenue et le bouton Se connecter', () => {
  render(
    <TestWrapper>
      <App />
    </TestWrapper>
  );

  expect(screen.getByText('Bienvenue')).toBeInTheDocument();
  expect(screen.getByText('Se connecter')).toBeInTheDocument();
});
