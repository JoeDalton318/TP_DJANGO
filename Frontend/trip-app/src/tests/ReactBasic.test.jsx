/// <reference types="vitest" />
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React, { useState } from 'react';

const DemoComponent = () => {
  const [count] = useState(1);
  return <div>Count: {count}</div>;
};

test('Render React useState works', () => {
  render(<DemoComponent />);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
