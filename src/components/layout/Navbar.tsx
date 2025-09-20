import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User } from 'lucide-react';
import NotificationsDropdown from '../dashboard/student/NotificationsDropdown';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Signed out successfully!',
      });
      navigate('/auth', { replace: true });
    }
  };

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
  const items = React.useMemo(() => {
    if (profile?.role === 'student') {
      return baseItems; // student sees Community, not Faculty Community
    }
    // faculty: hide student Community, add Faculty Community
    const list = baseItems.filter(i=> i.label !== 'Community');
    list.splice(2, 0, { label: 'Faculty Community', to: '/faculty/community' });
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
            {(profile?.role === 'student' || profile?.role === 'faculty') && <NotificationsDropdown />}
            {profile && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700 transition-colors">
                <User className="h-4 w-4" />
                <Link to="/profile" className="font-medium hover:underline">{profile.full_name}</Link>
                <span className="text-xs capitalize">({profile.role})</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut} className="transition-all duration-200 hover:-translate-y-0.5">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
