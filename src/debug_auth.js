// Script de debug pour l'authentification
// À exécuter dans la console du navigateur

console.log('🔍 Debug de l\'authentification...');

// 1. Vérifier le token dans localStorage
const token = localStorage.getItem('authToken');
console.log('1️⃣ Token dans localStorage:', token ? `${token.substring(0, 20)}...` : '❌ Aucun token');

// 2. Vérifier le refresh token
const refreshToken = localStorage.getItem('refreshToken');
console.log('2️⃣ Refresh token dans localStorage:', refreshToken ? `${refreshToken.substring(0, 20)}...` : '❌ Aucun refresh token');

// 3. Vérifier l'état Redux (si accessible)
if (window.__REDUX_DEVTOOLS_EXTENSION__) {
  console.log('3️⃣ Redux DevTools disponible');
} else {
  console.log('3️⃣ Redux DevTools non disponible');
}

// 4. Test de l'API avec le token
if (token) {
  console.log('4️⃣ Test de l\'API avec le token...');
  
  fetch('http://localhost:8000/api/reports/analytics', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    return response.json();
  })
  .then(data => {
    console.log('📄 Données:', data);
  })
  .catch(error => {
    console.error('❌ Erreur:', error);
  });
} else {
  console.log('4️⃣ Pas de token, impossible de tester l\'API');
}

// 5. Vérifier la structure de la réponse d'authentification
console.log('5️⃣ Structure attendue de la réponse:');
console.log('- action.payload.token');
console.log('- action.payload.refreshToken');
console.log('- action.payload.user');
console.log('- action.payload.permissions'); 