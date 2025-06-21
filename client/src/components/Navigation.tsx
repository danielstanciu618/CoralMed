import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/lib/auth";
import { AuthModal } from "./AuthModal";
import { NotificationBadge } from "./NotificationBadge";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Menu, Phone, LogOut } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();
  const { isAuthenticated, updateAuth } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch notification counts
  const { data: unreadMessages = [] } = useQuery<any[]>({
    queryKey: ["/api/messages/unread"],
    enabled: isAuthenticated,
  });

  const { data: upcomingAppointments = [] } = useQuery<any[]>({
    queryKey: ["/api/appointments/upcoming"],
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    updateAuth(false);
    setMobileMenuOpen(false);
  };

  const handleAuthSuccess = () => {
    updateAuth(true);
    setShowAuthModal(false);
  };

  const callClinic = () => {
    window.location.href = "tel:+40721234567";
  };

  const handleMenuItemClick = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Don't close if clicking the menu button or the menu itself
      if (
        (mobileMenuRef.current && mobileMenuRef.current.contains(target)) ||
        (menuButtonRef.current && menuButtonRef.current.contains(target))
      ) {
        return;
      }
      
      setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🦷</span>
                </div>
                <span className="text-xl font-bold text-gray-900">CoralMed</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {!isAuthenticated ? (
                <>
                  <Link href="/" className={`px-3 py-2 font-medium ${location === "/" ? "text-medical-blue" : "text-gray-700 hover:text-medical-blue"}`}>
                    Acasă
                  </Link>
                  <Link href="/contact" className={`px-3 py-2 font-medium ${location === "/contact" ? "text-medical-blue" : "text-gray-700 hover:text-medical-blue"}`}>
                    Contact
                  </Link>
                  <Button onClick={() => setShowAuthModal(true)} className="bg-medical-blue hover:bg-blue-700">
                    Autentificare
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className={`px-3 py-2 font-medium ${location === "/dashboard" ? "text-medical-blue" : "text-gray-700 hover:text-medical-blue"}`}>
                    Acasă
                  </Link>
                  <Link href="/appointments" className={`px-3 py-2 font-medium relative ${location === "/appointments" ? "text-medical-blue" : "text-gray-700 hover:text-medical-blue"}`}>
                    Programări
                    <NotificationBadge count={(upcomingAppointments as any[]).length} />
                  </Link>
                  <Link href="/messages" className={`px-3 py-2 font-medium relative ${location === "/messages" ? "text-medical-blue" : "text-gray-700 hover:text-medical-blue"}`}>
                    Mesaje
                    <NotificationBadge count={(unreadMessages as any[]).length} />
                  </Link>
                  <Link href="/patients" className={`px-3 py-2 font-medium ${location === "/patients" ? "text-medical-blue" : "text-gray-700 hover:text-medical-blue"}`}>
                    Dosare Medicale
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" className="text-medical-red hover:text-red-700">
                    <LogOut className="w-4 h-4 mr-1" />
                    Deconectare
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button onClick={callClinic} variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <div className="relative">
                <Button
                  ref={menuButtonRef}
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  variant="ghost"
                  size="sm"
                  className="relative z-10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div ref={mobileMenuRef} className="md:hidden border-t border-gray-200 py-4 bg-white relative z-40">
              <div className="space-y-2">
                {!isAuthenticated ? (
                  <>
                    <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-medical-blue" onClick={handleMenuItemClick}>
                      Acasă
                    </Link>
                    <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-medical-blue" onClick={handleMenuItemClick}>
                      Contact
                    </Link>
                    <Button 
                      onClick={() => {
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }} 
                      className="w-full mt-4 bg-medical-blue hover:bg-blue-700"
                    >
                      Autentificare
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-medical-blue" onClick={handleMenuItemClick}>
                      Acasă
                    </Link>
                    <Link href="/appointments" className="flex items-center justify-between px-3 py-2 text-gray-700 hover:text-medical-blue" onClick={handleMenuItemClick}>
                      <span>Programări</span>
                      {(upcomingAppointments as any[]).length > 0 && (
                        <NotificationBadge count={(upcomingAppointments as any[]).length} variant="inline" />
                      )}
                    </Link>
                    <Link href="/messages" className="flex items-center justify-between px-3 py-2 text-gray-700 hover:text-medical-blue" onClick={handleMenuItemClick}>
                      <span>Mesaje</span>
                      {(unreadMessages as any[]).length > 0 && (
                        <NotificationBadge count={(unreadMessages as any[]).length} variant="inline" />
                      )}
                    </Link>
                    <Link href="/patients" className="block px-3 py-2 text-gray-700 hover:text-medical-blue" onClick={handleMenuItemClick}>
                      Dosare Medicale
                    </Link>
                    <Button onClick={handleLogout} variant="ghost" className="w-full text-medical-red hover:text-red-700 justify-start">
                      <LogOut className="w-4 h-4 mr-1" />
                      Deconectare
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
