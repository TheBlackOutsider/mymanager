// Script de debug pour l'API frontend
// À exécuter dans la console du navigateur

console.log('🔍 Debug de l\'API frontend...');

// 1. Vérifier que l'API est accessible
console.log('1️⃣ Test de l\'API frontend...');

// 2. Test direct de l'API d'authentification
const testAuth = async () => {
  try {
    console.log('2️⃣ Test de l\'API d\'authentification...');
    
    const response = await fetch('http://localhost:8000/api/auth/email/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin.hr@company.com',
        password: 'password123'
      })
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse reçue:', data);
      
      // Vérifier la structure
      if (data.data && data.data.token) {
        console.log('🔑 Token trouvé:', data.data.token.substring(0, 20) + '...');
        
        // Test de stockage dans localStorage
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        console.log('💾 Tokens stockés dans localStorage');
        console.log('   authToken:', localStorage.getItem('authToken') ? '✅ Présent' : '❌ Absent');
        console.log('   refreshToken:', localStorage.getItem('refreshToken') ? '✅ Présent' : '❌ Absent');
        
        // Test d'accès aux rapports
        console.log('3️⃣ Test d\'accès aux rapports...');
        const reportsResponse = await fetch('http://localhost:8000/api/reports/analytics', {
          headers: {
            'Authorization': `Bearer ${data.data.token}`
          }
        });
        
        console.log('📊 Status rapports:', reportsResponse.status);
        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          console.log('✅ Rapports accessibles:', reportsData);
        } else {
          console.log('❌ Erreur rapports:', await reportsResponse.text());
        }
        
      } else {
        console.log('❌ Structure de réponse incorrecte');
        console.log('   data.data:', data.data);
        console.log('   data.data.token:', data.data?.token);
      }
    } else {
      console.log('❌ Erreur de connexion:', await response.text());
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
};

// Exécuter le test
testAuth(); 