import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginModal from '../../components/modals/LoginModal';

describe('LoginModal', () => {
  const mockOnClose = jest.fn();
  const mockOnLogin = jest.fn();
  const mockOnNotify = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('no se renderiza cuando show es false', () => {
    render(
      <LoginModal 
        show={false} 
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onNotify={mockOnNotify}
      />
    );
    expect(screen.queryByText('Iniciar Sesión')).not.toBeInTheDocument();
  });

  test('llama a onLogin con las credenciales correctas', async () => {
    render(
      <LoginModal 
        show={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onNotify={mockOnNotify}
      />
    );

    const usernameInput = screen.getByPlaceholderText('Tu nombre de usuario');
    const passwordInput = screen.getByPlaceholderText('Tu contraseña');
    const submitButton = screen.getByRole('button', { name: /entrar/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'Test123@' } });

    await waitFor(() => {
      fireEvent.submit(submitButton.closest('form'));
    });

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'Test123@'
      });
    });
  });

  test('cierra el modal cuando se hace click en Cancelar', async () => {
    render(
      <LoginModal 
        show={true}
        onClose={mockOnClose}
        onLogin={mockOnLogin}
        onNotify={mockOnNotify}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    
    await waitFor(() => {
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
