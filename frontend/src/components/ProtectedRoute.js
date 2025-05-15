import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// Composant pour protéger les routes qui nécessitent une authentification
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isAuthenticated = !!user; // Détermine si l'utilisateur est authentifié

  useEffect(() => {
    // Si le chargement est terminé et que l'utilisateur n'est pas authentifié
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
    // L'administrateur a accès à toutes les pages
    if (!loading && isAuthenticated && requiredRole) {
      // Vérifier si l'utilisateur a le rôle requis ou est admin
      const hasRequiredRole = 
        user.role === requiredRole || 
        user.role === 'admin' || 
        (requiredRole === 'volunteer' && user.role === 'bénévole') ||
        (requiredRole === 'merchant' && user.role === 'commerçant');
      
      if (!hasRequiredRole) {
        // Rediriger vers la page appropriée en fonction du rôle de l'utilisateur
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'volunteer' || user.role === 'bénévole') {
          router.push('/volunteer');
        } else if (user.role === 'merchant' || user.role === 'commerçant') {
          router.push('/merchant');
        } else {
          router.push('/');
        }
      }
    }
  }, [loading, isAuthenticated, user, router, requiredRole]);

  // Afficher un écran de chargement pendant la vérification
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
  // L'administrateur a accès à toutes les pages
  if (requiredRole) {
    const hasRequiredRole = 
      user.role === requiredRole || 
      user.role === 'admin' || 
      (requiredRole === 'volunteer' && user.role === 'bénévole') ||
      (requiredRole === 'merchant' && user.role === 'commerçant');
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Accès non autorisé</p>
          </div>
        </div>
      );
    }
  }

  // Si tout est bon, afficher le contenu protégé
  return children;
};

export default ProtectedRoute;
