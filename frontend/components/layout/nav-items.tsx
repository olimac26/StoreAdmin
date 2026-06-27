import { TrendingUp, Package, BarChart3, Bell, Settings } from 'lucide-react';

export const navItems = [
  { href: '/sales', label: 'Ventas', icon: TrendingUp, badge: null },
  { href: '/inventory', label: 'Inventario', icon: Package, badge: 5 },
  { href: '/reports', label: 'Reportes', icon: BarChart3, badge: null },
  { href: '/notifications', label: 'Notificaciones', icon: Bell, badge: 3 },
  {
    href: '/settings',
    label: 'Configuración',
    icon: Settings,
    badge: null,
  },
];
