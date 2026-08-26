"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search, Compass, Users, LayoutDashboard, Settings, LogOut, X } from 'lucide-react';
import './CommandPalette.css';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="cmdk-dialog-overlay" onClick={() => setOpen(false)}>
      <div className="cmdk-dialog" onClick={(e) => e.stopPropagation()}>
        <Command label="Global Command Menu">
          <div className="cmdk-input-wrapper">
            <Search className="cmdk-icon" size={18} />
            <Command.Input placeholder="Search pages or type a command..." autoFocus />
            <button className="cmdk-close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <Command.List>
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Navigation">
              <Command.Item onSelect={() => runCommand(() => router.push('/'))}>
                <LayoutDashboard className="cmdk-item-icon" size={16} />
                Dashboard
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push('/roster'))}>
                <Users className="cmdk-item-icon" size={16} />
                Class Roster
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => router.push('/groups'))}>
                <Compass className="cmdk-item-icon" size={16} />
                Groups
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Settings">
              <Command.Item onSelect={() => runCommand(() => router.push('/profile'))}>
                <Settings className="cmdk-item-icon" size={16} />
                Profile Settings
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Actions">
              <Command.Item 
                onSelect={() => runCommand(() => {
                  const form = document.createElement('form');
                  form.method = 'POST';
                  form.action = '/api/v1/auth/logout';
                  document.body.appendChild(form);
                  form.submit();
                })}
              >
                <LogOut className="cmdk-item-icon text-danger" size={16} />
                Log out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
