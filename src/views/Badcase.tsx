/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { ClipboardList, ThumbsDown, Search, Filter, ChevronRight, Download, Bug, ChartNoAxesCombined } from 'lucide-react';
import { Channel } from '../types';
import { channelNames, metrics } from '../data';

interface BadcaseProps {
  channel: Channel;
  date: string;
}

export default function Badcase({ channel, date }: BadcaseProps) {
  const [source, setSource] = useState<'system' | 'agent'>('system');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const selectedMetric = metrics.find(m => m.id === 'hit') || metrics[0];

  return (
    <div className="page">
      <div className="bc-source-tabs" role="tablist">
        <button 
          className={source === 'system' ? 'selected' : ''} 
          onClick={() => setSource('system')}
        >
          <ChartNoAxesCombined size={16} />
          问题清单
        </button>
        <button 
          className={source === 'agent' ? 'selected' : ''} 
          onClick={() => setSource('agent')}
        >
          <ThumbsDown size={16} />
          坐席反馈池
          <span className="badge neutral ml-1">待接入</span>
        </button>
        <span className="ml-auto text-xs text-gray-400">发现来源与人工结论分别保留</span>
      </div>

      <div className="bc-scope bg-blue-50/30 border border-blue-100 p-3 mt-4 flex items-center gap-3 text-xs">
        {source === 'system' ? (
          <>
            <span className="text-gray-500">来自异常指标分析的样本快照</span>
            <strong className="font-bold">{selectedMetric.name}</strong>
            <small className="text-gray-400">{selectedMetric.code}</small>
            <span className="ml-auto text-gray-400 italic">Badcase 可独立筛选、复核和归因</span>
          </>
        ) : (
          <>
            <span className="text-gray-500">坐席助手 → 对具体推送内容点踩 → 进入待复核池</span>
            <button className="text-blue-600 ml-auto">查看点踩交互示例</button>
          </>
        )}
      </div>

      <div className="bc-stats mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">问题单</span>
          <b className="text-xl">2</b>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">关联记录（去重）</span>
          <b className="text-xl">18</b>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">待复核</span>
          <b className="text-xl">15</b>
        </div>
        <div className="flex flex-col items-end justify-center">
          <span className="text-xs text-gray-400">当前仅展示所选分析指标的样本</span>
        </div>
      </div>

      <div className="bc-filters mt-6 flex items-center gap-4">
        <div className="search-box flex-1 max-w-sm border border-gray-200 rounded px-3 py-1.5 flex items-center gap-2 bg-white">
          <Search size={14} className="text-gray-400" />
          <input 
            type="search" 
            placeholder="搜索样本、会话或反馈内容"
            className="border-0 focus:ring-0 w-full text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="text-xs border-gray-200 rounded p-1.5 bg-white" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="all">全部复核状态</option>
          <option value="pending">待复核</option>
          <option value="confirmed">确认反馈问题</option>
        </select>
        <button className="button small ml-auto">
          <Download size={14} />
          导出有效 Badcase
        </button>
      </div>

      <div className="table-wrap mt-4">
        <table className="bc-issue-table">
          <thead>
            <tr>
              <th>问题 / 来源指标</th>
              <th>关联时指标值 / 目标</th>
              <th>样本复核</th>
              <th>负责人 / 更新时间</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="flex flex-col gap-1">
                  <strong>Reranker Top1 准确率异常</strong>
                  <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded w-fit">BC-k1l2m3n4 · 日常自动评估</span>
                  <span className="text-[10px] text-gray-400">Reranker Top1 准确率 · HJ_RERANK_TOP1_ACC</span>
                </div>
              </td>
              <td>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">92.25%</span>
                  <span className="text-[10px] text-gray-400">目标 ≥ 93.00%</span>
                </div>
              </td>
              <td>
                <div className="flex flex-col">
                  <span className="text-xs">18 条 · 待复核 15</span>
                  <span className="text-[10px] text-gray-400">复核中 · 可导出 3</span>
                </div>
              </td>
              <td>
                <div className="flex flex-col">
                  <span className="text-xs">AI运营人员</span>
                  <span className="text-[10px] text-gray-400">2026/9/8 10:20</span>
                </div>
              </td>
              <td className="text-right">
                <button className="text-blue-600 text-xs font-medium hover:underline">查看问题</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <details className="bc-issues mt-8 bg-white border border-gray-200 rounded-lg p-4">
         <summary className="text-sm font-bold cursor-pointer">关联问题单 · 1 个</summary>
         <div className="mt-4 border-t border-gray-50 pt-2">
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors text-left">
               <span className="text-xs">BC-k1l2m3n4 · Reranker Top1 准确率异常</span>
               <span className="flex items-center gap-2 text-[10px] text-gray-400 uppercase font-bold">
                  待复核 <ChevronRight size={14}/>
               </span>
            </button>
         </div>
      </details>
    </div>
  );
}
