/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ListChecks, Search, ChevronRight, CalendarSearch } from 'lucide-react';
import { Channel } from '../types';
import { channelNames } from '../data';

interface BatchesProps {
  channel: Channel;
  date: string;
}

export default function Batches({ channel, date }: BatchesProps) {
  const [tab, setTab] = useState<'daily' | 'manual'>('daily');

  return (
    <div className="page">
      <div className="batch-summary">
        <div><span>批次总数</span><b>14</b></div>
        <div><span>已完成</span><b>14</b></div>
        <div><span>评估中 / 待评估</span><b>0</b></div>
        <div><span>部分失败 / 执行失败</span><b>0</b></div>
      </div>

      <div className="batch-filters bg-white border border-gray-200 p-4 rounded-lg">
        <div className="batch-tabs flex gap-4 border-b border-gray-100 mb-4">
          <button 
            className={`pb-2 text-xs relative ${tab === 'daily' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setTab('daily')}
          >
            日常自动评估
          </button>
          <button 
            className={`pb-2 text-xs relative ${tab === 'manual' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setTab('manual')}
          >
            手动导入评估
          </button>
        </div>

        <div className="batch-filter-row flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>评估日期</span>
            <input type="date" defaultValue="2026-09-02" className="border-gray-200 rounded py-1 px-2" />
            <span>至</span>
            <input type="date" defaultValue="2026-09-08" className="border-gray-200 rounded py-1 px-2" />
          </div>
          <select className="text-xs border-gray-200 rounded py-1 px-2">
            <option>全部数据来源</option>
            <option>电话录音转写</option>
            <option>在线聊天记录</option>
          </select>
          <select className="text-xs border-gray-200 rounded py-1 px-2" value={channel} onChange={() => {}}>
            <option value="all">全部渠道</option>
            <option value="phone">电话客服</option>
            <option value="online">在线客服</option>
          </select>
          <div className="search-box flex-1 min-w-[200px] border border-gray-200 rounded px-2 py-1 flex items-center gap-2 bg-white">
            <Search size={14} className="text-gray-400" />
            <input 
              type="search" 
              placeholder="搜索批次编号"
              className="border-0 focus:ring-0 w-full text-xs"
            />
          </div>
        </div>
      </div>

      <section className="section mt-6">
        <div className="section-head mb-4 flex justify-between items-center">
          <div className="section-title">
            <h2 className="text-sm font-bold">批次列表</h2>
            <small className="text-gray-400 block mt-1">日常批次评估前一天会话；手动导入批次独立统计</small>
          </div>
          <span className="badge neutral">14 条</span>
        </div>
        <div className="table-wrap">
          <table className="batch-table">
            <thead>
              <tr>
                <th>批次编号</th>
                <th>评估日期</th>
                <th>数据来源</th>
                <th>渠道</th>
                <th>会话 / 请求</th>
                <th>执行状态</th>
                <th>完成时间</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>AUTO-20260908-P</strong>
                  <span className="subline">T+1 自动任务</span>
                </td>
                <td>2026-09-08</td>
                <td>电话录音转写</td>
                <td>电话客服</td>
                <td>4,800 / 12,000</td>
                <td><span className="badge green">已完成</span></td>
                <td>09-09 08:05</td>
                <td>
                  <button className="text-button">查看详情 <ChevronRight size={12}/></button>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>AUTO-20260908-O</strong>
                  <span className="subline">T+1 自动任务</span>
                </td>
                <td>2026-09-08</td>
                <td>在线聊天记录</td>
                <td>在线客服</td>
                <td>3,200 / 8,000</td>
                <td><span className="badge green">已完成</span></td>
                <td>09-09 08:05</td>
                <td>
                  <button className="text-button">查看详情 <ChevronRight size={12}/></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
