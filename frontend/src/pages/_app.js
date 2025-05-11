import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { SWRConfig } from 'swr';
import { AuthProvider } from '../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
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
        <Layout>
          <Component {...pageProps} />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </Layout>
      </SWRConfig>
    </AuthProvider>
  );
}

export default MyApp;
