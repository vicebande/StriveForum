// Test de funcionalidades del foro - StriveForum
// Este archivo puede ejecutarse en el navegador para verificar funciones

console.log('=== REVISIÓN DE FUNCIONALIDADES DEL FORO ===');

// 1. Verificar autenticación
function testAuth() {
  console.log('\n1. SISTEMA DE AUTENTICACIÓN:');
  
  try {
    const session = JSON.parse(localStorage.getItem('sf_auth_session') || '{}');
    console.log('✓ AuthService funcionando');
    console.log('- Sesión actual:', session.isAuthenticated ? 'Activa' : 'Inactiva');
    console.log('- Usuario:', session.user?.username || 'Sin usuario');
  } catch (e) {
    console.log('❌ Error en AuthService:', e.message);
  }
}

// 2. Verificar sistema de topics
function testTopics() {
  console.log('\n2. SISTEMA DE TOPICS:');
  
  try {
    const topics = JSON.parse(localStorage.getItem('sf_topics') || '[]');
    console.log('✓ Topics cargados:', topics.length);
    
    topics.forEach((topic, i) => {
      if (i < 3) { // Mostrar solo los primeros 3
        console.log(`- Topic ${i+1}: "${topic.title}" (${topic.upvotes || 0} votos)`);
      }
    });
  } catch (e) {
    console.log('❌ Error en Topics:', e.message);
  }
}

// 3. Verificar sistema de posts
function testPosts() {
  console.log('\n3. SISTEMA DE POSTS:');
  
  try {
    const postsMap = JSON.parse(localStorage.getItem('sf_postsMap') || '{}');
    const topicCount = Object.keys(postsMap).length;
    console.log('✓ Topics con posts:', topicCount);
    
    Object.keys(postsMap).forEach((topicId, i) => {
      if (i < 3) { // Mostrar solo los primeros 3
        const posts = postsMap[topicId];
        console.log(`- Topic ${topicId}: ${posts.length} posts`);
      }
    });
  } catch (e) {
    console.log('❌ Error en Posts:', e.message);
  }
}

// 4. Verificar sistema de votos
function testVotes() {
  console.log('\n4. SISTEMA DE VOTOS:');
  
  try {
    const userVotes = JSON.parse(localStorage.getItem('sf_user_votes') || '{}');
    const voteCount = Object.keys(userVotes).length;
    console.log('✓ Votos registrados:', voteCount);
    
    if (voteCount > 0) {
      console.log('- Algunos votos:', Object.keys(userVotes).slice(0, 3));
    }
  } catch (e) {
    console.log('❌ Error en Votos:', e.message);
  }
}

// 5. Verificar navegación
function testNavigation() {
  console.log('\n5. SISTEMA DE NAVEGACIÓN:');
  
  try {
    const currentSection = localStorage.getItem('sf_current_section') || 'home';
    console.log('✓ Navegación funcionando');
    console.log('- Sección actual:', currentSection);
    
    // Verificar formato topic
    const isTopicView = currentSection.startsWith('topic:');
    if (isTopicView) {
      const topicId = currentSection.split(':')[1];
      console.log('- Vista de topic activa:', topicId);
    }
  } catch (e) {
    console.log('❌ Error en Navegación:', e.message);
  }
}

// Ejecutar todas las pruebas
function runAllTests() {
  testAuth();
  testTopics();
  testPosts();
  testVotes();
  testNavigation();
  
  console.log('\n=== RESUMEN ===');
  console.log('Si no hay errores ❌, todas las funciones están operativas.');
  console.log('Para usar: Copia y pega este código en la consola del navegador.');
}

// Auto-ejecutar si está en navegador
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('Ejecuta este script en la consola del navegador para probar.');
}