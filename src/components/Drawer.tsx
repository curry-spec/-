/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  eyebrow?: string;
  size?: string;
  noPadding?: boolean;
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

export default function Drawer({ isOpen, onClose, title, eyebrow, size, noPadding, children, hideCloseButton }: DrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="drawer-overlay"
            onClick={onClose}
          />
          <motion.section
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`drawer ${size === 'lg' ? 'max-w-[1000px]' : size === 'md' ? 'max-w-[760px]' : 'max-w-[500px]'} w-full`}
            role="dialog"
            aria-modal="true"
          >
            <header className="drawer-header">
              <div>
                {eyebrow && <small className="text-gray-400 block mb-1">{eyebrow}</small>}
                <h2 className="text-lg font-bold">{title}</h2>
              </div>
              {!hideCloseButton && (
                <button className="icon-button" onClick={onClose} aria-label="关闭详情">
                  <X size={20} />
                </button>
              )}
            </header>
            <div className={`drawer-body ${noPadding ? 'p-0' : ''}`}>
              {children}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
