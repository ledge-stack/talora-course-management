'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Chip
} from "@heroui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Bell, LayoutDashboard, ShieldCheck, ClipboardList, Calendar } from "lucide-react";

export default function MainNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const user = JSON.parse(typeof window !== 'undefined' ? (localStorage.getItem('user') || '{}') : '{}');

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    ...(user.role === 'class_rep' ? [
      { label: "Admin Panel", href: "/admin", icon: <ShieldCheck size={20} /> }
    ] : []),
  ];

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen} maxWidth="full" className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-indigo-200 shadow-lg">
              <span className="text-white font-black text-xs">T</span>
            </div>
            <p className="font-black text-inherit text-xl tracking-tighter text-gray-900">
              TALORA<span className="text-indigo-600">.</span>
            </p>
            {user.role === 'class_rep' && (
              <Chip
                size="sm"
                variant="flat"
                color="secondary"
                className="hidden md:flex font-bold text-[9px] h-5 border-indigo-100"
              >
                ADMIN MODE
              </Chip>
            )}
            {user.role === 'group_leader' && (
              <Chip
                size="sm"
                variant="flat"
                color="primary"
                className="hidden md:flex font-bold text-[9px] h-5"
              >
                LEADER
              </Chip>
            )}
          </div>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link color="foreground" href={item.href} className="text-sm font-medium flex items-center gap-2">
              {item.icon}
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="flex">
          <Button isIconOnly variant="light" radius="full">
            <Bell size={20} className="text-gray-500" />
          </Button>
        </NavbarItem>

        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              color={user.role === 'class_rep' ? "secondary" : "primary"}
              name={user.fullName}
              size="sm"
              src={`https://i.pravatar.cc/150?u=${user.id}`}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold text-xs text-gray-400 uppercase tracking-widest">
                {user.role?.replace('_', ' ')}
              </p>
              <p className="font-bold text-slate-900">{user.email}</p>
            </DropdownItem>
            <DropdownItem key="settings" startContent={<Settings size={16} />}>
              My Settings
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              className="text-danger"
              startContent={<LogOut size={16} />}
              onClick={handleLogout}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      <NavbarMenu>
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.label}-${index}`}>
            <Link
              color="foreground"
              className="w-full flex items-center gap-3 py-2"
              href={item.href}
              size="lg"
            >
              {item.icon}
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button
            color="danger"
            variant="flat"
            className="w-full justify-start mt-4"
            startContent={<LogOut size={20} />}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
