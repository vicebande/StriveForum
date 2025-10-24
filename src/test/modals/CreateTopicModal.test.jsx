import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateTopicModal from '../../components/modals/CreateTopicModal';

describe('CreateTopicModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreateTopic = jest.fn();
  const mockOnNotify = jest.fn();
  const mockUser = { username: 'testuser' };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('sf_auth_session', JSON.stringify({ user: mockUser }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('no se renderiza cuando show es false', async () => {
    await act(async () => {
      render(
        <CreateTopicModal 
          show={false} 
          onClose={mockOnClose}
          onCreateTopic={mockOnCreateTopic}
          onNotify={mockOnNotify}
        />
      );
    });
    expect(screen.queryByText('Crear Nuevo Topic')).not.toBeInTheDocument();
  });

  test('se renderiza cuando show es true', async () => {
    await act(async () => {
      render(
        <CreateTopicModal 
          show={true}
          onClose={mockOnClose}
          onCreateTopic={mockOnCreateTopic}
          onNotify={mockOnNotify}
        />
      );
    });
    expect(screen.getByText('Crear Nuevo Topic')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe un título descriptivo...')).toBeInTheDocument();
  });

  test('valida campos requeridos y muestra errores', async () => {
    await act(async () => {
      render(
        <CreateTopicModal 
          show={true}
          onClose={mockOnClose}
          onCreateTopic={mockOnCreateTopic}
          onNotify={mockOnNotify}
        />
      );
    });
    const submitButton = screen.getByText('Publicar Topic');
    await act(async () => {
      fireEvent.click(submitButton);
    });
    await waitFor(() => {
      expect(screen.getByText('El título debe tener al menos 5 caracteres.')).toBeInTheDocument();
      expect(screen.getByText('El contenido debe tener al menos 10 caracteres.')).toBeInTheDocument();
    });
  });

  test('envía el topic con datos válidos', async () => {
    render(
      <CreateTopicModal 
        show={true}
        onClose={mockOnClose}
        onCreateTopic={mockOnCreateTopic}
        onNotify={mockOnNotify}
      />
    );

    const titleInput = screen.getByPlaceholderText('Escribe un título descriptivo...');
    const contentInput = screen.getByPlaceholderText('Describe tu tema en detalle...');
    const categorySelect = screen.getByRole('combobox');

    fireEvent.change(titleInput, { target: { value: 'Test Topic Title' } });
    fireEvent.change(contentInput, { target: { value: 'This is a test topic content with more than 10 characters' } });
    fireEvent.change(categorySelect, { target: { value: 'estrategias' } });

    const submitButton = screen.getByText('Publicar Topic');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnCreateTopic).toHaveBeenCalledWith({
        title: 'Test Topic Title',
        content: 'This is a test topic content with more than 10 characters',
        category: 'estrategias'
      });
    });
  });

  test('muestra consejos para un buen topic', () => {
    render(
      <CreateTopicModal 
        show={true}
        onClose={mockOnClose}
        onCreateTopic={mockOnCreateTopic}
        onNotify={mockOnNotify}
      />
    );

    expect(screen.getByText('Consejos para un buen topic:')).toBeInTheDocument();
    expect(screen.getByText('Usa un título claro y descriptivo')).toBeInTheDocument();
    expect(screen.getByText('Proporciona detalles suficientes en el contenido')).toBeInTheDocument();
  });

  test('cierra el modal al hacer clic en cancelar', () => {
    render(
      <CreateTopicModal 
        show={true}
        onClose={mockOnClose}
        onCreateTopic={mockOnCreateTopic}
        onNotify={mockOnNotify}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
