/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown, 
  ChevronUp, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { Channel } from '../types';

interface BatchesProps {
  channel: Channel;
  date: string;
}

interface BatchItem {
  id: string;
  code: string;
  subType: string;
  date: string;
  source: string;
  channel: 'phone' | 'online';
  channelName: string;
  sessions: number;
  requests: number;
  status: '已完成' | '评估中' | '待评估' | '执行失败';
  completedTime: string;
  duration: string;
}

const INITIAL_BATCHES: BatchItem[] = [
  {
    id: 'b-1',
    code: 'AUTO-20260908-P',
    subType: '日常自动评估',
    date: '2026-09-08',
    source: '电话录音转写',
    channel: 'phone',
    channelName: '电话客服',
    sessions: 4800,
    requests: 12000,
    status: '已完成',
    completedTime: '09-09 08:05',
    duration: '42分18秒'
  },
  {
    id: 'b-2',
    code: 'AUTO-20260908-O',
    subType: '日常自动评估',
    date: '2026-09-08',
    source: '在线聊天记录',
    channel: 'online',
    channelName: '在线客服',
    sessions: 3200,
    requests: 8000,
    status: '已完成',
    completedTime: '09-09 08:05',
    duration: '31分45秒'
  },
  {
    id: 'b-3',
    code: 'AUTO-20260907-P',
    subType: '日常自动评估',
    date: '2026-09-07',
    source: '电话录音转写',
    channel: 'phone',
    channelName: '电话客服',
    sessions: 4750,
    requests: 11800,
    status: '已完成',
    completedTime: '09-08 08:04',
    duration: '40分50秒'
  },
  {
    id: 'b-4',
    code: 'AUTO-20260907-O',
    subType: '日常自动评估',
    date: '2026-09-07',
    source: '在线聊天记录',
    channel: 'online',
    channelName: '在线客服',
    sessions: 3180,
    requests: 7920,
    status: '已完成',
    completedTime: '09-08 08:04',
    duration: '30分12秒'
  },
  {
    id: 'b-5',
    code: 'AUTO-20260906-P',
    subType: '日常自动评估',
    date: '2026-09-06',
    source: '电话录音转写',
    channel: 'phone',
    channelName: '电话客服',
    sessions: 4690,
    requests: 11650,
    status: '已完成',
    completedTime: '09-07 08:05',
    duration: '39分55秒'
  },
  {
    id: 'b-6',
    code: 'AUTO-20260906-O',
    subType: '日常自动评估',
    date: '2026-09-06',
    source: '在线聊天记录',
    channel: 'online',
    channelName: '在线客服',
    sessions: 3220,
    requests: 8040,
    status: '已完成',
    completedTime: '09-07 08:05',
    duration: '31分08秒'
  },
  {
    id: 'b-7',
    code: 'AUTO-20260905-P',
    subType: '日常自动评估',
    date: '2026-09-05',
    source: '电话录音转写',
    channel: 'phone',
    channelName: '电话客服',
    sessions: 4810,
    requests: 12050,
    status: '已完成',
    completedTime: '09-06 08:05',
    duration: '41分20秒'
  },
  {
    id: 'b-8',
    code: 'AUTO-20260905-O',
    subType: '日常自动评估',
    date: '2026-09-05',
    source: '在线聊天记录',
    channel: 'online',
    channelName: '在线客服',
    sessions: 3190,
    requests: 7980,
    status: '已完成',
    completedTime: '09-06 08:05',
    duration: '30分40秒'
  },
  {
    id: 'b-9',
    code: 'AUTO-20260904-P',
    subType: '日常自动评估',
    date: '2026-09-04',
    source: '电话录音转写',
    channel: 'phone',
    channelName: '电话客服',
    sessions: 4780,
    requests: 11920,
    status: '已完成',
    completedTime: '09-05 08:04',
    duration: '40分10秒'
  },
  {
    id: 'b-10',
    code: 'AUTO-20260904-O',
    subType: '日常自动评估',
    date: '2026-09-04',
    source: '在线聊天记录',
    channel: 'online',
    channelName: '在线客服',
    sessions: 3210,
    requests: 8020,
    status: '已完成',
    completedTime: '09-05 08:04',
    duration: '31分15秒'
  },
  {
    id: 'b-11',
    code: 'AUTO-20260903-P',
    subType: '日常自动评估',
    date: '2026-09-03',
    source: '电话录音转写',
    channel: 'phone',
    channelName: '电话客服',
    sessions: 4820,
    requests: 12100,
    status: '已完成',
    completedTime: '09-04 08:05',
    duration: '42分05秒'
  },
  {
    id: 'b-12',
    code: 'AUTO-20260903-O',
    subType: '日常自动评估',
    date: '2026-09-03',
    source: '在线聊天记录',
    channel: 'online',
    channelName: '在线客服',
    sessions: 3250,
    requests: 8120,
    status: '已完成',
    completedTime: '09-04 08:05',
    duration: '31分30秒'
  },
  {
    id: 'b-13',
    code: 'AUTO-20260902-P',
    subType: '日常自动评估',
    date: '2026-09-02',
    source: '电话录音转写',
    channel: 'phone',
    channelName: '电话客服',
    sessions: 4790,
    requests: 11950,
    status: '已完成',
    completedTime: '09-03 08:04',
    duration: '40分45秒'
  },
  {
    id: 'b-14',
    code: 'AUTO-20260902-O',
    subType: '日常自动评估',
    date: '2026-09-02',
    source: '在线聊天记录',
    channel: 'online',
    channelName: '在线客服',
    sessions: 3240,
    requests: 8100,
    status: '已完成',
    completedTime: '09-03 08:04',
    duration: '31分20秒'
  }
];

const MANUAL_BATCHES: BatchItem[] = [
  {
    id: 'm-1',
    code: 'MANUAL-20260906-SPECIAL',
    subType: '手动导入评测',
    date: '2026-09-06',
    source: '离线测试集导入',
    channel: 'phone',
    channelName: '电话客服',
    sessions: 1200,
    requests: 3000,
    status: '已完成',
    completedTime: '09-06 16:30',
    duration: '15分20秒'
  },
  {
    id: 'm-2',
    code: 'MANUAL-20260904-GOLDEN',
    subType: '金标集回归',
    date: '2026-09-04',
    source: '标准金标数据集',
    channel: 'online',
    channelName: '在线客服',
    sessions: 800,
    requests: 2000,
    status: '已完成',
    completedTime: '09-04 14:15',
    duration: '09分50秒'
  }
];

export default function Batches({ channel: initialChannel }: BatchesProps) {
  const [tab, setTab] = useState<'daily' | 'manual'>('daily');

  // Filter States
  const [startDate, setStartDate] = useState('2026-09-02');
  const [endDate, setEndDate] = useState('2026-09-08');
  const [selectedSource, setSelectedSource] = useState('全部数据来源');
  const [selectedChannel, setSelectedChannel] = useState<string>(initialChannel || 'all');
  const [searchCode, setSearchCode] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [jumpPage, setJumpPage] = useState('1');

  // Detail View State
  const [selectedBatch, setSelectedBatch] = useState<BatchItem | null>(null);

  // Active dataset
  const activeBatches = tab === 'daily' ? INITIAL_BATCHES : MANUAL_BATCHES;

  // Filtered dataset
  const filteredBatches = useMemo(() => {
    return activeBatches.filter(item => {
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;
      if (selectedSource !== '全部数据来源' && item.source !== selectedSource) return false;
      if (selectedChannel !== 'all' && item.channel !== selectedChannel) return false;
      if (searchCode && !item.code.toLowerCase().includes(searchCode.trim().toLowerCase())) return false;
      return true;
    });
  }, [activeBatches, startDate, endDate, selectedSource, selectedChannel, searchCode]);

  // Pagination calculation
  const totalItems = filteredBatches.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedBatches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBatches.slice(start, start + pageSize);
  }, [filteredBatches, currentPage, pageSize]);

  // Summary counts
  const totalBatches = activeBatches.length;
  const completedBatches = activeBatches.filter(b => b.status === '已完成').length;
  const pendingBatches = activeBatches.filter(b => b.status === '评估中' || b.status === '待评估').length;
  const failedBatches = activeBatches.filter(b => b.status === '执行失败').length;

  const handleResetFilters = () => {
    setStartDate('2026-09-02');
    setEndDate('2026-09-08');
    setSelectedSource('全部数据来源');
    setSelectedChannel('all');
    setSearchCode('');
    setCurrentPage(1);
  };

  // If a batch is selected, render the full-page detail view matching user's image.png
  if (selectedBatch) {
    const isOnline = selectedBatch.channel === 'online';
    const parsingStepName = isOnline ? '聊天记录解析' : '录音转写解析';
    const abnormalCount = selectedBatch.code === 'AUTO-20260908-O' ? 180 : Math.round(selectedBatch.requests * 0.0225);
    const badcaseCount = selectedBatch.code === 'AUTO-20260908-O' ? 12 : Math.round(selectedBatch.sessions * 0.00375) || 12;

    const progressSteps = [
      {
        step: '数据接入',
        status: '已完成',
        startTime: `${selectedBatch.date.substring(5)} 01:00`,
        endTime: `${selectedBatch.date.substring(5)} 01:00`,
        successCount: selectedBatch.sessions.toLocaleString(),
        failCount: '0',
        failReason: '—'
      },
      {
        step: '会话完整性校验',
        status: '已完成',
        startTime: '01:00',
        endTime: '01:15',
        successCount: selectedBatch.sessions.toLocaleString(),
        failCount: '0',
        failReason: '—'
      },
      {
        step: parsingStepName,
        status: '已完成',
        startTime: '01:15',
        endTime: '03:10',
        successCount: selectedBatch.requests.toLocaleString(),
        failCount: '0',
        failReason: '—'
      },
      {
        step: 'AI 全量质检',
        status: '已完成',
        startTime: '03:10',
        endTime: '07:45',
        successCount: selectedBatch.requests.toLocaleString(),
        failCount: '0',
        failReason: '—'
      },
      {
        step: '指标计算',
        status: '已完成',
        startTime: '07:45',
        endTime: '08:00',
        successCount: selectedBatch.requests.toLocaleString(),
        failCount: '0',
        failReason: '—'
      },
      {
        step: '异常样本生成',
        status: '已完成',
        startTime: '08:00',
        endTime: '08:03',
        successCount: abnormalCount.toLocaleString(),
        failCount: '0',
        failReason: '—'
      },
      {
        step: '结果写入监控中心',
        status: '已完成',
        startTime: '08:03',
        endTime: selectedBatch.completedTime,
        successCount: selectedBatch.requests.toLocaleString(),
        failCount: '0',
        failReason: '—'
      }
    ];

    return (
      <div className="page pb-20 animate-in fade-in duration-200">
        {/* Page Title */}
        <h1 className="text-[20px] font-bold text-gray-900 mb-6">批次详情</h1>

        {/* Batch Header Bar */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedBatch(null)}
              className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer p-1.5 -ml-1 rounded hover:bg-gray-100 flex items-center justify-center"
              title="返回批次列表"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 font-mono leading-tight">
                {selectedBatch.code}
              </h2>
              <div className="text-[12px] text-gray-400 mt-1">
                {selectedBatch.subType} · {selectedBatch.source} · {selectedBatch.channelName}
              </div>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[12px] rounded border bg-emerald-50 text-emerald-600 border-emerald-200 font-medium">
            已完成
          </span>
        </div>

        {/* Card 1: 批次基本信息 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-6 mb-6">
          <h3 className="text-[15px] font-bold text-gray-900 mb-6">批次基本信息</h3>
          <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-[13px]">
            <div>
              <div className="text-gray-400 text-[12px] mb-1">批次编号</div>
              <div className="text-gray-900 font-mono font-medium">{selectedBatch.code}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">评估类型</div>
              <div className="text-gray-900 font-medium">{selectedBatch.subType}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">会话日期</div>
              <div className="text-gray-900 font-mono font-medium">{selectedBatch.date}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">数据来源</div>
              <div className="text-gray-900 font-medium">{selectedBatch.source}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">业务渠道</div>
              <div className="text-gray-900 font-medium">{selectedBatch.channelName}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">创建时间</div>
              <div className="text-gray-900 font-mono font-medium">{selectedBatch.date.substring(5)} 01:00</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">完成时间</div>
              <div className="text-gray-900 font-mono font-medium">{selectedBatch.completedTime}</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">评估模板</div>
              <div className="text-gray-900 font-medium">指标体系 V1.0</div>
            </div>
          </div>
        </div>

        {/* Card 2: 执行进度 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-6 mb-6">
          <h3 className="text-[15px] font-bold text-gray-900 mb-5">执行进度</h3>
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#D6E2FF] text-gray-500 font-medium border-b border-gray-200">
                  <th className="py-3 px-5 font-normal text-gray-400 w-[20%]">链路环节</th>
                  <th className="py-3 px-5 font-normal text-gray-400 w-[12%]">状态</th>
                  <th className="py-3 px-5 font-normal text-gray-400 w-[14%]">开始时间</th>
                  <th className="py-3 px-5 font-normal text-gray-400 w-[14%]">完成时间</th>
                  <th className="py-3 px-5 font-normal text-gray-400 w-[14%]">成功数</th>
                  <th className="py-3 px-5 font-normal text-gray-400 w-[12%]">失败数</th>
                  <th className="py-3 px-5 font-normal text-gray-400 w-[14%]">失败原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800">
                {progressSteps.map((step, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/10 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-gray-800">{step.step}</td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 text-[12px] rounded-sm border bg-emerald-50 text-emerald-600 border-emerald-100 font-medium">
                        {step.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">{step.startTime}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">{step.endTime}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-800 font-medium">{step.successCount}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-800">{step.failCount}</td>
                    <td className="py-3.5 px-5 text-gray-400">{step.failReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3: 数据统计 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-6 mb-6">
          <h3 className="text-[15px] font-bold text-gray-900 mb-6">数据统计</h3>
          <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-[13px]">
            <div>
              <div className="text-gray-400 text-[12px] mb-1">原始会话数</div>
              <div className="text-gray-900 font-mono font-medium text-[14px]">
                {selectedBatch.sessions.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">有效会话数</div>
              <div className="text-gray-900 font-mono font-medium text-[14px]">
                {selectedBatch.sessions.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">请求数</div>
              <div className="text-gray-900 font-mono font-medium text-[14px]">
                {selectedBatch.requests.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">可评估请求数</div>
              <div className="text-gray-900 font-mono font-medium text-[14px]">
                {selectedBatch.requests.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">AI 评估成功数</div>
              <div className="text-gray-900 font-mono font-medium text-[14px]">
                {selectedBatch.requests.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">评估失败数</div>
              <div className="text-gray-900 font-mono font-medium text-[14px]">0</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">异常样本数</div>
              <div className="text-gray-900 font-mono font-medium text-[14px]">
                {abnormalCount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">进入 Badcase 样本</div>
              <div className="text-gray-900 font-mono font-medium text-[14px]">
                {badcaseCount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: 评估配置 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-6 mb-6">
          <h3 className="text-[15px] font-bold text-gray-900 mb-6">评估配置</h3>
          <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-[13px]">
            <div>
              <div className="text-gray-400 text-[12px] mb-1">评估模型版本</div>
              <div className="text-gray-900 font-medium">评估模型版本待接入</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">Judge 模型 / Prompt</div>
              <div className="text-gray-900 font-medium">Judge Prompt 版本待接入</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">指标模板版本</div>
              <div className="text-gray-900 font-medium">指标体系 V1.0</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">评估规则版本</div>
              <div className="text-gray-900 font-medium">日常自动评估规则 V1.0</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">随机抽检完成 / 计划</div>
              <div className="text-gray-900 font-mono font-medium">90 / 150</div>
            </div>
            <div>
              <div className="text-gray-400 text-[12px] mb-1">定向抽检完成 / 计划</div>
              <div className="text-gray-900 font-mono font-medium">30 / 80</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render Batch List View
  return (
    <div className="page pb-20">
      {/* Top Tab Bar - Matching Badcase.tsx style */}
      <div className="bg-white border-b border-gray-200 -mx-7 -mt-6 px-7 pt-3 flex items-center mb-6">
        <div className="flex items-center gap-8">
          <button
            className={`pb-2 text-[14px] font-medium transition-all relative cursor-pointer ${
              tab === 'daily'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
            }`}
            onClick={() => {
              setTab('daily');
              setCurrentPage(1);
            }}
          >
            日常自动评估
          </button>
          <button
            className={`pb-2 text-[14px] font-medium transition-all relative cursor-pointer ${
              tab === 'manual'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
            }`}
            onClick={() => {
              setTab('manual');
              setCurrentPage(1);
            }}
          >
            手动导入评估
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Card 1: 批次总数 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-5 transition-all hover:shadow-xs">
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>批次总数</span>
            <Layers className="text-gray-400" size={16} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 font-mono tracking-tight">{totalBatches}</span>
            <span className="text-[12px] text-gray-400 font-normal">个批次</span>
          </div>
        </div>

        {/* Card 2: 已完成 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-5 transition-all hover:shadow-xs">
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>已完成</span>
            <CheckCircle2 className="text-emerald-500" size={16} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-emerald-600 font-mono tracking-tight">{completedBatches}</span>
            <span className="text-[12px] text-emerald-600/70 font-normal">个批次</span>
          </div>
        </div>

        {/* Card 3: 评估中 / 待评估 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-5 transition-all hover:shadow-xs">
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>评估中 / 待评估</span>
            <Clock className="text-blue-500" size={16} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-blue-600 font-mono tracking-tight">{pendingBatches}</span>
            <span className="text-[12px] text-blue-600/70 font-normal">个批次</span>
          </div>
        </div>

        {/* Card 4: 部分失败 / 执行失败 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-2xs p-5 transition-all hover:shadow-xs">
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>部分失败 / 执行失败</span>
            <AlertCircle className="text-amber-500" size={16} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 font-mono tracking-tight">{failedBatches}</span>
            <span className="text-[12px] text-gray-400 font-normal">个批次</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar - Matching Badcase.tsx style */}
      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-2xs mb-4">
        <div className="flex items-center gap-6 flex-wrap">
          {/* 评估日期 */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">评估日期</span>
            <input
              type="date"
              className="h-[32px] px-2.5 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-gray-400 text-[13px]">至</span>
            <input
              type="date"
              className="h-[32px] px-2.5 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* 数据来源 */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">数据来源</span>
            <select
              className="h-[32px] w-[160px] px-2 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              <option value="全部数据来源">全部数据来源</option>
              <option value="电话录音转写">电话录音转写</option>
              <option value="在线聊天记录">在线聊天记录</option>
              {tab === 'manual' && <option value="离线测试集导入">离线测试集导入</option>}
              {tab === 'manual' && <option value="标准金标数据集">标准金标数据集</option>}
            </select>
          </div>

          {/* 渠道 */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">渠道</span>
            <select
              className="h-[32px] w-[140px] px-2 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
            >
              <option value="all">全部渠道</option>
              <option value="phone">电话客服</option>
              <option value="online">在线客服</option>
            </select>
          </div>

          {/* 批次编号 */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">批次编号</span>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索批次编号"
                className="h-[32px] w-[200px] pl-8 pr-3 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-800 placeholder-gray-400"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
              />
              <Search size={14} className="text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Buttons: 查询 / 重置 */}
          <div className="ml-auto flex items-center gap-2">
            <button
              className="h-[32px] px-5 bg-[#2563eb] hover:bg-blue-700 text-white text-[13px] font-medium rounded transition-all cursor-pointer shadow-2xs"
              onClick={() => setCurrentPage(1)}
            >
              查询
            </button>
            <button
              className="h-[32px] px-5 bg-white hover:bg-gray-50 text-blue-600 border border-blue-500 text-[13px] font-medium rounded transition-all cursor-pointer"
              onClick={handleResetFilters}
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Table Container - Matching Badcase.tsx style */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#D6E2FF] text-gray-500 text-[13px] font-medium border-b border-gray-200">
              <th className="py-4 px-6 font-normal w-[22%] text-gray-400">批次编号</th>
              <th className="py-4 px-6 font-normal w-[12%] text-gray-400">评估日期</th>
              <th className="py-4 px-6 font-normal w-[15%] text-gray-400">数据来源</th>
              <th className="py-4 px-6 font-normal w-[12%] text-gray-400">渠道</th>
              <th className="py-4 px-6 font-normal w-[15%] text-gray-400">会话 / 请求</th>
              <th className="py-4 px-6 font-normal w-[10%] text-gray-400">执行状态</th>
              <th className="py-4 px-6 font-normal w-[12%] text-gray-400">完成时间</th>
              <th className="py-4 px-6 font-normal w-[8%] text-right text-gray-400">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[13px] text-gray-800">
            {paginatedBatches.length > 0 ? (
              paginatedBatches.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/10 transition-colors">
                  {/* 批次编号 */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 font-mono">{item.code}</span>
                      <span className="text-[12px] text-gray-400 mt-0.5">{item.subType}</span>
                    </div>
                  </td>
                  {/* 评估日期 */}
                  <td className="py-4 px-6 text-gray-600 font-mono">{item.date}</td>
                  {/* 数据来源 */}
                  <td className="py-4 px-6 text-gray-700">{item.source}</td>
                  {/* 渠道 */}
                  <td className="py-4 px-6 text-gray-700">
                    {item.channelName}
                  </td>
                  {/* 会话 / 请求 */}
                  <td className="py-4 px-6 font-mono text-gray-700">
                    <span className="font-semibold text-gray-900">{item.sessions.toLocaleString()}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-gray-500">{item.requests.toLocaleString()}</span>
                  </td>
                  {/* 执行状态 */}
                  <td className="py-4 px-6">
                    <span className="px-2 py-0.5 text-[12px] rounded-sm border bg-emerald-50 text-emerald-600 border-emerald-100 font-medium">
                      {item.status}
                    </span>
                  </td>
                  {/* 完成时间 */}
                  <td className="py-4 px-6 text-gray-500 font-mono text-[12.5px]">{item.completedTime}</td>
                  {/* 操作 */}
                  <td className="py-4 px-6 text-right">
                    <button 
                      className="text-blue-600 hover:text-blue-700 font-medium transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedBatch(item);
                      }}
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 text-[13px]">
                  未找到符合筛选条件的评估批次
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Footer - Exact match with Badcase.tsx */}
        <div className="bg-[#f4f5f7] py-2 px-4 flex justify-end items-center text-[13px] text-gray-600 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <span className="mr-1">共 {totalItems} 条</span>
            
            {/* Page size dropdown */}
            <div className="relative mr-2">
              <button 
                className={`flex items-center justify-between gap-1.5 border rounded px-2.5 bg-white text-gray-700 outline-none w-[100px] h-[28px] text-[12.5px] transition-all cursor-pointer ${pageSizeOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                onClick={() => setPageSizeOpen(!pageSizeOpen)}
              >
                <span>{pageSize}条/页</span>
                {pageSizeOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
              </button>
              
              {pageSizeOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[100] py-1 animate-fadeIn">
                  {[10, 20, 50, 100].map(val => (
                    <button 
                      key={val}
                      className={`w-full text-left px-3 py-1.5 text-[12.5px] hover:bg-blue-50 transition-colors cursor-pointer ${pageSize === val ? 'text-blue-600 font-bold bg-blue-50/30' : 'text-gray-600 font-normal'}`}
                      onClick={() => {
                        setPageSize(val);
                        setPageSizeOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      {val}条/页
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Page Prev Button */}
            <button 
              className={`w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${currentPage === 1 ? 'bg-[#e8e8e8] text-gray-300 cursor-not-allowed' : 'bg-[#e8e8e8] hover:bg-gray-300 text-gray-600 cursor-pointer'}`}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} />
            </button>
            
            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                className={`w-[28px] h-[28px] rounded font-medium text-[13px] cursor-pointer transition-colors ${currentPage === page ? 'bg-[#2563eb] text-white shadow-2xs' : 'bg-[#e8e8e8] hover:bg-gray-300 text-gray-700'}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            {/* Page Next Button */}
            <button 
              className={`w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${currentPage >= totalPages ? 'bg-[#e8e8e8] text-gray-300 cursor-not-allowed' : 'bg-[#e8e8e8] hover:bg-gray-300 text-gray-600 cursor-pointer'}`}
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={14} />
            </button>
            
            <span className="ml-2">前往</span>
            <input 
              type="text" 
              className="w-[38px] h-[28px] border border-gray-300 rounded text-center bg-white text-gray-800 text-[13px] outline-none focus:border-blue-500" 
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const p = parseInt(jumpPage, 10);
                  if (!isNaN(p) && p >= 1 && p <= totalPages) {
                    setCurrentPage(p);
                  }
                }
              }}
            />
            <span>页</span>
          </div>
        </div>
      </div>
    </div>
  );
}
