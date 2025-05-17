import React from 'react';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import ToastExample from '../components/ToastExample';

const ToastDemoPage = () => {
  return (
    <Layout>
      <Head>
        <title>Démonstration des Notifications | TANY</title>
        <meta name="description" content="Démonstration des notifications avec react-hot-toast" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Démonstration des Notifications</h1>
        <p className="mb-6">
          Cette page démontre l'utilisation de react-hot-toast pour afficher différents types de notifications.
          Cliquez sur les boutons ci-dessous pour voir les différents types de notifications.
        </p>
        
        <ToastExample />
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Comment utiliser react-hot-toast</h2>
          <p className="mb-4">
            Pour utiliser react-hot-toast dans vos composants, importez les fonctions de notification depuis le fichier utils/notifications.js :
          </p>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
            {`import { notify } from '../utils/notifications';

// Afficher une notification de succès
notify.success('Opération réussie !');

// Afficher une notification d'erreur
notify.error('Une erreur est survenue !');

// Afficher une notification d'information
notify.info('Information importante');

// Afficher une notification d'avertissement
notify.warning('Attention !');

// Afficher une notification de chargement
const toastId = notify.loading('Chargement en cours...');

// Fermer une notification spécifique
toast.dismiss(toastId);`}
          </pre>
        </div>
      </div>
    </Layout>
  );
};

export default ToastDemoPage;
