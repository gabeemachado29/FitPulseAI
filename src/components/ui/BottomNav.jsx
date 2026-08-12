import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, ScanLine, Dumbbell, User } from 'lucide-react';
import styles from './BottomNav.module.css';

const navItems = [
  { path: '/', label: 'Início', icon: LayoutGrid },
  { path: '/scanner', label: 'Scanner', icon: ScanLine },
  { path: '/workouts', label: 'Treinos', icon: Dumbbell },
  { path: '/profile', label: 'Perfil', icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className={styles.nav} aria-label="Navegação principal">
      {navItems.map(({ path, label, icon: Icon }) => {
        const isActive = location.pathname === path;

        return (
          <NavLink
            key={path}
            to={path}
            className={`${styles.item} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              size={24}
              strokeWidth={isActive ? 2.5 : 1.8}
              className={styles.icon}
            />
            <span className={styles.label}>{label}</span>
            {isActive && <span className={styles.dot} />}
          </NavLink>
        );
      })}
    </nav>
  );
}
