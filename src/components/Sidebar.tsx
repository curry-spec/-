/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, Bug, ListChecks, Archive, GitCompareArrows, ScanSearch, UserRound, Menu } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentView, onViewChange, isOpen, onClose }: SidebarProps) {
  const navItems = [
    { id: 'overview' as View, label: '监控总览', icon: Activity, group: '日常运营' },
    { id: 'analysis' as View, label: '异常指标分析', icon: Archive, group: '日常运营' },
    { id: 'badcase' as View, label: 'Badcase 分析', icon: Bug, group: '日常运营' },
    { id: 'batches' as View, label: '评估批次', icon: ListChecks, group: '日常运营' },
    { id: 'assets' as View, label: '链路调优资产', icon: Archive, group: '优化验证' },
    { id: 'validation' as View, label: '验证追踪', icon: GitCompareArrows, group: '优化验证' },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <ScanSearch size={21} />
          </span>
          <div>
            <strong>意图识别运营中心</strong>
            <small>Intent Operations</small>
          </div>
        </div>

        <div className="nav-label">日常运营</div>
        <nav>
          {navItems.filter(i => i.group === '日常运营').map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => { onViewChange(item.id); onClose(); }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-label">优化验证</div>
        <nav>
          {navItems.filter(i => i.group === '优化验证').map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => { onViewChange(item.id); onClose(); }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="nav-label">配置</div>
        
        <div className="sidebar-bottom">
          <span className="avatar">运</span>
          <div>
            <strong>AI 运营人员</strong>
            <small>客服意图质量运营</small>
          </div>
        </div>
      </aside>
      <div className={`nav-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
    </>
  );
}
