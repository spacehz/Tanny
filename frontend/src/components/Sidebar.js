import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Icônes (utilisation de SVG inline pour simplicité)
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const VolunteersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MerchantsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const CollectionsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);


const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Menu icon for collapsed state (hamburger)
const MenuIconCollapsed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Menu icon for expanded state (chevron-left)
const MenuIconExpanded = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export default function Sidebar({ onCollapse }) {
  // Set collapsed to true by default
  const [collapsed, setCollapsed] = useState(true);
  const router = useRouter();
  
  // Notifier le parent quand l'état de collapse change
  useEffect(() => {
    if (onCollapse) {
      onCollapse(collapsed);
    }
  }, [collapsed, onCollapse]);

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/admin',
    },
    {
      name: 'Gestion des bénévoles',
      icon: <VolunteersIcon />,
      path: '/admin-volunteers',
    },
    {
      name: 'Gestion des commerçants',
      icon: <MerchantsIcon />,
      path: '/admin-merchants',
    },
    {
      name: 'Collectes & Marchés',
      icon: <CollectionsIcon />,
      path: '/admin-collections',
    },

    {
      name: 'Paramètres',
      icon: <SettingsIcon />,
      path: '/admin-settings',
    },
  ];

  return (
    <div 
      className={`admin-sidebar ${collapsed ? 'collapsed' : ''} bg-primary-700 text-white h-full min-h-screen fixed left-0 top-0 transition-all duration-300`}
    >
      <div className="flex justify-between items-center p-3 border-b border-primary-600">
        <div className={`${collapsed ? 'hidden' : 'block'} transition-opacity duration-300 flex-1`}>
          <Link href="/admin" className="text-lg font-bold leading-tight">
            TANY<br />Admin
          </Link>
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className={`p-2 rounded-md hover:bg-primary-600 transition-colors ${collapsed ? 'w-full flex justify-center' : ''}`}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        >
          {collapsed ? <MenuIconCollapsed /> : <MenuIconExpanded />}
        </button>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {menuItems.map((item) => {
            // Vérifier si le chemin actuel correspond exactement ou commence par le chemin de l'élément
            const isActive = router.pathname === item.path || 
                            (item.path !== '/admin' && router.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className={`${collapsed ? 'hidden' : 'block'} transition-opacity duration-300 text-base whitespace-normal`}>
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
