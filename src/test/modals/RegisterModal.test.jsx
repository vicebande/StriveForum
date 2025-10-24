import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterModal from '../../components/modals/RegisterModal';

describe('RegisterModal', () => {
  const mockOnClose = jest.fn();
  const mockOnRegister = jest.fn();
  const mockOnNotify = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('no se renderiza cuando show es false', async () => {
    await act(async () => {
      render(
        <RegisterModal 
          show={false} 
          onClose={mockOnClose}
          onRegister={mockOnRegister}
          onNotify={mockOnNotify}
        />
      );
    });
    expect(screen.queryByText('Registrarse')).not.toBeInTheDocument();
  });

  test('valida campos requeridos', async () => {
    await act(async () => {
      render(
        <RegisterModal 
          show={true}
          onClose={mockOnClose}
          onRegister={mockOnRegister}
          onNotify={mockOnNotify}
        />
      );
    });
    const submitButton = screen.getByText('Crear cuenta');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(await screen.findByText(/Usuario requerido/i)).toBeInTheDocument();
  });

  test('muestra indicador de fortaleza de contraseña', async () => {
    await act(async () => {
      render(
        <RegisterModal 
          show={true}
          onClose={mockOnClose}
          onRegister={mockOnRegister}
          onNotify={mockOnNotify}
        />
      );
    });
    const passwordInput = screen.getByPlaceholderText('Crea una contraseña segura');
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Test123@' } });
    });
    expect(screen.getByText('Fuerza:')).toBeInTheDocument();
  });

  test('valida que las contraseñas coincidan', async () => {
    await act(async () => {
      render(
        <RegisterModal 
          show={true}
          onClose={mockOnClose}
          onRegister={mockOnRegister}
          onNotify={mockOnNotify}
        />
      );
    });
    const passwordInput = screen.getByPlaceholderText('Crea una contraseña segura');
    const confirmInput = screen.getByPlaceholderText('Repite tu contraseña');
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'Test123@' } });
      fireEvent.change(confirmInput, { target: { value: 'Test123' } });
    });
    const submitButton = screen.getByText('Crear cuenta');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    expect(await screen.findByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  });
});
