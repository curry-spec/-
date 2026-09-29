/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useRef } from 'react';
import { 
  Download, 
  Activity, 
  CheckCircle, 
  TriangleAlert, 
  Info, 
  ChevronRight, 
  ChevronLeft,
  ArrowUpRight, 
  Search, 
  BarChart3, 
  Flame, 
  AlertCircle, 
  FileText,
  Clock,
  LayoutGrid,
  Calendar,
  Filter,
  BrainCircuit,
  TextCursorInput
} from 'lucide-react';
import { Channel, Metric, BatchData } from '../types';
import { baseData, metrics, stages, channelNames, dailyTrends } from '../data';
import Drawer from '../components/Drawer';
import { AreaChart, Area, LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const name = entry.name;
    const value = entry.value;

    let formattedDate = label;
    if (label && label.includes('-')) {
      formattedDate = `2026-${label}`;
    }

    let isPass = true;
    if (name === '误拦截率') {
      isPass = value <= 0.5;
    } else if (name === '漏拦截率') {
      isPass = value <= 1.0;
    } else if (name === '模型与 Judge 操作集合一致率') {
      isPass = value >= 98.0;
    } else if (name === '模型-Judge 端到端代理准确率') {
      isPass = value >= 95.0;
    } else if (name === 'RRF 前K命中率') {
      isPass = value >= 92.0;
    } else if (name === 'Reranker Top1 准确率') {
      isPass = value >= 90.0;
    } else if (name === 'Reranker 直出意图准确率') {
      isPass = value >= 95.0;
    } else if (name === '意图识别准确率') {
      isPass = value >= 96.0;
    } else if (name === '拒识命中率') {
      isPass = value >= 95.0;
    } else if (name === '全过程平均耗时') {
      isPass = value <= 750;
    }

    const unit = name === '全过程平均耗时' ? 'ms' : '%';
    const passStatusText = isPass ? '达标' : '不达标';

    return (
      <div className="bg-white text-gray-900 text-[13.5px] px-2.5 py-1 border border-gray-900 shadow-sm whitespace-nowrap pointer-events-none z-50">
        <span>{formattedDate} · {name}: {typeof value === 'number' ? value.toFixed(2) : value}{unit} · {passStatusText}</span>
      </div>
    );
  }
  return null;
};

interface OverviewProps {
  channel: Channel;
  date: string;
  onChannelChange: (c: Channel) => void;
  onDateChange: (d: string) => void;
}

export default function Overview({ channel, date, onChannelChange, onDateChange }: OverviewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; eyebrow: string; content: React.ReactNode } | null>(null);
  const [chartMode, setChartMode] = useState<'quality' | 'latency'>('quality');
  const [scrollRatio, setScrollRatio] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  const [activeQualityLegends, setActiveQualityLegends] = useState<string[]>([
    '误拦截率',
    '漏拦截率',
    '模型与 Judge 操作集合一致率',
    '模型-Judge 端到端代理准确率',
    'RRF 前K命中率',
    'Reranker Top1 准确率',
    'Reranker 直出意图准确率',
    '意图识别准确率',
    '拒识命中率'
  ]);
  const [activeLatencyLegends, setActiveLatencyLegends] = useState<string[]>(['全过程平均耗时']);

  const [timeRange, setTimeRange] = useState('近7天');
  const [startDate, setStartDate] = useState('2026-08-10');
  const [endDate, setEndDate] = useState('2026-09-08');

  const durationDays = useMemo(() => {
    if (timeRange === '昨日') return 1;
    if (timeRange === '近7天') return 7;
    if (timeRange === '近30天') return 30;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }, [timeRange, startDate, endDate]);

  // Dedicated dynamic timeline trend chart data matching the chosen days count exactly
  const trendChartData = useMemo(() => {
    const results = [];
    const baseTrends = [
      { date: '09-02', '全过程准确率': 93.1, '误拦截率': 4.1, '漏拦截率': 21.0, '模型与 Judge 操作集合一致率': 97.0, '模型-Judge 端到端代理准确率': 97.2, 'RRF 前K命中率': 97.4, 'Reranker Top1 准确率': 94.3, 'Reranker 直出意图准确率': 94.6, '意图识别准确率': 97.6, '拒识命中率': 90.0, '全过程人工标注准确率': 96.2, '评估模型准确率': 94.5, '全过程平均耗时': 702 },
      { date: '09-03', '全过程准确率': 92.8, '误拦截率': 4.3, '漏拦截率': 21.2, '模型与 Judge 操作集合一致率': 97.1, '模型-Judge 端到端代理准确率': 97.3, 'RRF 前K命中率': 97.5, 'Reranker Top1 准确率': 94.4, 'Reranker 直出意图准确率': 94.5, '意图识别准确率': 97.7, '拒识命中率': 90.1, '全过程人工标注准确率': 95.8, '评估模型准确率': 94.2, '全过程平均耗时': 696 },
      { date: '09-04', '全过程准确率': 93.4, '误拦截率': 4.5, '漏拦截率': 21.5, '模型与 Judge 操作集合一致率': 97.0, '模型-Judge 端到端代理准确率': 97.1, 'RRF 前K命中率': 97.3, 'Reranker Top1 准确率': 94.2, 'Reranker 直出意图准确率': 94.7, '意图识别准确率': 97.5, '拒识命中率': 89.9, '全过程人工标注准确率': 96.5, '评估模型准确率': 94.8, '全过程平均耗时': 712 },
      { date: '09-05', '全过程准确率': 93.7, '误拦截率': 4.8, '漏拦截率': 21.8, '模型与 Judge 操作集合一致率': 97.2, '模型-Judge 端到端代理准确率': 97.4, 'RRF 前K命中率': 97.6, 'Reranker Top1 准确率': 94.5, 'Reranker 直出意图准确率': 94.8, '意图识别准确率': 97.8, '拒识命中率': 90.2, '全过程人工标注准确率': 96.1, '评估模型准确率': 94.1, '全过程平均耗时': 725 },
      { date: '09-06', '全过程准确率': 93.9, '误拦截率': 4.9, '漏拦截率': 21.6, '模型与 Judge 操作集合一致率': 97.3, '模型-Judge 端到端代理准确率': 97.5, 'RRF 前K命中率': 97.7, 'Reranker Top1 准确率': 94.6, 'Reranker 直出意图准确率': 94.9, '意图识别准确率': 97.9, '拒识命中率': 90.3, '全过程人工标注准确率': 95.9, '评估模型准确率': 94.6, '全过程平均耗时': 731 },
      { date: '09-07', '全过程准确率': 93.5, '误拦截率': 4.7, '漏拦截率': 21.4, '模型与 Judge 操作集合一致率': 97.1, '模型-Judge 端到端代理准确率': 97.3, 'RRF 前K命中率': 97.5, 'Reranker Top1 准确率': 94.4, 'Reranker 直出意图准确率': 94.7, '意图识别准确率': 97.7, '拒识命中率': 90.1, '全过程人工标注准确率': 96.3, '评估模型准确率': 95.0, '全过程平均耗时': 710 },
      { date: '09-08', '全过程准确率': 92.95, '误拦截率': 5.8, '漏拦截率': 22.0, '模型与 Judge 操作集合一致率': 97.0, '模型-Judge 端到端代理准确率': 97.2, 'RRF 前K命中率': 97.4, 'Reranker Top1 准确率': 94.3, 'Reranker 直出意图准确率': 94.6, '意图识别准确率': 97.6, '拒识命中率': 90.0, '全过程人工标注准确率': 96.25, '评估模型准确率': 94.5, '全过程平均耗时': 725 }
    ];

    let endDateObj = new Date(endDate);
    let startDateObj = new Date(endDateObj.getTime() - (durationDays - 1) * 24 * 60 * 60 * 1000);

    if (timeRange === '自定义') {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
    }

    const daysCount = durationDays;
    const seed = startDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 
                 endDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    for (let i = 0; i < daysCount; i++) {
      const currentDate = new Date(startDateObj.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      
      const matchedBase = baseTrends.find(b => b.date === dateStr);
      if (matchedBase) {
        results.push(matchedBase);
      } else {
        const noise = (Math.sin(seed + i) * 0.05);
        results.push({
          date: dateStr,
          '全过程准确率': Number((93.1 * (1.0 + noise)).toFixed(2)),
          '误拦截率': Number((4.1 * (1.0 + noise)).toFixed(2)),
          '漏拦截率': Number((21.0 * (1.0 + noise)).toFixed(2)),
          '模型与 Judge 操作集合一致率': Number((97.0 * (1.0 + noise)).toFixed(2)),
          '模型-Judge 端到端代理准确率': Number((97.2 * (1.0 + noise)).toFixed(2)),
          'RRF 前K命中率': Number((97.4 * (1.0 + noise)).toFixed(2)),
          'Reranker Top1 准确率': Number((94.3 * (1.0 + noise)).toFixed(2)),
          'Reranker 直出意图准确率': Number((94.6 * (1.0 + noise)).toFixed(2)),
          '意图识别准确率': Number((97.6 * (1.0 + noise)).toFixed(2)),
          '拒识命中率': Number((90.0 * (1.0 + noise)).toFixed(2)),
          '全过程人工标注准确率': Number((96.2 * (1.0 + noise)).toFixed(2)),
          '评估模型准确率': Number((94.5 * (1.0 + noise)).toFixed(2)),
          '全过程平均耗时': Math.round(710 * (1.0 + noise))
        });
      }
    }
    return results;
  }, [timeRange, startDate, endDate, durationDays]);

  const displayMetrics = useMemo(() => {
    return metrics.map(m => {
      if ((m.id === 'manual' || m.id === 'judge') && timeRange === '自定义') {
        return { ...m, provided: false };
      }
      return m;
    });
  }, [timeRange]);

  const rangeMultiplier = useMemo(() => {
    return durationDays / 7;
  }, [durationDays]);

  const { currentData, prevData } = useMemo(() => {
    const selected = (channel === 'all' ? ['phone', 'online'] : [channel]) as ('phone' | 'online')[];
    const aggregated = selected.map(c => ({ ...baseData[c] }));
    const out: BatchData = { ...aggregated[0] };
    if (aggregated.length > 1) {
      Object.keys(out).forEach(key => {
        const k = key as keyof BatchData;
        if (k !== 'latency') {
          out[k] = aggregated.reduce((sum, d) => sum + (d[k] || 0), 0);
        }
      });
      out.latency = aggregated.reduce((sum, d) => sum + d.latency * d.total, 0) / out.total;
    }

    const noiseSeed = startDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 
                      endDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const noise = (Math.sin(noiseSeed) * 0.05) + 1.0; 
    
    const current: BatchData = { ...out };
    Object.keys(current).forEach(key => {
      const k = key as keyof BatchData;
      if (k !== 'latency') {
        current[k] = Math.round(current[k] * rangeMultiplier * noise);
      }
    });

    // Mock previous period data
    const prevNoise = (Math.sin(noiseSeed + 1) * 0.05) + 1.0;
    const prev: BatchData = { ...out };
    Object.keys(prev).forEach(key => {
      const k = key as keyof BatchData;
      if (k !== 'latency') {
        prev[k] = Math.round(prev[k] * rangeMultiplier * prevNoise * 0.98); 
      } else {
        prev.latency = prev.latency * 1.02; 
      }
    });

    return { currentData: current, prevData: prev };
  }, [channel, rangeMultiplier, startDate, endDate]);

  const data = currentData;

  const filteredDailyTrends = useMemo(() => {
    const seed = startDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 
                 endDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use exact durationDays. For 'Yesterday', points = 1.
    const points = durationDays; 
    const results = [];
    const base = dailyTrends[0];
    
    for (let i = 0; i < points; i++) {
      const newDay = { ...base };
      const date = new Date(new Date(endDate).getTime() - (points - 1 - i) * 24 * 60 * 60 * 1000);
      newDay.date = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const rangeNoise = (timeRange === '昨日' ? 0.95 : 1.0);
      Object.keys(base).forEach(key => {
        if (typeof base[key as keyof typeof base] === 'number') {
          const dateVar = (Math.sin(seed + i) * 0.05);
          // @ts-ignore
          newDay[key] = Number((base[key] * (1.0 + dateVar) * rangeNoise).toFixed(2));
        }
      });
      results.push(newDay);
    }
    return results;
  }, [timeRange, startDate, endDate, durationDays]);

  const fails = useMemo(() => {
    return displayMetrics.filter(m => {
      if (m.target === undefined) return false;
      const val = m.id === 'latency' ? data.latency : (data[m.n as keyof BatchData] as number / (data[m.d as keyof BatchData] as number)) * 100;
      return typeof m.target === 'number' ? (m.dir === 'lt' ? val > m.target : val < m.target) : false;
    });
  }, [data, displayMetrics]);

  const colors = [
    '#cf1322', '#1890ff', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16', '#faad14', '#52c41a', '#a0d911'
  ];

  const handleStageClick = (stageId?: string) => {
    if (!stageId) return;
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    const dateStr = filteredDailyTrends[filteredDailyTrends.length - 1]?.date ? `2026-${filteredDailyTrends[filteredDailyTrends.length - 1].date}` : '2026-09-08';
    const eyebrowStr = `${dateStr} · ${channel === 'all' ? '全部渠道' : channelNames[channel]}`;

    // Get core metrics of this stage
    const stageMetrics = displayMetrics.filter(m => m.stage === stageId);

    // Static mapping of aux values
    const auxValues: Record<string, string> = {
      // Filter stage
      'TG-ACC': '89.40%',
      'TG-RECALL': '94.14%',
      'TG-FBR': '5.86%',
      'TG-SAFE': '85.14%',
      'TG-TYPE': '91.50%',
      'TG-LOWCONF': '3.84%',
      'TG-RT-MAX': '92 ms',
      'TG-RT-MIN': '1 ms',
      'TG-RT-AVG': '12 ms',

      // Rewrite stage
      'QR-E2E-PROXY-ACC': '97.24%',
      'QR-OP-SET-MATCH': '97.03%',
      'QR-SF-PASS': '94.20%',
      'QR-EG-PASS': '92.50%',
      'QR-SI-PASS': '96.12%',
      'QR-JUDGE-COVERAGE': '100.00%',
      'QR-RT-MIN': '15 ms',
      'QR-RT-AVG': '420 ms',
      'QR-RT-MAX': '1480 ms',

      // Retrieval stage
      'HJ_SPARSE_HIT_AT_K': '91.20%',
      'HJ_VECTOR_HIT_AT_K': '95.10%',
      'HJ_RRF_HIT_AT_K': '97.43%',
      'HJ_RERANK_TOP1_ACC': '94.50%',
      'HJ_DIRECT_RETURN_ACC': '94.62%',
      'HJ_DIRECT_RETURN_RATE': '12.40%',
      'HJ_RERANK_HIT_AT_K': '98.10%',
      'HJ_ZERO_CANDIDATE_RATE': '0.12%',
      'HJ_TOTAL_LATENCY': '208 ms',
      'HJ_EMBEDDING_LATENCY': '15 ms',
      'HJ_SPARSE_LATENCY': '32 ms',
      'HJ_VECTOR_LATENCY': '45 ms',
      'HJ_RERANK_LATENCY': '116 ms',

      // LLM stage
      'LLM-FORMAT': '99.80%',
      'LLM-SCORE': '94.50%',
      'LLM-CONF': '92.40%',
      'LLM-RT': '460 ms'
    };

    setDrawerContent({
      title: `${stage.name} · 指标详情`,
      eyebrow: eyebrowStr,
      content: (
        <div className="drawer-inner pb-8 animate-fadeIn">
          {/* Core Metrics Section */}
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-gray-900 mb-4">核心指标</h3>
            <div className="space-y-4">
              {stageMetrics.map(m => {
                const isFail = fails.includes(m);
                const val = m.id === 'latency' ? data.latency : (data[m.n as keyof BatchData] as number / (data[m.d as keyof BatchData] as number)) * 100;
                return (
                  <div 
                    key={m.id} 
                    className="flex justify-between items-center group cursor-pointer py-1.5 hover:bg-gray-50 rounded px-1 transition-colors"
                    onClick={() => handleMetricClick(m)}
                  >
                    <span className="text-[13px] text-gray-900 font-medium group-hover:underline">
                      {m.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] text-gray-800 font-medium">{val.toFixed(2)}{m.unit || '%'}</span>
                      {m.target === undefined ? (
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded font-medium">目标待确认</span>
                      ) : (
                        <span className={`px-1.5 py-0.5 ${isFail ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'} text-[10px] rounded font-medium`}>
                          {isFail ? '未达标' : '达标'}
                        </span>
                      )}
                      <ChevronRight size={14} className="text-gray-400 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-100 my-5"></div>

          {/* Auxiliary Section */}
          <div className="mb-8">
            <h3 className="text-[14px] font-bold text-gray-900 mb-4">辅助诊断指标</h3>
            <div className="space-y-4">
              {stage.aux?.map(([code, name], idx) => {
                const rawVal = auxValues[code] || '未接入';
                const valStr = rawVal === '未接入' ? '--' : rawVal;
                return (
                  <div key={idx} className="flex justify-between items-center py-1.5">
                    <div className="flex flex-col">
                      <span className="text-[13px] text-gray-800 font-normal">{name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{code}</span>
                    </div>
                    <span className={`text-[13px] ${valStr === '--' ? 'text-gray-400 font-normal' : 'text-gray-800 font-medium'}`}>
                      {valStr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )
    });
    setDrawerOpen(true);
  };

  const handleMetricClick = (m: Metric) => {
    const val = m.id === 'latency' ? data.latency : (data[m.n as keyof BatchData] as number / (data[m.d as keyof BatchData] as number)) * 100;
    const isFail = fails.includes(m);
    
    const num1 = m.n ? (data[m.n as keyof BatchData] as number) : undefined;
    const num2 = m.d ? (data[m.d as keyof BatchData] as number) : undefined;

    const dateStr = filteredDailyTrends[filteredDailyTrends.length - 1]?.date ? `2026-${filteredDailyTrends[filteredDailyTrends.length - 1].date}` : '2026-09-08';
    const eyebrowStr = `${m.code || 'CODE'} · ${dateStr} · ${channel === 'all' ? '全部渠道' : channelNames[channel]}`;

    const isKPI = m.id === 'e2e' || m.id === 'manual' || m.id === 'judge' || m.id === 'latency' || m.name === '全过程准确率' || m.name === '全过程人工标注准确率' || m.name === '评估模型准确率' || m.name === '全过程平均耗时';

    setDrawerContent({
      title: m.name,
      eyebrow: eyebrowStr,
      content: (
        <div className="drawer-inner pb-8">
          {/* Badges Row */}
          <div className="flex gap-2 items-center mb-6">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-medium rounded">
              {isKPI ? '全链路核心指标' : '模块核心指标'}
            </span>
            {m.target === undefined ? (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded">目标待确认</span>
            ) : (
              <span className={`px-2 py-0.5 ${isFail ? 'bg-red-50 text-red-500 font-semibold' : 'bg-green-50 text-green-600'} text-[11px] font-medium rounded`}>
                {isFail ? '未达标' : '达标'}
              </span>
            )}
          </div>

          {/* Large main value */}
          <div className="text-[44px] font-bold text-gray-900 mb-6 leading-none tracking-tight">
            {m.provided === false ? (
              "未提供"
            ) : m.id === 'latency' ? (
              `${val.toFixed(0)} ${m.unit || 'ms'}`
            ) : (
              `${val.toFixed(2)}${m.unit || '%'}`
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-8 pb-6 border-b border-gray-100">
            <div>
              <div className="text-[12px] text-gray-400 mb-1">分子 / 分母或统计样本</div>
              <div className="text-[14px] text-gray-800 font-normal">
                {m.id === 'latency' ? (
                  `${data.total?.toLocaleString()} 次请求`
                ) : (
                  `${num1?.toLocaleString() || '0'} / ${num2?.toLocaleString() || '0'}`
                )}
              </div>
            </div>
            <div>
              <div className="text-[12px] text-gray-400 mb-1">目标</div>
              <div className="text-[14px] text-gray-800 font-normal">
                {m.target === undefined ? '待确认' : `${m.dir === 'gt' ? '≥' : '≤'} ${m.target}${m.unit || '%'}`}
              </div>
            </div>
          </div>

          {/* 统计口径 Section */}
          <div className="mb-8 pb-6 border-b border-gray-100">
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">统计口径</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
              {m.definition || '格式合法、文本质量通过且模型与 Judge 操作集合一致的样本比例。'}
            </p>
            {isKPI && m.hint && (
              <div className="bg-[#f0f5ff] border-l-4 border-[#1890ff] p-4 rounded-r text-[12.5px] text-gray-600 leading-relaxed mt-3">
                {m.hint}
              </div>
            )}
          </div>

          {isKPI ? (
            /* Historical Trend Section only for core KPIs */
            <div className="mb-8">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">历史趋势</h3>
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={filteredDailyTrends.map(d => ({ date: d.date, v: d[m.name as keyof typeof d] || 0 }))}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id={`grad-drawer-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      interval="preserveStartEnd"
                      ticks={Array.from(new Set([filteredDailyTrends[0]?.date, filteredDailyTrends[filteredDailyTrends.length-1]?.date].filter(Boolean)))}
                      tick={{ fill: '#8c8c8c' }}
                      dy={10}
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="v" 
                      stroke="#1890ff" 
                      fill={`url(#grad-drawer-${m.id})`} 
                      strokeWidth={2}
                      dot={timeRange === '昨日' || (filteredDailyTrends.length === 1) ? { r: 4, fill: '#1890ff' } : false}
                      activeDot={{ r: 4, fill: '#1890ff', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            /* Diagnostic Clues only for modular/aux metrics */
            <div className="mb-8 pb-6 border-b border-gray-100">
              <h3 className="text-[15px] font-bold text-gray-900 mb-3">诊断线索</h3>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-4">
                {m.hint || '按混淆矩阵标签核查相关样本。'}
              </p>
              <div className="bg-[#f5f8fc] border-l-4 border-[#92aed6] p-4 rounded-r text-[12.5px] text-gray-600 leading-relaxed">
                当前为待分析线索，尚未形成已确认根因。
              </div>
            </div>
          )}

          {/* Stage Link Row */}
          {!isKPI && m.stage && (
            <div 
              className="py-3 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-1 rounded transition-colors mb-8"
              onClick={() => handleStageClick(m.stage)}
            >
              <span className="text-[13px] font-medium text-gray-700">
                {stages.find(s => s.id === m.stage)?.name || '前置过滤'} · 辅助指标
              </span>
              <ChevronRight size={15} className="text-gray-400" />
            </div>
          )}

          {/* Action Button */}
          <div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded flex items-center gap-2 text-sm shadow-sm transition-all">
              <BarChart3 size={15} />
              <span>进入异常指标分析</span>
            </button>
          </div>
        </div>
      )
    });
    setDrawerOpen(true);
  };

  return (
    <div className="page pb-20">
      <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-100 mb-6 -mx-5 bg-white -mt-6">
        <span className="text-[12px] text-gray-400">最近浏览:</span>
        <div className="flex gap-2">
          {['视频首页', '知识首页', '知识地图', '问答专区'].map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-500 cursor-pointer hover:bg-gray-100">{tag}</span>
          ))}
          <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-600 font-medium">监控总览</span>
        </div>
      </div>

      <div className="flex justify-between items-center px-5 mb-4">
        <h1 className="text-xl font-bold text-gray-800">意图识别链路监控</h1>
      </div>

      <div className="px-5">
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-item">
              <div className="time-group">
                {['昨日', '近7天', '近30天', '自定义'].map(p => (
                  <button 
                    key={p} 
                    className={`time-option ${timeRange === p ? 'active' : ''}`}
                    onClick={() => setTimeRange(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-item">
              <span className="filter-label">会话日期</span>
              <div className="date-input-container">
                <div className={`date-box ${timeRange !== '自定义' ? 'disabled' : ''}`}>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={timeRange !== '自定义'}
                  />
                  <Calendar size={14} />
                </div>
                <span className="text-gray-400">至</span>
                <div className={`date-box ${timeRange !== '自定义' ? 'disabled' : ''}`}>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={timeRange !== '自定义'}
                  />
                  <Calendar size={14} />
                </div>
              </div>
            </div>

            <div className="filter-item">
              <span className="filter-label">渠道选择</span>
              <select className="filter-input" value={channel} onChange={(e) => onChannelChange(e.target.value as Channel)}>
                <option value="all">全部渠道</option>
                <option value="phone">电话客服</option>
                <option value="online">在线客服</option>
              </select>
            </div>

            <div className="ml-auto">
              <button className="button primary">
                导出指标
              </button>
            </div>
          </div>
        </div>
        <div className="summary-band mt-6">
          {displayMetrics.slice(0, 4).map((m, idx) => {
            const num1 = m.n ? (data[m.n as keyof BatchData] as number) : undefined;
            const num2 = m.d ? (data[m.d as keyof BatchData] as number) : undefined;

            const prevNum1 = m.n ? (prevData[m.n as keyof BatchData] as number) : undefined;
            const prevNum2 = m.d ? (prevData[m.d as keyof BatchData] as number) : undefined;

            const val = m.id === 'latency' ? (
              data.latency.toFixed(0)
            ) : m.unit === '次' ? (
              num1?.toLocaleString() || '0'
            ) : (
              num1 !== undefined && num2 !== undefined ? ((num1 / num2) * 100).toFixed(2) : '0.00'
            );

            const prevVal = m.id === 'latency' ? (
              prevData.latency
            ) : (prevNum1 !== undefined && prevNum2 !== undefined) ? (
              (prevNum1 / prevNum2) * 100
            ) : undefined;

            const currentValNum = m.id === 'latency' ? data.latency : (num1 !== undefined && num2 !== undefined ? (num1 / num2) * 100 : 0);
            const isFail = fails.includes(m);
            
            let diffText = '';
            let isIncrease = true;
            if (prevVal !== undefined) {
              const diff = currentValNum - prevVal;
              isIncrease = diff >= 0;
              diffText = `${isIncrease ? '+' : ''}${diff.toFixed(2)}${m.id === 'latency' ? 'ms' : '%'}`;
            }
            
            return (
              <button key={m.id} className="summary-metric group text-left" onClick={() => handleMetricClick(m)}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[14px] text-[#595959] font-normal">{m.name}</span>
                  <Info size={16} className="text-[#bfbfbf]" />
                </div>
                
                {m.provided === false ? (
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[32px] font-bold text-[#262626] leading-none">--</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-[32px] font-bold ${isFail ? 'text-red-500' : 'text-[#262626]'} leading-none`}>{val}</span>
                    <span className={`text-[14px] ${isFail ? 'text-red-500' : 'text-[#262626]'}`}>{m.unit || '%'}</span>
                  </div>
                )}

                <div className="text-[12px] text-[#8c8c8c] mb-4">
                  {m.provided !== false && num1 !== undefined && num2 !== undefined ? (
                    `期间汇总 · ${num1.toLocaleString()} / ${num2.toLocaleString()}`
                  ) : m.provided !== false ? (
                    `期间汇总 · 数据计算中`
                  ) : (
                    <div className="h-[18px]" /> // Placeholder for empty
                  )}
                </div>

                <div className="sparkline-container h-[42px] mb-3 -mx-1">
                  {m.provided !== false && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredDailyTrends.map((d) => ({ v: d[m.name as keyof typeof d] || 0 }))}>
                        <defs>
                          <linearGradient id={`grad-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1890ff" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#1890ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <YAxis hide domain={['auto', 'auto']} />
                        <Area 
                          type="monotone" 
                          dataKey="v" 
                          stroke="#69b1ff" 
                          fill={`url(#grad-${m.id})`} 
                          strokeWidth={2} 
                          dot={timeRange === '昨日' ? { r: 4, fill: '#1890ff' } : false}
                          activeDot={{ r: 4, fill: '#1890ff', strokeWidth: 2, stroke: '#fff' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                <div className="text-[12px] text-[#bfbfbf] mt-auto">
                  {m.provided !== false ? (
                    (diffText && timeRange !== '自定义') ? (
                      <>
                        上一等长期间 
                        <span className={`ml-1 font-medium ${isIncrease ? (m.dir === 'gt' ? 'text-green-500' : 'text-red-500') : (m.dir === 'gt' ? 'text-red-500' : 'text-green-500')}`}>
                          {diffText}
                        </span>
                      </>
                    ) : (
                      "上一等长期间暂无可比数据"
                    )
                  ) : (
                    <div className="h-[18px]" /> // Placeholder for empty
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <section className="section mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="font-bold text-base">各环节看板主指标</h2>
            <small className="text-gray-400 ml-2">9 项核心链路环节指标</small>
          </div>
          
          {/* Unified 4-Stage Column Cards Layout */}
          <div className="grid grid-cols-4 gap-4 mt-4">
            {stages.map((s) => {
              const stageFails = displayMetrics.filter(m => m.stage === s.id && fails.includes(m));
              const stageMetrics = displayMetrics.filter(m => m.stage === s.id);
              
              return (
                <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between h-[430px]">
                  {/* Card Header */}
                  <div className="border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg ${
                          s.id === 'filter' ? 'bg-blue-50 text-blue-600' :
                          s.id === 'rewrite' ? 'bg-green-50 text-green-600' :
                          s.id === 'retrieval' ? 'bg-amber-50 text-amber-500' :
                          'bg-purple-50 text-purple-600'
                        } flex items-center justify-center`}>
                          {s.id === 'filter' && <Filter size={18} />}
                          {s.id === 'rewrite' && <TextCursorInput size={18} />}
                          {s.id === 'retrieval' && <Search size={18} />}
                          {s.id === 'llm' && <BrainCircuit size={18} />}
                        </div>
                        <strong className="text-sm font-bold text-gray-900">{s.name}</strong>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        stageFails.length > 0 
                          ? 'bg-red-50 text-red-500 font-semibold' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {stageFails.length ? `${stageFails.length} 项出现异常` : '无单日异常'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-2 font-normal pl-0">
                      {s.caption}
                    </div>
                  </div>

                  {/* Card Body - Metric List */}
                  <div className="flex-1 divide-y divide-gray-50">
                    {stageMetrics.map((m) => {
                      const val = (data[m.n as keyof BatchData] as number / (data[m.d as keyof BatchData] as number)) * 100;
                      const isFail = fails.includes(m);
                      
                      // Calculate abnormal days count
                      const totalDays = filteredDailyTrends.length;
                      let abnormalDays = 0;
                      if (m.target !== undefined && typeof m.target === 'number') {
                        const targetNum = m.target as number;
                        filteredDailyTrends.forEach(d => {
                          const dailyVal = d[m.name as keyof typeof d] as number;
                          if (dailyVal !== undefined && dailyVal !== null) {
                            const isDayFail = m.dir === 'lt' ? dailyVal > targetNum : dailyVal < targetNum;
                            if (isDayFail) abnormalDays++;
                          }
                        });
                      }

                      const statusText = m.target === undefined ? '目标待确认' : (isFail ? '未达标' : '达标');
                      const targetText = m.target === undefined ? '待确认' : `${m.dir === 'gt' ? '≥' : '≤'} ${m.target}%`;

                      return (
                        <button 
                          key={m.id} 
                          className="w-full text-left py-3.5 hover:bg-gray-50/50 px-1 rounded-md transition-all block group"
                          onClick={() => handleMetricClick(m)}
                        >
                          <div className="flex justify-between items-center gap-1.5">
                            {/* Left Column */}
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors" title={m.name}>
                                {m.name}
                              </div>
                              <div className="text-[10.5px] font-mono text-gray-400 mt-0.5 uppercase tracking-wider">
                                {m.code || 'CODE'}
                              </div>
                              <div className="text-[10.5px] text-gray-400 mt-1 flex items-center gap-1.5 font-normal">
                                <span>异常 {abnormalDays}/{totalDays} 天</span>
                                <span className="text-gray-300">·</span>
                                <span>目标 {targetText}</span>
                              </div>
                            </div>

                            {/* Right Column (Only keeping the main performance value) */}
                            <div className="flex-shrink-0 text-right">
                              <div className={`text-[16px] font-extrabold tracking-tight ${
                                isFail ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                {val.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-gray-50 pt-3 mt-4 flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">
                      观察范围 {timeRange === '昨日' ? '1' : durationDays} 天
                    </span>
                    <button 
                      className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
                      onClick={() => handleStageClick(s.id)}
                    >
                      辅助指标 <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* Title Group at the very outside level, matching top-level sections */}
        <div className="flex items-center gap-2.5 mt-12 mb-4">
          <div className="w-1.5 h-[22px] bg-blue-600 rounded-full"></div>
          <h2 className="text-[17px] font-bold text-gray-900 leading-none">每日指标趋势</h2>
          <span className="text-[14px] text-gray-400 ml-2 leading-none font-normal">多指标对比 · 点击图例显示或隐藏</span>
        </div>

        <section className="charts-section">
          {/* Transparent Container with No Card Box */}
          <div className="space-y-6">
            {/* Tab Controls aligned to the right, sitting right below the title in the flow */}
            <div className="flex justify-end mb-4">
              <div className="flex bg-gray-100 p-0.5 rounded-lg">
                <button 
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${chartMode === 'quality' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-950'}`} 
                  onClick={() => setChartMode('quality')}
                >
                  质量指标
                </button>
                <button 
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-all ${chartMode === 'latency' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-950'}`} 
                  onClick={() => setChartMode('latency')}
                >
                  耗时
                </button>
              </div>
            </div>
            {/* Legends Row */}
            {chartMode === 'quality' ? (
              <div className="flex items-center justify-between flex-wrap gap-y-3 mb-6 pb-2">
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    { name: '误拦截率', color: '#cf1322', enName: 'TG-FBR', target: '≤0.5%' },
                    { name: '漏拦截率', color: '#5c7080', enName: 'TG-MBR', target: '≤1.0%' },
                    { name: '模型与 Judge 操作集合一致率', color: '#722ed1', enName: 'MJ-CON', target: '≥98.0%' },
                    { name: '模型-Judge 端到端代理准确率', color: '#13c2c2', enName: 'E2E-AGY', target: '≥95.0%' },
                    { name: 'RRF 前K命中率', color: '#1890ff', enName: 'RRF-HK', target: '≥92.0%' },
                    { name: 'Reranker Top1 准确率', color: '#fa8c16', enName: 'RR-T1A', target: '≥90.0%' },
                    { name: 'Reranker 直出意图准确率', color: '#eb2f96', enName: 'RR-DIA', target: '≥95.0%' },
                    { name: '意图识别准确率', color: '#52c41a', enName: 'INT-ACC', target: '≥96.0%' },
                    { name: '拒识命中率', color: '#595959', style: 'dashed', enName: 'REJ-HR', target: '≥95.0%' }
                  ].map(lg => {
                    const isActive = activeQualityLegends.includes(lg.name);
                    return (
                      <div key={lg.name} className="relative group flex items-center">
                        <button
                          onClick={() => {
                            if (isActive) {
                              setActiveQualityLegends(activeQualityLegends.filter(x => x !== lg.name));
                            } else {
                              setActiveQualityLegends([...activeQualityLegends, lg.name]);
                            }
                          }}
                          className={`flex items-center gap-1.5 text-[12.5px] transition-all hover:opacity-80`}
                          title={`${lg.enName} · ${lg.target}`}
                        >
                          <span 
                            className={`w-3.5 h-1.5 rounded-full`}
                            style={{ 
                              backgroundColor: lg.color, 
                              border: lg.style === 'dashed' ? '1px dashed #fff' : 'none',
                              opacity: isActive ? 1 : 0.25
                            }}
                          ></span>
                          <span className={`${isActive ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                            {lg.name}
                          </span>
                        </button>

                        {/* Beautiful CSS Tooltip on Hover */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                          <div className="bg-white text-gray-900 border border-gray-200 text-[11px] font-semibold px-2.5 py-1 rounded shadow-md whitespace-nowrap">
                            {lg.enName} · {lg.target}
                          </div>
                          <div className="w-1.5 h-1.5 bg-white border-r border-b border-gray-200 transform rotate-45 -mt-1"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    className="text-[12.5px] text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setActiveQualityLegends([
                      '误拦截率', '漏拦截率', '模型与 Judge 操作集合一致率', '模型-Judge 端到端代理准确率', 
                      'RRF 前K命中率', 'Reranker Top1 准确率', 'Reranker 直出意图准确率', '意图识别准确率', '拒识命中率'
                    ])}
                  >
                    全部显示
                  </button>
                  <span className="text-gray-300 text-[11px]">|</span>
                  <button 
                    className="text-[12.5px] text-gray-500 hover:text-gray-700 font-medium"
                    onClick={() => setActiveQualityLegends([])}
                  >
                    全部隐藏
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mb-6 pb-2">
                <div className="flex items-center gap-3">
                  {[
                    { name: '全过程平均耗时', color: '#8b5a2b' }
                  ].map(lg => {
                    const isActive = activeLatencyLegends.includes(lg.name);
                    return (
                      <button
                        key={lg.name}
                        onClick={() => {
                          if (isActive) {
                            setActiveLatencyLegends([]);
                          } else {
                            setActiveLatencyLegends([lg.name]);
                          }
                        }}
                        className="flex items-center gap-1.5 text-[12.5px]"
                      >
                        <span 
                          className="w-3.5 h-1.5 rounded-full"
                          style={{ backgroundColor: lg.color, opacity: isActive ? 1 : 0.25 }}
                        ></span>
                        <span className={`${isActive ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                          {lg.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    className="text-[12.5px] text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setActiveLatencyLegends(['全过程平均耗时'])}
                  >
                    全部显示
                  </button>
                  <span className="text-gray-300 text-[11px]">|</span>
                  <button 
                    className="text-[12.5px] text-gray-500 hover:text-gray-700 font-medium"
                    onClick={() => setActiveLatencyLegends([])}
                  >
                    全部隐藏
                  </button>
                </div>
              </div>
            )}

            {/* Charts Area */}
            {chartMode === 'quality' ? (
              <div className="space-y-10">
                {/* Chart 1: 越高越好 */}
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[13px] font-bold text-gray-800">准确率 / 命中率 · 越高越好</span>
                    <span className="text-[11px] text-gray-400">
                      { [
                        '模型与 Judge 操作集合一致率', '模型-Judge 端到端代理准确率', 'RRF 前K命中率', 
                        'Reranker Top1 准确率', 'Reranker 直出意图准确率', '意图识别准确率', '拒识命中率', '漏拦截率'
                      ].filter(x => activeQualityLegends.includes(x)).length } 条曲线 · 单位 %
                    </span>
                  </div>
                  <div className="h-[280px] w-full border border-gray-50 rounded-lg p-2 bg-white">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendChartData} margin={{ top: 15, right: 15, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#8c8c8c' }}
                        />
                        <YAxis 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#8c8c8c' }}
                          domain={[10.3, 100.0]}
                          ticks={[10.3, 40.2, 70.1, 100.0]}
                          tickFormatter={(tick) => `${tick.toFixed(1)}%`}
                        />
                        <Tooltip content={<CustomTooltip />} shared={false} trigger="item" />
                        
                        {activeQualityLegends.includes('模型与 Judge 操作集合一致率') && (
                          <Line type="monotone" dataKey="模型与 Judge 操作集合一致率" stroke="#722ed1" strokeWidth={2} dot={{ r: 3, fill: '#722ed1' }} activeDot={{ r: 5 }} />
                        )}
                        {activeQualityLegends.includes('模型-Judge 端到端代理准确率') && (
                          <Line type="monotone" dataKey="模型-Judge 端到端代理准确率" stroke="#13c2c2" strokeWidth={2} dot={{ r: 3, fill: '#13c2c2' }} activeDot={{ r: 5 }} />
                        )}
                        {activeQualityLegends.includes('RRF 前K命中率') && (
                          <Line type="monotone" dataKey="RRF 前K命中率" stroke="#1890ff" strokeWidth={2} dot={{ r: 3, fill: '#1890ff' }} activeDot={{ r: 5 }} />
                        )}
                        {activeQualityLegends.includes('Reranker Top1 准确率') && (
                          <Line type="monotone" dataKey="Reranker Top1 准确率" stroke="#fa8c16" strokeWidth={2} dot={{ r: 3, fill: '#fa8c16' }} activeDot={{ r: 5 }} />
                        )}
                        {activeQualityLegends.includes('Reranker 直出意图准确率') && (
                          <Line type="monotone" dataKey="Reranker 直出意图准确率" stroke="#eb2f96" strokeWidth={2} dot={{ r: 3, fill: '#eb2f96' }} activeDot={{ r: 5 }} />
                        )}
                        {activeQualityLegends.includes('意图识别准确率') && (
                          <Line type="monotone" dataKey="意图识别准确率" stroke="#52c41a" strokeWidth={2} dot={{ r: 3, fill: '#52c41a' }} activeDot={{ r: 5 }} />
                        )}
                        {activeQualityLegends.includes('拒识命中率') && (
                          <Line type="monotone" dataKey="拒识命中率" stroke="#595959" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, fill: '#595959' }} activeDot={{ r: 5 }} />
                        )}
                        {activeQualityLegends.includes('漏拦截率') && (
                          <Line type="monotone" dataKey="漏拦截率" stroke="#5c7080" strokeWidth={2} dot={{ r: 3, fill: '#5c7080' }} activeDot={{ r: 5 }} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: 越低越好 */}
                <div>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-[13px] font-bold text-gray-800">误拦截 / 漏拦截率 · 越低越好</span>
                    <span className="text-[11px] text-gray-400">
                      { activeQualityLegends.includes('误拦截率') ? 1 : 0 } 条曲线 · 单位 %
                    </span>
                  </div>
                  <div className="h-[280px] w-full border border-gray-50 rounded-lg p-2 bg-white">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendChartData} margin={{ top: 15, right: 15, left: 5, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#8c8c8c' }}
                        />
                        <YAxis 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#8c8c8c' }}
                          domain={[3.8, 6.1]}
                          ticks={[3.8, 4.6, 5.4, 6.1]}
                          tickFormatter={(tick) => `${tick.toFixed(1)}%`}
                        />
                        <Tooltip content={<CustomTooltip />} shared={false} trigger="item" />
                        
                        {activeQualityLegends.includes('误拦截率') && (
                          <Line type="monotone" dataKey="误拦截率" stroke="#cf1322" strokeWidth={2.5} dot={{ r: 4, fill: '#cf1322' }} activeDot={{ r: 6 }} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              /* Latency mode */
              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[13px] font-bold text-gray-800">平均耗时 · 越低越好</span>
                  <span className="text-[11px] text-gray-400">
                    { activeLatencyLegends.includes('全过程平均耗时') ? 1 : 0 } 条曲线 · 单位 ms
                  </span>
                </div>
                <div className="h-[320px] w-full border border-gray-50 rounded-lg p-2 bg-white">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData} margin={{ top: 15, right: 15, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#8c8c8c' }}
                      />
                      <YAxis 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#8c8c8c' }}
                        domain={[690, 739]}
                        ticks={[690, 706, 723, 739]}
                        tickFormatter={(tick) => `${tick}ms`}
                      />
                      <Tooltip content={<CustomTooltip />} shared={false} trigger="item" />
                      
                      {activeLatencyLegends.includes('全过程平均耗时') && (
                        <Line type="monotone" dataKey="全过程平均耗时" stroke="#8b5a2b" strokeWidth={2.5} dot={{ r: 4, fill: '#8b5a2b' }} activeDot={{ r: 6 }} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Scrollable date list at the bottom */}
            <div className="mt-6">
              <p className="text-[12px] text-gray-400 mb-4 flex items-center gap-1">
                <span>点击曲线上的点进入该指标当天分析；点击日期对照当天各项数值。缺失日期不连线。</span>
              </p>
              <div className="flex flex-col gap-4">
                <div 
                  id="date-cards-scroller" 
                  ref={scrollerRef}
                  onScroll={(e) => {
                    const target = e.currentTarget;
                    const maxScroll = target.scrollWidth - target.clientWidth;
                    if (maxScroll > 0) {
                      setScrollRatio(target.scrollLeft / maxScroll);
                    } else {
                      setScrollRatio(0);
                    }
                  }}
                  className={`flex gap-2 overflow-x-auto py-1 scroll-smooth ${trendChartData.length <= 7 ? 'justify-center' : 'justify-start'}`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {trendChartData.map((d, idx) => {
                    const hasData = d['全过程准确率'] !== null;
                    const isToday = d.date === '09-08';
                    if (!hasData) {
                      return (
                        <div 
                          key={d.date} 
                          className="flex-shrink-0 w-[110px] bg-[#fafafa] border border-gray-150 rounded-xl p-3.5 text-center transition-all cursor-not-allowed"
                        >
                          <div className="text-[14px] text-slate-400 font-normal mb-1.5">{d.date}</div>
                          <div className="text-[14px] text-slate-400 font-normal">无数据</div>
                        </div>
                      );
                    }
                    return (
                      <div 
                        key={d.date} 
                        className={`flex-shrink-0 w-[110px] bg-white border ${isToday ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-200'} rounded-lg p-2.5 text-center transition-all cursor-pointer hover:border-blue-400 hover:shadow-sm`}
                        onClick={() => {
                          alert(`跳转 to 2026-${d.date} 数据批次分析中...`);
                        }}
                      >
                        <div className="text-[12px] font-medium text-gray-600 mb-1">{d.date}</div>
                        <div className="text-[12.5px] text-blue-600 font-semibold">
                          查看当日
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Customized Scroll Slider Bar (Hidden if cards fit entirely, e.g. <= 7 cards) */}
                {trendChartData.length > 7 && (
                  <div className="flex items-center gap-3 mt-1.5 w-full">
                    {/* Left Arrow Button */}
                    <button 
                      className="text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer flex-shrink-0"
                      onClick={() => {
                        const el = document.getElementById('date-cards-scroller');
                        if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                      }}
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <polygon points="16,20 6,12 16,4" fill="#8c8c8c" />
                      </svg>
                    </button>

                    {/* Custom Scroll Track (Stretches to equal container width) */}
                    <div 
                      ref={trackRef}
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          // Center the 30% thumb, active range is 15% to 85%
                          const percent = Math.max(0, Math.min(1, (clickX - rect.width * 0.15) / (rect.width * 0.7)));
                          const scroller = scrollerRef.current;
                          if (scroller) {
                            const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                            scroller.scrollTo({
                              left: percent * maxScroll,
                              behavior: 'smooth'
                            });
                          }
                        }
                      }}
                      className="flex-grow h-1.5 bg-gray-200 rounded-full relative flex items-center cursor-pointer select-none"
                    >
                      {/* Slider Thumb (Elegant, smaller, now fully draggable) */}
                      <div 
                        onPointerDown={(e) => {
                          e.currentTarget.setPointerCapture(e.pointerId);
                          e.currentTarget.dataset.dragging = 'true';
                          e.currentTarget.dataset.startX = String(e.clientX);
                          e.currentTarget.dataset.startScrollLeft = String(scrollerRef.current?.scrollLeft || 0);
                        }}
                        onPointerMove={(e) => {
                          if (e.currentTarget.dataset.dragging === 'true') {
                            const startX = Number(e.currentTarget.dataset.startX);
                            const startScrollLeft = Number(e.currentTarget.dataset.startScrollLeft);
                            const diffX = e.clientX - startX;
                            const scroller = scrollerRef.current;
                            const track = trackRef.current;
                            if (scroller && track) {
                              const maxScroll = scroller.scrollWidth - scroller.clientWidth;
                              const usableTrackWidth = track.clientWidth * 0.70;
                              if (usableTrackWidth > 0) {
                                const scrollChange = (diffX / usableTrackWidth) * maxScroll;
                                scroller.scrollLeft = startScrollLeft + scrollChange;
                              }
                            }
                          }
                        }}
                        onPointerUp={(e) => {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                          e.currentTarget.dataset.dragging = 'false';
                        }}
                        onPointerCancel={(e) => {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                          e.currentTarget.dataset.dragging = 'false';
                        }}
                        className="h-1.5 bg-[#8c8c8c] hover:bg-gray-500 rounded-full absolute cursor-grab active:cursor-grabbing touch-none transition-all duration-75"
                        style={{
                          width: '30%',
                          left: `${scrollRatio * 70}%`,
                        }}
                      ></div>
                    </div>

                    {/* Right Arrow Button */}
                    <button 
                      className="text-gray-400 hover:text-gray-700 transition-colors p-1 cursor-pointer flex-shrink-0"
                      onClick={() => {
                        const el = document.getElementById('date-cards-scroller');
                        if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                      }}
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <polygon points="8,4 18,12 8,20" fill="#8c8c8c" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="section mt-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
            <h2 className="font-bold text-base">待分析异常记录</h2>
            <small className="text-red-500 ml-2">1 项待办</small>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>异常指标 / 编码</th>
                  <th>期间值 / 目标</th>
                  <th>异常日期 · 点击分析当天</th>
                  <th>异常日期累计样本数</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {fails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">暂无异常记录</td>
                  </tr>
                ) : fails.map(m => {
                  const val = m.id === 'latency' ? data.latency : (data[m.n as keyof BatchData] as number / (data[m.d as keyof BatchData] as number)) * 100;
                  const totalSamples = data[m.d as keyof BatchData] as number;
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="flex flex-col">
                          <strong className="text-xs">{m.name}</strong>
                          <span className="text-[10px] text-gray-400">{m.code}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <strong className="text-xs">{val.toFixed(2)}{m.unit || '%'}</strong>
                          <span className="text-[10px] text-gray-400">{m.dir === 'gt' ? '≥' : '≤'} {m.target}{m.unit || '%'}</span>
                          <span className="text-[10px] text-red-500">期间未达标</span>
                        </div>
                      </td>
                      <td>
                        <div className="anomaly-date-pills">
                          {filteredDailyTrends.slice(0, 7).map(d => (
                            <span key={d.date} className="anomaly-date-pill">{d.date}</span>
                          ))}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {filteredDailyTrends.length} / {filteredDailyTrends.length} 天
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <strong className="text-xs">{totalSamples.toLocaleString()}</strong>
                          <span className="text-[10px] text-gray-400">按异常日期累计</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <button className="text-blue-600 text-xs flex items-center ml-auto">
                          分析期间 <ArrowUpRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerContent?.title || ''}
        eyebrow={drawerContent?.eyebrow}
      >
        {drawerContent?.content}
      </Drawer>
    </div>
  );
}
