import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import NotificationBell from '../NotificationBell';
import ProfileDropdown from './ProfileDropdown';

const Navbar = () => {
  const { profile } = useProfile();

  const location = useLocation();
  const tabsRef = React.useRef<HTMLDivElement | null>(null);
  const btnRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const [indicator, setIndicator] = React.useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  const baseItems = [
    { label: 'Courses', to: '/courses' },
    { label: 'Dashboard', to: '/' },
    { label: 'Community', to: '/community' },
    { label: 'Schedule', to: '/schedule' },
    { label: 'Events', to: '/events' },
  ];

  const studentItems = [
    { label: 'Home', to: '/home' },
    ...baseItems
  ];

  const adminItems = [
    { label: 'Admin Dashboard', to: '/admin' },
    { label: 'Faculty Management', to: '/admin/faculty' },
    { label: 'Mentor Assignments', to: '/admin/assignments' },
    { label: 'Debug', to: '/admin/debug' },
  ];

  const items = React.useMemo(() => {
    if (profile?.role === 'admin') {
      return adminItems;
    }
    if (profile?.role === 'student') {
      return studentItems; // student sees Home + Community
    }
    // faculty: hide student Community, add Faculty Community and My Students
    const list = baseItems.filter(i=> i.label !== 'Community');
    list.splice(2, 0, { label: 'Faculty Community', to: '/faculty/community' });
    list.splice(3, 0, { label: 'My Students', to: '/faculty/students' });
    return list;
  }, [profile]);

  React.useLayoutEffect(() => {
    const active = items.find((i) => i.to === location.pathname);
    if (active) {
      const container = tabsRef.current;
      const btn = btnRefs.current[active.label];
      if (container && btn) {
        const cRect = container.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();
        setIndicator({ left: bRect.left - cRect.left, width: bRect.width });
      }
    }
  }, [location.pathname, items]);

  // keyboard navigation for tabs
  const onTabsKeyDown = (e: React.KeyboardEvent) => {
    const currentPathIndex = items.findIndex(i=>i.to===location.pathname);
    const current = focusedIndex ?? (currentPathIndex >= 0 ? currentPathIndex : 0);
    if (e.key === 'ArrowRight') {
      const next = Math.min(items.length-1, current+1);
      setFocusedIndex(next);
      btnRefs.current[items[next].label]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = Math.max(0, current-1);
      setFocusedIndex(prev);
      btnRefs.current[items[prev].label]?.focus();
      e.preventDefault();
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b bg-white shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity">mondly</Link>
          </div>

          <div ref={tabsRef} onKeyDown={onTabsKeyDown} tabIndex={0} aria-label="Main navigation" role="tablist" className="relative hidden md:flex items-center gap-1 bg-gray-100 rounded-full p-1">
            <span aria-hidden="true" className="pointer-events-none absolute top-1 bottom-1 rounded-full bg-[#111827] shadow-sm transition-all duration-300 ease-out z-0" style={{ left: indicator.left, width: indicator.width }} />
            {items.map((item, idx) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.label}
                  ref={(el) => (btnRefs.current[item.label] = el)}
                  to={item.to}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={-1}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${isActive ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
                  style={isActive ? { color: 'white !important' } : {}}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {profile && <NotificationBell />}
            {profile && <ProfileDropdown />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
