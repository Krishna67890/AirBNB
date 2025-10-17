import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLockBodyScroll, useOnClickOutside } from '@/hooks';
import { Icon } from '@/components/common';
import { cn } from '@/lib/utils';

const MobileMenu = ({ 
  navigation = [],
  user = null,
  onLogin,
  onLogout,
  className,
  position = 'right',
  overlay = true,
  closeOnNavigate = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  // Lock body scroll when menu is open
  useLockBodyScroll(isOpen);

  // Close menu when clicking outside
  useOnClickOutside(menuRef, () => setIsOpen(false), triggerRef);

  // Close menu on escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Close menu when route changes (if closeOnNavigate is true)
  useEffect(() => {
    if (closeOnNavigate && isOpen) {
      setIsOpen(false);
    }
  }, [closeOnNavigate, isOpen]);

  const menuVariants = {
    closed: {
      x: position === 'right' ? '100%' : '-100%',
      opacity: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        duration: 0.2
      }
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    closed: { 
      x: 20, 
      opacity: 0 
    },
    open: (i) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        type: 'spring',
        stiffness: 300
      }
    })
  };

  const overlayVariants = {
    closed: { 
      opacity: 0,
      transition: { duration: 0.2 }
    },
    open: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const handleNavigation = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    if (closeOnNavigate) {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Menu Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2 rounded-lg transition-all duration-200',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'relative z-50'
        )}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-6 h-6 flex flex-col justify-between">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-current block transition-colors"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="w-full h-0.5 bg-current block transition-colors"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="w-full h-0.5 bg-current block transition-colors"
          />
        </div>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && overlay && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn(
              'fixed top-0 h-full w-80 max-w-full bg-white dark:bg-gray-900',
              'shadow-2xl border-l border-gray-200 dark:border-gray-700',
              'z-50 flex flex-col',
              position === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close menu"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-6 overflow-y-auto">
              <motion.ul className="space-y-4">
                {navigation.map((item, index) => (
                  <motion.li
                    key={item.id || item.label}
                    custom={index}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                  >
                    {item.type === 'divider' ? (
                      <hr className="my-4 border-gray-200 dark:border-gray-700" />
                    ) : item.href ? (
                      <a
                        href={item.href}
                        onClick={() => handleNavigation(item)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
                          'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                          'hover:bg-gray-50 dark:hover:bg-gray-800',
                          'group cursor-pointer'
                        )}
                      >
                        {item.icon && (
                          <Icon 
                            name={item.icon} 
                            className="w-5 h-5 transition-transform group-hover:scale-110" 
                          />
                        )}
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            {item.badge}
                          </span>
                        )}
                      </a>
                    ) : (
                      <button
                        onClick={() => handleNavigation(item)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-full text-left',
                          'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white',
                          'hover:bg-gray-50 dark:hover:bg-gray-800',
                          'group cursor-pointer'
                        )}
                      >
                        {item.icon && (
                          <Icon 
                            name={item.icon} 
                            className="w-5 h-5 transition-transform group-hover:scale-110" 
                          />
                        )}
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </nav>

            {/* User Section */}
            {user && (
              <motion.div
                variants={itemVariants}
                custom={navigation.length + 1}
                initial="closed"
                animate="open"
                className="p-6 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Icon name="logout" className="w-4 h-4" />
                  <span className="font-medium">Sign out</span>
                </button>
              </motion.div>
            )}

            {/* Login Button */}
            {!user && onLogin && (
              <motion.div
                variants={itemVariants}
                custom={navigation.length + 1}
                initial="closed"
                animate="open"
                className="p-6 border-t border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={onLogin}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors font-medium"
                >
                  <Icon name="user" className="w-4 h-4" />
                  Sign in
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileMenu;