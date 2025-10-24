// Utilidades para compartir URLs y contenido

/**
 * Copia texto al portapapeles
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>} - true si se copió exitosamente
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Usar la API moderna de Clipboard
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Genera la URL para un topic específico
 * @param {string} topicId - ID del topic
 * @returns {string} - URL completa del topic
 */
export const getTopicUrl = (topicId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/topic/${topicId}`;
};

/**
 * Genera la URL para una sección específica
 * @param {string} section - Nombre de la sección
 * @returns {string} - URL completa de la sección
 */
export const getSectionUrl = (section) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/${section}`;
};

/**
 * Comparte un topic específico - solo copia la URL
 * @param {Object} topic - Objeto del topic
 * @param {Function} onNotify - Función para mostrar notificación
 * @returns {Promise<void>}
 */
export const shareTopicUrl = async (topic, onNotify) => {
  const url = getTopicUrl(topic.id);
  
  try {
    const copied = await copyToClipboard(url);
    
    if (copied && onNotify) {
      onNotify({
        type: 'success',
        title: 'URL copiada',
        message: 'El enlace del topic se ha copiado al portapapeles'
      });
    } else if (onNotify) {
      onNotify({
        type: 'error',
        title: 'Error',
        message: 'No se pudo copiar el enlace. Inténtalo de nuevo.'
      });
    }
  } catch (error) {
    console.error('Error sharing topic:', error);
    if (onNotify) {
      onNotify({
        type: 'error',
        title: 'Error',
        message: 'No se pudo copiar el enlace. Inténtalo de nuevo.'
      });
    }
  }
};

/**
 * Comparte un post específico dentro de un topic - solo copia la URL
 * @param {Object} post - Objeto del post
 * @param {string} topicId - ID del topic que contiene el post
 * @param {Function} onNotify - Función para mostrar notificación
 * @returns {Promise<void>}
 */
export const sharePostUrl = async (post, topicId, onNotify) => {
  const url = `${getTopicUrl(topicId)}#post-${post.id}`;

  try {
    const copied = await copyToClipboard(url);
    
    if (copied && onNotify) {
      onNotify({
        type: 'success',
        title: 'URL copiada',
        message: 'El enlace del post se ha copiado al portapapeles'
      });
    } else if (onNotify) {
      onNotify({
        type: 'error',
        title: 'Error',
        message: 'No se pudo copiar el enlace. Inténtalo de nuevo.'
      });
    }
  } catch (error) {
    console.error('Error sharing post:', error);
    if (onNotify) {
      onNotify({
        type: 'error',
        title: 'Error',
        message: 'No se pudo copiar el enlace. Inténtalo de nuevo.'
      });
    }
  }
};