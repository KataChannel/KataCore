'use client';
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
interface CRMLayoutProps {
  children: React.ReactNode;
}
export default function CRMLayout({ children }: CRMLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {

  }, []);


  return (
    <div>
      {children}
    </div>
  );
}
