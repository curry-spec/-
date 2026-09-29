/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, eyebrow, children }: DrawerProps) {
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
            className="drawer"
            role="dialog"
            aria-modal="true"
          >
            <header className="drawer-header">
              <div>
                {eyebrow && <small className="text-gray-400 block mb-1">{eyebrow}</small>}
                <h2 className="text-lg font-bold">{title}</h2>
              </div>
              <button className="icon-button" onClick={onClose} aria-label="关闭详情">
                <X size={20} />
              </button>
            </header>
            <div className="drawer-body">
              {children}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
