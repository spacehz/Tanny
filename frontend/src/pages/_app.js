import '../styles/globals.css';
import '../styles/calendar.css';
import Layout from '../components/layout/Layout';
import { SWRConfig } from 'swr';
import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Vérifier si la page actuelle est une page bénévole
  const isVolunteerPage = router.pathname.startsWith('/volunteer');
  
  // Vérifier si la page actuelle est une page admin
  const isAdminPage = router.pathname.startsWith('/admin');
  
  // Vérifier si la page actuelle est la page de connexion
  const isLoginPage = router.pathname === '/login';
  
  // Vérifier si la page actuelle est la page d'accueil (index)
  const isIndexPage = router.pathname === '/';
  
  // Si la page a un layout personnalisé, l'utiliser, sinon utiliser le layout par défaut
  const getLayout = () => {
    // Les pages bénévoles, admin, login et index gèrent leur propre layout
    if (isVolunteerPage || isAdminPage || isLoginPage || isIndexPage) {
      return <Component {...pageProps} />;
    }
    
    // Pour les autres pages, utiliser le layout par défaut
    return (
      <Layout>
        <Component {...pageProps} />
      </Layout>
    );
  };

  return (
    <AuthProvider>
      <SWRConfig 
        value={{
          fetcher: (url) => fetch(url).then(res => {
            if (!res.ok) {
              throw new Error('Une erreur est survenue lors de la récupération des données');
            }
            return res.json();
          }),
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          dedupingInterval: 5000
        }}
      >
        {getLayout()}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      </SWRConfig>
    </AuthProvider>
  );
}

export default MyApp;
