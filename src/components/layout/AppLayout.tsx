import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#D7D7E4] overflow-x-hidden">
      <Navbar />
      <Outlet />
    </div>
  );
}
