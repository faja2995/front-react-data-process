import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.tsx';
import '@testing-library/jest-dom';

test('check Renders the main page successfully', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
  expect(true).toBeTruthy();
});
