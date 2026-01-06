import { motion } from 'framer-motion';
import { Home, BarChart3, Trophy, ShoppingCart, User, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', icon: Home, label: 'Corsa' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/leaderboard', icon: Trophy, label: 'Classifica' },
  { to: '/shop', icon: ShoppingCart, label: 'Shop' },
  { to: '/profile', icon: User, label: 'Profilo' },
];

export function BottomNav() {
  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-pb"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </motion.nav>
  );
}
