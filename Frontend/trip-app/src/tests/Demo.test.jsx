// src/tests/Demo.test.jsx
import { render, screen } from '@testing-library/react';
import TestWrapper from './TestWrapper';

const Dummy = () => <div>Hello world</div>;

test('affiche Hello world', () => {
  render(
    <TestWrapper>
      <Dummy />
    </TestWrapper>
  );
  expect(screen.getByText('Hello world')).toBeInTheDocument();
});
