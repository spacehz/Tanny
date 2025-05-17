import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Icônes (utilisation de SVG inline pour simplicité)
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ParticipationsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

export default function VolunteerSidebar({ onCollapse }) {
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
      name: 'Tableau de bord',
      icon: <DashboardIcon />,
      path: '/volunteer',
    },
    {
      name: 'Mes participations',
      icon: <ParticipationsIcon />,
      path: '/volunteer-participations',
    },
  ];

  return (
    <div 
      className={`volunteer-sidebar ${collapsed ? 'collapsed' : ''} bg-primary-700 text-white h-screen fixed left-0 top-0 z-10 transition-all duration-300`}
    >
      <div className="flex justify-between items-center p-3 border-b border-primary-600">
        <div className={`${collapsed ? 'hidden' : 'block'} transition-opacity duration-300 flex-1`}>
          <Link href="/volunteer" className="text-lg font-bold leading-tight">
            TANY<br />Bénévole
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
                            (item.path !== '/volunteer' && router.pathname.startsWith(item.path));
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
