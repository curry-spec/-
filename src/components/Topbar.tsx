/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Menu, UserRound } from 'lucide-react';
import { View } from '../types';

interface TopbarProps {
  currentView: View;
  onMenuClick: () => void;
}

const viewLabels: Record<View, string> = {
  overview: '监控总览',
  analysis: '异常指标分析',
  badcase: 'Badcase 分析',
  batches: '评估批次',
  assets: '链路调优资产',
  validation: '验证追踪'
};

export default function Topbar({ currentView, onMenuClick }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="top-left">
        <button className="icon-button mobile-menu" onClick={onMenuClick}>
          <Menu size={16} />
        </button>
        <strong>{viewLabels[currentView]}</strong>
        <span className="divider"></span>
        <span className="muted">日常自动评估</span>
      </div>
      <div className="top-right">
        <span className="badge neutral">演示数据</span>
        <span className="user-icon" title="AI运营人员">
          <UserRound size={16} />
        </span>
      </div>
    </header>
  );
}
