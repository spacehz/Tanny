import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { SWRConfig } from 'swr';

function MyApp({ Component, pageProps }) {
  return (
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
      </Layout>
    </SWRConfig>
  );
}

export default MyApp;
