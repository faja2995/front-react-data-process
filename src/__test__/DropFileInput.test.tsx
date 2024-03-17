import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom'; // Import MemoryRouter
import DropFileInput from '../components/DropFileInput/DropFileInput.tsx';

describe('DropFileInput', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <DropFileInput />
      </MemoryRouter>,
    );
    expect(true).toBeTruthy();
  });

  it('displays "Drag & Drop your files here"', () => {
    const { getByText } = render(
      <MemoryRouter>
        <DropFileInput />
      </MemoryRouter>,
    );
    expect(getByText(/Ready to accept CSV files/i)).toBeInTheDocument();
  });
});
