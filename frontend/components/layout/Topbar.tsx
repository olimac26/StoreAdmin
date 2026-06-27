'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const pageTitles: Record<string, string> = {
  '/ventas': 'Ventas',
  '/inventario': 'Inventario',
  '/reportes': 'Reportes',
  '/notificaciones': 'Notificaciones',
  '/configuracion': 'Configuración',
};

export function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? 'Dashboard';

  return (
    <header className="h-14 border-b bg-card flex items-center gap-3 px-6 shrink-0">
      <span className="text-sm font-medium flex-1">{title}</span>

      {/* Buscador */}
      <div className="relative w-52">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-8 h-8 text-sm bg-background"
        />
      </div>

      {/* Notificaciones */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-8 w-8">
            <Bell className="w-4 h-4" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
              3
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between">
            Notificaciones
            <span className="text-xs font-normal text-muted-foreground">
              3 sin leer
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-2.5">
            <span className="text-sm font-medium">
              Stock crítico: Zapatillas Air
            </span>
            <span className="text-xs text-muted-foreground">
              Solo quedan 3 unidades
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              hace 10 min
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-2.5">
            <span className="text-sm font-medium">
              Orden #0035 — pago pendiente
            </span>
            <span className="text-xs text-muted-foreground">
              Lleva más de 1h sin confirmar
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              hace 1 hora
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start gap-0.5 py-2.5">
            <span className="text-sm font-medium">Meta diaria alcanzada ✓</span>
            <span className="text-xs text-muted-foreground">
              Ventas superaron $4,000
            </span>
            <span className="text-[11px] text-muted-foreground/70">
              hace 2 horas
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-center text-xs text-primary justify-center">
            Ver todas las notificaciones
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" className="h-8 w-8">
        <HelpCircle className="w-4 h-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 gap-2 px-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[11px]">AC</AvatarFallback>
            </Avatar>
            <span className="text-sm">Admin Central</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            <div className="text-sm font-medium">Admin Central</div>
            <div className="text-xs text-muted-foreground font-normal">
              Gerente
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Configuración</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
