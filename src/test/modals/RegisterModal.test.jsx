import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterModal from '../../components/modals/RegisterModal';

describe('RegisterModal', () => {
  const mockOnClose = jest.fn();
  const mockOnRegister = jest.fn();
  const mockOnNotify = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('no se renderiza cuando show es false', () => {
    render(
      <RegisterModal 
        show={false} 
        onClose={mockOnClose}
        onRegister={mockOnRegister}
        onNotify={mockOnNotify}
      />
    );
    expect(screen.queryByText('Registrarse')).not.toBeInTheDocument();
  });

  test('valida campos requeridos', async () => {
    render(
      <RegisterModal 
        show={true}
        onClose={mockOnClose}
        onRegister={mockOnRegister}
        onNotify={mockOnNotify}
      />
    );

    const submitButton = screen.getByText('Crear cuenta');
    await waitFor(() => {
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText(/Usuario requerido/i)).toBeInTheDocument();
  });

  test('muestra indicador de fortaleza de contraseña', () => {
    render(
      <RegisterModal 
        show={true}
        onClose={mockOnClose}
        onRegister={mockOnRegister}
        onNotify={mockOnNotify}
      />
    );

    const passwordInput = screen.getByPlaceholderText('Crea una contraseña segura');
    fireEvent.change(passwordInput, { target: { value: 'Test123@' } });

    expect(screen.getByText('Fuerza:')).toBeInTheDocument();
  });

  test('valida que las contraseñas coincidan', async () => {
    render(
      <RegisterModal 
        show={true}
        onClose={mockOnClose}
        onRegister={mockOnRegister}
        onNotify={mockOnNotify}
      />
    );

    const passwordInput = screen.getByPlaceholderText('Crea una contraseña segura');
    const confirmInput = screen.getByPlaceholderText('Repite tu contraseña');

    fireEvent.change(passwordInput, { target: { value: 'Test123@' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123' } });

    const submitButton = screen.getByText('Crear cuenta');
    fireEvent.click(submitButton);

    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });
});
