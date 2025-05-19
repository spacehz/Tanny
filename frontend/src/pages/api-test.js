import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ApiTestPage() {
  const { user } = useAuth();
  const [assignmentId, setAssignmentId] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Récupérer les affectations du bénévole
  const fetchAssignments = async () => {
    if (!user || !user._id) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/api/users/volunteers/${user._id}/assignments`);
      console.log('Affectations récupérées:', response.data);
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        setAssignmentId(response.data.data[0]._id);
        setResult(JSON.stringify(response.data.data, null, 2));
      } else {
        setError('Aucune affectation trouvée');
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des affectations:', err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Démarrer une affectation
  const startAssignment = async () => {
    if (!assignmentId) {
      setError('ID d\'affectation manquant');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Récupérer un token CSRF
      const csrfResponse = await api.get('/api/csrf-token');
      const csrfToken = csrfResponse.data.csrfToken;
      
      // Configurer les headers avec le token CSRF
      const headers = {
        'X-CSRF-Token': csrfToken
      };
      
      // Faire la requête pour démarrer l'affectation
      const response = await api.patch(`/api/assignments/${assignmentId}/start`, {}, { headers });
      console.log('Affectation démarrée:', response.data);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('Erreur lors du démarrage de l\'affectation:', err);
      setError(`Erreur: ${err.message}`);
      
      // Afficher les détails de l'erreur
      if (err.response) {
        console.error('Réponse d\'erreur:', err.response.data);
        setError(`Erreur: ${err.message} - ${JSON.stringify(err.response.data)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Terminer une affectation
  const endAssignment = async () => {
    if (!assignmentId) {
      setError('ID d\'affectation manquant');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Récupérer un token CSRF
      const csrfResponse = await api.get('/api/csrf-token');
      const csrfToken = csrfResponse.data.csrfToken;
      
      // Configurer les headers avec le token CSRF
      const headers = {
        'X-CSRF-Token': csrfToken
      };
      
      // Faire la requête pour terminer l'affectation
      const response = await api.patch(`/api/assignments/${assignmentId}/end`, {}, { headers });
      console.log('Affectation terminée:', response.data);
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error('Erreur lors de la fin de l\'affectation:', err);
      setError(`Erreur: ${err.message}`);
      
      // Afficher les détails de l'erreur
      if (err.response) {
        console.error('Réponse d\'erreur:', err.response.data);
        setError(`Erreur: ${err.message} - ${JSON.stringify(err.response.data)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Head>
        <title>Test API | TANY</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">Test API</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Utilisateur connecté</h2>
        <pre className="bg-gray-100 p-4 rounded-md">
          {user ? JSON.stringify(user, null, 2) : 'Non connecté'}
        </pre>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <div className="flex space-x-4">
          <button
            onClick={fetchAssignments}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            disabled={loading}
          >
            Récupérer les affectations
          </button>
          
          <button
            onClick={startAssignment}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            disabled={loading || !assignmentId}
          >
            Démarrer l'affectation
          </button>
          
          <button
            onClick={endAssignment}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={loading || !assignmentId}
          >
            Terminer l'affectation
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">ID d'affectation</h2>
        <input
          type="text"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          placeholder="ID de l'affectation"
        />
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Résultat</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
