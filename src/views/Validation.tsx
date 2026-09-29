/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, ChevronRight, GitCompareArrows, Plus, Download, DatabaseZap, Activity, ChartNoAxesCombined, Bug } from 'lucide-react';
import { Channel } from '../types';

interface ValidationProps {
  channel: Channel;
}

export default function Validation({ channel }: ValidationProps) {
  const [search, setSearch] = useState('');

  return (
    <div className="page">
      <div className="tracking-data-note flex items-start gap-3 bg-[#fffaf0] border-l-4 border-l-[#c68a22] border-[#e7c88d] p-4 rounded-md text-[#665123] text-xs mb-4">
        <DatabaseZap size={18} className="flex-shrink-0" />
        <div>
          <strong className="text-[#59420d] block">生产日常评估结果尚未接入</strong>
          <p className="mt-1 text-[#776536]">新建任务默认不读取原型演示批次。统一适配层仅接收日常批次；手动专项评估不混入观察结果。</p>
        </div>
      </div>

      <div className="tracking-list-head flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold">优化效果跟踪</h2>
          <p className="text-gray-400 text-xs mt-1">围绕一项优化事件，固定范围观察上线前后同口径日常评估结果。</p>
        </div>
        <button className="button primary">
          <Plus size={14} />
          新建跟踪任务
        </button>
      </div>

      <div className="tracking-summary grid grid-cols-2 sm:grid-cols-5 gap-px bg-gray-100 border border-gray-200 rounded-lg overflow-hidden mb-6">
        {[
          { label: '草稿', count: 0 },
          { label: '待观察', count: 1 },
          { label: '观察中', count: 0 },
          { label: '待总结', count: 0 },
          { label: '已结束', count: 0 },
        ].map(item => (
          <div key={item.label} className="bg-white p-4">
            <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">{item.label}</span>
            <b className="text-2xl block mt-1">{item.count}</b>
          </div>
        ))}
      </div>

      <div className="tracking-filters grid grid-cols-1 sm:grid-cols-4 gap-2 mb-6">
        <select className="text-xs border-gray-200 rounded px-2 py-2 bg-white">
          <option>正式跟踪任务</option>
          <option>隔离演示任务</option>
        </select>
        <div className="search-box flex-1 border border-gray-200 rounded px-3 py-2 flex items-center gap-2 bg-white sm:col-span-2">
          <Search size={14} className="text-gray-400" />
          <input 
            type="search" 
            placeholder="搜索任务、编号或 Badcase"
            className="border-0 focus:ring-0 w-full text-xs p-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="text-xs border-gray-200 rounded px-2 py-2 bg-white">
          <option>全部负责人</option>
        </select>
      </div>

      <section className="section">
        <div className="section-head flex justify-between items-center mb-4">
          <div className="section-title flex items-center gap-2">
            <h2 className="font-bold text-sm">跟踪任务</h2>
            <span className="badge neutral">1 项</span>
          </div>
          <small className="text-gray-400">进度、数据状态和人工结论独立记录。</small>
        </div>
        
        <div className="tracking-task-list grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="tracking-task-card bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-[14px]">补卡 / 换卡 Reranker Top1 专项回归</h3>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight">TRK-0908-01 · AI运营人员</p>
              </div>
              <div className="flex gap-1">
                <span className="badge amber">待观察</span>
                <span className="badge amber">未接入</span>
              </div>
            </div>
            
            <div className="tracking-task-meta grid grid-cols-1 gap-y-3 text-[11px] border-t border-gray-50 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-400">关联问题</span>
                <span className="font-medium">BC-k1l2m3n4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">优化对象 / 版本</span>
                <span className="font-medium">模型 · v1.9 → v2.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">上线时间</span>
                <span className="font-medium">2026-09-08 16:20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">核心指标</span>
                <span className="font-medium">Reranker Top1 准确率</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">到数天数</span>
                <span className="font-medium">0/7</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-5 pt-4 border-t border-gray-50">
              <button className="text-blue-600 text-xs font-bold flex items-center gap-1">
                查看详情 <ChevronRight size={14}/>
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
