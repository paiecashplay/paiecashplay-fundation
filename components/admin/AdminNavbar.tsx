'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Globe, Award, Home, Users, Heart } from 'lucide-react';
import UserDropdown from '@/components/UserDropdown';

const navItems = [
  {
    href: '/',
    label: 'Accueil',
    icon: Home,
    description: 'Page principale'
  },
  {
    href: '/admin/federations',
    label: 'Fédérations',
    icon: Globe,
    description: '54 Fédérations CAF'
  },
  {
    href: '/admin/licenses',
    label: 'Licences',
    icon: Award,
    description: 'Gestion des licences'
  },
  {
    href: '/donation-success',
    label: 'Dons',
    icon: Heart,
    description: 'Suivi des donations'
  }
];

export default function AdminNavbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#4FBA73] to-[#3da562] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <div className="font-bold text-gray-900">PaieCashPlay</div>
              <div className="text-xs text-gray-500">Back-Office</div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-[#4FBA73] text-white'
                      : 'text-gray-600 hover:text-[#4FBA73] hover:bg-[#4FBA73]/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="hidden md:block">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className={`text-xs ${active ? 'text-green-100' : 'text-gray-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">Admin</div>
              <div className="text-xs text-gray-500">Gestionnaire</div>
            </div>
            <div className="w-8 h-8 bg-[#4FBA73] rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}