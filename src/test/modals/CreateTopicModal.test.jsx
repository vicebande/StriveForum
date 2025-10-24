import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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

  test('no se renderiza cuando show es false', () => {
    render(
      <CreateTopicModal 
        show={false} 
        onClose={mockOnClose}
        onCreateTopic={mockOnCreateTopic}
        onNotify={mockOnNotify}
      />
    );
    expect(screen.queryByText('Crear Topic')).not.toBeInTheDocument();
  });

  test('valida campos requeridos', () => {
    render(
      <CreateTopicModal 
        show={true}
        onClose={mockOnClose}
        onCreateTopic={mockOnCreateTopic}
        onNotify={mockOnNotify}
      />
    );

    act(() => {
      const submitButton = screen.getByText('Publicar Topic');
      fireEvent.click(submitButton);
    });

    expect(mockOnNotify).toHaveBeenCalledWith(expect.objectContaining({
      type: 'error',
      title: 'Error de validación'
    }));
  });

  test('envía el topic con datos válidos', () => {
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
    const categorySelect = screen.getByLabelText('Categoría');

    fireEvent.change(titleInput, { target: { value: 'Test Topic Title' } });
    fireEvent.change(contentInput, { target: { value: 'This is a test topic content with more than 10 characters' } });
    fireEvent.change(categorySelect, { target: { value: 'estrategias' } });

    const submitButton = screen.getByText('Publicar Topic');
    fireEvent.click(submitButton);

    expect(mockOnCreateTopic).toHaveBeenCalledWith({
      title: 'Test Topic Title',
      content: 'This is a test topic content with more than 10 characters',
      category: 'estrategias'
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
});
