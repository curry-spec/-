/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, ChevronRight, Archive, Box, FileText, Plus } from 'lucide-react';
import { Channel } from '../types';
import { stages } from '../data';

interface AssetsProps {
  channel: Channel;
}

export default function Assets({ channel }: AssetsProps) {
  const [search, setSearch] = useState('');

  return (
    <div className="page">
      <div className="ah-toolbar flex gap-2 items-center mb-4">
        <div className="search-box flex-1 max-w-sm border border-gray-200 rounded px-2 py-1 flex items-center gap-2 bg-white">
          <Search size={14} className="text-gray-400" />
          <input 
            type="search" 
            placeholder="搜索功能资产"
            className="border-0 focus:ring-0 w-full text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="text-xs border-gray-200 rounded py-1 px-2">
          <option>全部链路环节</option>
          {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="text-xs border-gray-200 rounded py-1 px-2">
          <option>全部功能类型</option>
          <option>运行提示词</option>
          <option>评估提示词</option>
          <option>分类模型</option>
          <option>微调模型</option>
        </select>
        <button className="button primary small">
          <Plus size={14} />
          新增功能资产
        </button>
      </div>

      <div className="ah-caption flex justify-between text-[11px] text-gray-400 mb-4">
        <span>5 个功能资产 · 8 个数据集 · 4 份报告</span>
        <span>本机保存 · 文件共享与账号未接入</span>
      </div>

      <div className="ah-stage-grid grid grid-cols-1 md:grid-cols-2 gap-4">
        {stages.map(s => (
          <section key={s.id} className="ah-panel bg-white border border-gray-200 p-4 rounded-xl">
            <div className="ah-panel-head flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold">{s.name}</h2>
              <span className="text-xs text-gray-400">1 个功能资产</span>
            </div>
            
            <button className="ah-function w-full flex items-center gap-4 text-left p-4 hover:bg-blue-50/50 rounded-lg transition-colors border-t border-gray-50 mt-2">
              <span className="ah-function-icon w-10 h-10 bg-blue-100/50 text-blue-600 rounded-lg flex items-center justify-center">
                <Box size={20} />
              </span>
              <span className="ah-function-main flex-1 min-w-0">
                <strong className="block text-sm">FastText</strong>
                <small className="flex gap-2 items-center mt-1">
                  <span className="ah-pill bg-gray-100 px-2 py-0.5 rounded text-gray-600">模型</span>
                  <span className="text-gray-400">当前版本未标记</span>
                </small>
                <span className="block text-xs text-gray-400 mt-1">0 个关联数据集 · 0 份报告 · 更新 2026/9/8</span>
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
