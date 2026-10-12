/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ArrowLeft, AlertTriangle, ChevronRight, ChevronDown, Info, TrendingUp } from 'lucide-react';
import { metrics } from '../data';
import { DEFAULT_ISSUES } from '../badcaseStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export interface TaskDetailData {
  id?: string;
  name: string;
  object: string;
  versions: string;
  metrics: string[];
  launchTime: string;
  baseline: string;
  observation: string;
  status: string[];
  assignee?: string;
  channel?: string;
  asset?: string;
  description?: string;
  sourceBadcase?: string;
}

interface ValidationDetailProps {
  task: TaskDetailData;
  onBack: () => void;
}

export default function ValidationDetail({ task, onBack }: ValidationDetailProps) {
  // Active metric tab in trend section
  const [selectedMetricTab, setSelectedMetricTab] = useState(
    task.metrics?.[0] || '核心指标'
  );

  // Manual conclusion states
  const [conclusionStatus, setConclusionStatus] = useState('未填写');
  const [conclusionAction, setConclusionAction] = useState('');
  const [isConclusionSaved, setIsConclusionSaved] = useState(false);
  const [finishReason, setFinishReason] = useState('');
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDate, setExtendDate] = useState('2026-11-13');
  const [extendReason, setExtendReason] = useState('');

  // History timeline
  const [historyList, setHistoryList] = useState([
    {
      action: '开始跟踪',
      time: '2026/10/6 12:08:42',
      author: 'AI运营人员 (人工登记)',
      detail: '登记优化事件与观察范围'
    }
  ]);

  const handleSaveConclusion = () => {
    const nowStr = new Date().toLocaleString();
    setHistoryList(prev => [
      {
        action: '保存结论',
        time: nowStr,
        author: '人工登记',
        detail: `结论状态: ${conclusionStatus}`
      },
      ...prev
    ]);
    setIsConclusionSaved(true);
    alert('结论已保存！');
  };

  const handleRefreshResults = () => {
    const nowStr = new Date().toLocaleString();
    setHistoryList(prev => [
      {
        action: '刷新结果',
        time: nowStr,
        author: '人工登记',
        detail: '数据刷新完成；无新样本更新'
      },
      ...prev
    ]);
  };

  const handleSaveExtend = () => {
    const nowStr = new Date().toLocaleString();
    setHistoryList(prev => [
      {
        action: '延长观察',
        time: nowStr,
        author: '人工登记',
        detail: `新观察期结束日: ${extendDate}；理由: ${extendReason}`
      },
      ...prev
    ]);
    setShowExtendModal(false);
    setExtendReason('');
    alert('已延长观察期！');
  };

  const handleFinishTracking = () => {
    if (!finishReason.trim()) {
      alert('请填写结束跟踪的具体理由');
      return;
    }
    const nowStr = new Date().toLocaleString();
    setHistoryList(prev => [
      {
        action: '结束跟踪',
        time: nowStr,
        author: '人工登记',
        detail: `理由: ${finishReason}`
      },
      ...prev
    ]);
    alert('已结束跟踪！');
  };

  const getMetricTarget = (metricName: string): string => {
    const issueMatch = DEFAULT_ISSUES.find(i => i.metricName === metricName);
    if (issueMatch?.target) return issueMatch.target;

    const dataMetric = metrics.find(m => m.name === metricName);
    if (dataMetric?.target !== undefined) {
      const symbol = dataMetric.dir === 'lt' ? '≤' : '≥';
      const unit = dataMetric.unit || '%';
      return `目标 ${symbol} ${dataMetric.target}${unit === '%' ? '%' : ` ${unit}`}`;
    }

    if (metricName.includes('误拦截') || metricName.includes('TG-FBR')) return '目标 ≤ 0.5%';
    if (metricName.includes('漏拦截') || metricName.includes('TG-MBR')) return '目标 ≤ 25%';
    if (metricName.includes('Top1') || metricName.includes('Reranker')) return '目标 ≥ 93.0%';
    if (metricName.includes('耗时') || metricName.includes('RT')) return '目标 ≤ 1000ms';
    if (metricName.includes('准确率')) return '目标 ≥ 95.0%';
    if (metricName.includes('召回率')) return '目标 ≥ 95.0%';
    if (metricName.includes('转化率')) return '目标 ≥ 15.0%';
    if (metricName.includes('一致率') || metricName.includes('一致性')) return '目标 ≥ 90.0%';
    if (metricName.includes('拒答') || metricName.includes('拒识')) return '目标 ≥ 85.0%';
    return '目标 ≥ 90.0%';
  };

  const getMetricComparison = (metricName: string) => {
    if (metricName.includes('误拦截') || metricName.includes('TG-FBR')) {
      return {
        baselineValue: '5.86%',
        observationValue: '0.42%',
        delta: '-5.44%',
        isPositive: true,
        target: '≤ 0.5%',
        unit: '%'
      };
    }
    if (metricName.includes('漏拦截') || metricName.includes('TG-MBR')) {
      return {
        baselineValue: '28.40%',
        observationValue: '21.30%',
        delta: '-7.10%',
        isPositive: true,
        target: '≤ 25.0%',
        unit: '%'
      };
    }
    if (metricName.includes('Top1') || metricName.includes('Reranker')) {
      return {
        baselineValue: '91.80%',
        observationValue: '93.45%',
        delta: '+1.65%',
        isPositive: true,
        target: '≥ 93.0%',
        unit: '%'
      };
    }
    if (metricName.includes('意图识别') || (metricName.includes('意图') && metricName.includes('准确率'))) {
      return {
        baselineValue: '88.50%',
        observationValue: '95.20%',
        delta: '+6.70%',
        isPositive: true,
        target: '≥ 95.0%',
        unit: '%'
      };
    }
    if (metricName.includes('语义理解') || metricName.includes('召回率')) {
      return {
        baselineValue: '84.20%',
        observationValue: '92.60%',
        delta: '+8.40%',
        isPositive: true,
        target: '≥ 92.0%',
        unit: '%'
      };
    }
    if (metricName.includes('耗时') || metricName.includes('RT')) {
      return {
        baselineValue: '733ms',
        observationValue: '698ms',
        delta: '-35ms',
        isPositive: true,
        target: '≤ 1000ms',
        unit: 'ms'
      };
    }
    if (metricName.includes('转化率')) {
      return {
        baselineValue: '11.80%',
        observationValue: '15.60%',
        delta: '+3.80%',
        isPositive: true,
        target: '≥ 15.0%',
        unit: '%'
      };
    }
    if (metricName.includes('一致率') || metricName.includes('一致性')) {
      return {
        baselineValue: '86.50%',
        observationValue: '92.30%',
        delta: '+5.80%',
        isPositive: true,
        target: '≥ 90.0%',
        unit: '%'
      };
    }
    if (metricName.includes('拒答') || metricName.includes('拒识')) {
      return {
        baselineValue: '78.20%',
        observationValue: '86.40%',
        delta: '+8.20%',
        isPositive: true,
        target: '≥ 85.0%',
        unit: '%'
      };
    }

    const targetFormatted = getMetricTarget(metricName).replace('目标 ', '');
    const isSmallerBetter = targetFormatted.includes('≤');
    if (isSmallerBetter) {
      return {
        baselineValue: '4.80%',
        observationValue: '0.45%',
        delta: '-4.35%',
        isPositive: true,
        target: targetFormatted,
        unit: '%'
      };
    }

    return {
      baselineValue: '88.50%',
      observationValue: '94.20%',
      delta: '+5.70%',
      isPositive: true,
      target: targetFormatted,
      unit: '%'
    };
  };

  const getMetricChartData = (metricName: string) => {
    const comp = getMetricComparison(metricName);
    const bDays = getDaysFromRange(task.baseline);
    const oDays = getDaysFromRange(task.observation);
    const bDates = getDatesFromRange(task.baseline, bDays);
    const oDates = getDatesFromRange(task.observation, oDays);

    const generatePoints = (dates: string[], baseValues: any[]) => {
      return dates.map((date, i) => {
        const base = baseValues[i % baseValues.length];
        return {
          date,
          value: base.value,
          val: base.val,
          num: base.num,
          den: base.den
        };
      });
    };

    if (metricName.includes('误拦截') || metricName.includes('TG-FBR')) {
      const mockB = [
        { value: 5.72, val: '5.72%', num: '275', den: '4,815' },
        { value: 5.88, val: '5.88%', num: '282', den: '4,800' },
        { value: 5.81, val: '5.81%', num: '280', den: '4,820' },
        { value: 5.92, val: '5.92%', num: '285', den: '4,815' },
        { value: 5.86, val: '5.86%', num: '283', den: '4,825' },
      ];
      const mockO = [
        { value: 0.48, val: '0.48%', num: '17', den: '3,542' },
        { value: 0.44, val: '0.44%', num: '15', den: '3,409' },
        { value: 0.40, val: '0.40%', num: '14', den: '3,500' },
        { value: 0.43, val: '0.43%', num: '15', den: '3,488' },
        { value: 0.39, val: '0.39%', num: '14', den: '3,590' },
        { value: 0.42, val: '0.42%', num: '15', den: '3,560' },
      ];
      const obsData = generatePoints(oDates, mockO);
      const isFull = ['已结束', '待总结'].includes(currentStatus);
      // Ensure we take up to currentObsDays points
      const filteredObs = isFull ? obsData : obsData.slice(0, Math.min(obsData.length, currentObsDays));
      
      return {
        unit: '%',
        baseline: { yTicks: ['7.0%', '6.0%', '5.0%', '4.0%'], targetValue: 0.5, points: generatePoints(bDates, mockB) },
        observation: { yTicks: ['0.8%', '0.6%', '0.4%', '0.2%'], targetValue: 0.5, points: filteredObs }
      };
    }

    if (metricName.includes('漏拦截') || metricName.includes('TG-MBR')) {
      const mockB = [
        { value: 28.1, val: '28.1%', num: '337', den: '1,200' },
        { value: 28.6, val: '28.6%', num: '343', den: '1,200' },
        { value: 27.9, val: '27.9%', num: '335', den: '1,200' },
        { value: 28.8, val: '28.8%', num: '345', den: '1,200' },
        { value: 28.4, val: '28.4%', num: '341', den: '1,200' },
      ];
      const mockO = [
        { value: 23.8, val: '23.8%', num: '214', den: '900' },
        { value: 22.5, val: '22.5%', num: '202', den: '900' },
        { value: 21.0, val: '21.0%', num: '189', den: '900' },
        { value: 21.8, val: '21.8%', num: '196', den: '900' },
        { value: 20.5, val: '20.5%', num: '184', den: '900' },
        { value: 21.3, val: '21.3%', num: '192', den: '900' },
      ];
      const obsData = generatePoints(oDates, mockO);
      const isFull = ['已结束', '待总结'].includes(currentStatus);
      const filteredObs = isFull ? obsData : obsData.slice(0, Math.min(obsData.length, currentObsDays));
      return {
        unit: '%',
        baseline: { yTicks: ['32%', '29%', '26%', '23%'], targetValue: 25.0, points: generatePoints(bDates, mockB) },
        observation: { yTicks: ['28%', '25%', '22%', '19%'], targetValue: 25.0, points: filteredObs }
      };
    }

    if (metricName.includes('耗时') || metricName.includes('RT')) {
      const mockB = [
        { value: 745, val: '745ms', num: '931k', den: '1.25k' },
        { value: 738, val: '738ms', num: '922k', den: '1.25k' },
        { value: 729, val: '729ms', num: '911k', den: '1.25k' },
        { value: 741, val: '741ms', num: '926k', den: '1.25k' },
        { value: 733, val: '733ms', num: '916k', den: '1.25k' },
      ];
      const mockO = [
        { value: 715, val: '715ms', num: '715k', den: '1k' },
        { value: 708, val: '708ms', num: '708k', den: '1k' },
        { value: 702, val: '702ms', num: '702k', den: '1k' },
        { value: 695, val: '695ms', num: '695k', den: '1k' },
        { value: 704, val: '704ms', num: '704k', den: '1k' },
        { value: 698, val: '698ms', num: '698k', den: '1k' },
      ];
      const obsData = generatePoints(oDates, mockO);
      const isFull = ['已结束', '待总结'].includes(currentStatus);
      const filteredObs = isFull ? obsData : obsData.slice(0, Math.min(obsData.length, currentObsDays));
      return {
        unit: 'ms',
        baseline: { yTicks: ['780ms', '750ms', '720ms', '690ms'], targetValue: 1000, points: generatePoints(bDates, mockB) },
        observation: { yTicks: ['740ms', '710ms', '680ms', '650ms'], targetValue: 1000, points: filteredObs }
      };
    }

    const mockB = [
      { value: 87.8, val: '87.8%', num: '1,053', den: '1,200' },
      { value: 88.9, val: '88.9%', num: '1,066', den: '1,200' },
      { value: 88.2, val: '88.2%', num: '1,058', den: '1,200' },
      { value: 89.1, val: '89.1%', num: '1,069', den: '1,200' },
      { value: 88.5, val: comp.baselineValue, num: '1,062', den: '1,200' },
    ];
    const mockO = [
      { value: 93.2, val: '93.2%', num: '932', den: '1,000' },
      { value: 94.5, val: '94.5%', num: '945', den: '1,000' },
      { value: 95.6, val: '95.6%', num: '956', den: '1,000' },
      { value: 95.0, val: '95.0%', num: '950', den: '1,000' },
      { value: 95.8, val: '95.8%', num: '958', den: '1,000' },
      { value: 94.2, val: comp.observationValue, num: '942', den: '1,000' },
    ];
    return {
      unit: '%',
      baseline: { yTicks: ['94%', '91%', '88%', '85%'], targetValue: 95.0, points: generatePoints(bDates, mockB) },
      observation: { yTicks: ['97%', '95%', '93%', '91%'], targetValue: 95.0, points: generatePoints(oDates, mockO) }
    };
  };

  const formatFullDateRange = (rangeStr?: string) => {
    if (!rangeStr || rangeStr === '-') return '2026-09-05 至 2026-09-11';
    return rangeStr.split(' 至 ').map(part => {
      const trimmed = part.trim();
      if (!trimmed) return trimmed;
      // Handle M-D format by converting to MM-DD
      if (/^\d{1,2}-\d{1,2}$/.test(trimmed)) {
        const [m, d] = trimmed.split('-').map(n => String(n).padStart(2, '0'));
        return `2026-${m}-${d}`;
      }
      return trimmed;
    }).join(' 至 ');
  };

  const getDatesFromRange = (rangeStr: string, count: number) => {
    const formatted = formatFullDateRange(rangeStr);
    const dateRange = formatted.split(' 至 ');
    const [y, m, day] = dateRange[0].split('-').map(Number);
    const startDate = new Date(y, m - 1, day);
    if (isNaN(startDate.getTime())) {
      return Array(count).fill(0).map((_, i) => `09-${String(5+i).padStart(2, '0')}`);
    }
    const result = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(y, m - 1, day + i);
      result.push(`${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return result;
  };

  const primaryMetricName = task.metrics?.[0] || '误拦截率';
  const taskId = task.id || 'TRK-8a715c72-852f-487f-87f3-fa66edb0f520';
  const currentStatus = task.status?.[0] || '待观察';
  const hasObservationData = !['待观察', '草稿'].includes(currentStatus);

  // Helper to generate a curved SVG path (Cardinal Spline)
  const getSplinePath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];

      // Control points for cubic bezier to simulate spline
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const getDaysFromRange = (rangeStr?: string) => {
    if (!rangeStr || rangeStr === '-') return 2;
    const parts = rangeStr.split(' 至 ');
    if (parts.length === 2) {
      const d1 = new Date(parts[0].trim().length === 5 ? `2026-${parts[0].trim()}` : parts[0].trim());
      const d2 = new Date(parts[1].trim().length === 5 ? `2026-${parts[1].trim()}` : parts[1].trim());
      if (!isNaN(d1.getTime()) && !isNaN(d2.getTime())) {
        const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return diff > 0 ? diff : 1;
      }
    }
    return 2;
  };

  const baselineDays = getDaysFromRange(task.baseline);
  const baselineSample = baselineDays * 1500;
  const baselineSubText = `${baselineDays}天 · 样本 ${baselineSample}`;

  const totalObsDays = getDaysFromRange(task.observation);
  // Assume 3 observed days for the sake of example if in '观察中' or based on actual data if available.
  // For now, based on requirement: "only 3 days observed"
  const currentObsDays = ['已结束', '待总结'].includes(currentStatus)
    ? totalObsDays
    : (currentStatus === '观察中' ? 3 : 0);
  const obsSample = hasObservationData ? currentObsDays * 1000 : 0;
  const observationSubText = hasObservationData 
    ? `${currentObsDays}/${totalObsDays} · 样本 ${obsSample}`
    : `0/${totalObsDays} 天 · 样本 0`;

  const TrendCustomTooltip = ({ active, payload, unit }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#182334] text-white text-[11px] px-2 py-1 rounded shadow-lg font-mono">
          {data.date} · {data.val}
        </div>
      );
    }
    return null;
  };

  const chartData = getMetricChartData(selectedMetricTab);

  return (
    <div className="min-h-full bg-gray-50/50 p-6 space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs flex items-start gap-4">
        <button 
          onClick={onBack}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer shrink-0 mt-0.5"
          title="返回列表"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="space-y-1.5">
          <h1 className="text-lg font-bold text-gray-950 tracking-tight">{task.name}</h1>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className={`px-2.5 py-0.5 text-xs rounded font-medium border ${
              (task.status[0] || '待观察') === '待观察' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              (task.status[0] || '待观察') === '观察中' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              (task.status[0] || '待观察') === '待总结' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              (task.status[0] || '待观察') === '草稿' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
              'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              {task.status[0] || '待观察'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. 优化背景与来源 */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center">
          <h2 className="text-sm font-bold text-gray-950">优化背景与来源</h2>
        </div>

        <div className="grid grid-cols-3 gap-y-4 gap-x-12 text-xs">
          <div className="space-y-3">
            <div>
              <div className="text-gray-400 mb-1">优化对象</div>
              <div className="text-gray-800 font-medium">{task.object || '提示词'}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">关联资产</div>
              <div className="text-gray-800 font-medium">
                {task.asset && task.asset !== '未关联' ? task.asset : '未关联'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-gray-400 mb-1">负责人</div>
              <div className="text-gray-800 font-medium">{task.assignee || 'AI运营人员 (人工登记)'}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">优化说明</div>
              <div className="text-gray-800 font-medium leading-relaxed">
                {task.description && task.description.trim() ? task.description : '暂无优化说明'}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-gray-400 mb-1">版本</div>
              <div className="text-gray-800 font-medium font-mono">{task.versions || '未记录 → 未记录'}</div>
            </div>
            {task.sourceBadcase && task.sourceBadcase !== '未关联' && (
              <div>
                <div className="text-gray-400 mb-1">关联Badcase问题单</div>
                <div className="text-blue-600 font-medium hover:underline cursor-pointer">
                  {task.sourceBadcase}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 关联指标及目标值展示 */}
        <div className="bg-gray-50/70 border border-gray-200/80 rounded-lg p-4 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {(task.metrics && task.metrics.length > 0 ? task.metrics : ['误拦截率']).map((metric, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-gray-200 rounded px-3 py-1.5 flex items-center gap-2 shadow-2xs"
              >
                <span className="font-medium text-gray-800">{metric}</span>
                <span className="text-gray-300">·</span>
                <span className="text-emerald-700 font-mono font-medium">
                  {getMetricTarget(metric)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 固定观察配置 */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center">
          <h2 className="text-sm font-bold text-gray-950">固定观察配置</h2>
        </div>

        <div className="grid grid-cols-3 gap-y-4 gap-x-12 text-xs">
          <div className="space-y-3">
            <div>
              <div className="text-gray-400 mb-1">业务范围</div>
              <div className="text-gray-800 font-medium">{task.channel || '全部渠道'}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">基准期</div>
              <div className="text-gray-800 font-medium font-mono">{formatFullDateRange(task.baseline)}</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-gray-400 mb-1">主关注指标</div>
              <div className="text-gray-800 font-medium">{task.metrics.join('、')}</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">观察期</div>
              <div className="text-gray-800 font-medium font-mono">{formatFullDateRange(task.observation)}</div>
            </div>
          </div>

          <div className="space-y-3">
          </div>
        </div>
      </section>

      {/* 3. 上线前后指标对比 */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center">
          <h2 className="text-sm font-bold text-gray-950">上线前后指标对比</h2>
        </div>

        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#D6E2FF] border-b border-gray-200 text-gray-950 font-normal">
                <th className="px-4 py-2.5 font-semibold">指标</th>
                <th className="px-4 py-2.5 font-semibold">基准期</th>
                <th className="px-4 py-2.5 font-semibold">观察期</th>
                <th className="px-4 py-2.5 font-semibold">变化</th>
                <th className="px-4 py-2.5 font-semibold">目标</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {(task.metrics && task.metrics.length > 0 ? task.metrics : ['误拦截率']).map((metric, idx) => {
                const comparison = getMetricComparison(metric);
                return (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 align-middle">
                      <div className="font-semibold text-gray-950">{metric}</div>
                    </td>
                    <td className="px-4 py-3.5 align-middle font-mono">
                      <div className="text-gray-800 font-medium">{comparison.baselineValue}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5 font-sans">
                        {baselineSubText}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle font-mono">
                      <div className="text-gray-800 font-medium">
                        {hasObservationData ? comparison.observationValue : '—'}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 font-sans">
                        {observationSubText}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle font-mono">
                      <div className="text-gray-900 font-medium">
                        {hasObservationData ? comparison.delta : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-middle font-mono text-gray-800 font-medium">
                      {comparison.target}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. 趋势与每日明细 */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-sm font-bold text-gray-950">趋势与每日明细</h2>
          </div>
        </div>

        {/* Tab Filter Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {(task.metrics && task.metrics.length > 0 ? task.metrics : ['核心指标']).map(m => (
            <button
              key={m}
              onClick={() => setSelectedMetricTab(m)}
              className={`px-3.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors shadow-2xs ${
                selectedMetricTab === m
                  ? 'bg-[#2563eb] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Chart Legend */}
        <div className="flex items-center gap-6 text-xs text-gray-500 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 inline-block"></span>
            <span>{selectedMetricTab} (实际趋势)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-500 inline-block border-t border-dashed border-amber-500"></span>
            <span>{getMetricTarget(selectedMetricTab)}</span>
          </div>
        </div>

        {/* Dynamic Trend Charts: Left (Baseline) and Right (Observation) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Left Block: 基准期折线图 */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div></div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">基准期</span>
                </div>

                <div className="h-[300px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.baseline.points} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#8c8c8c' }}
                        interval={0}
                      />
                      <YAxis 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false}
                        tick={{ fill: '#8c8c8c' }}
                        domain={chartData.unit === '%' ? [0, 100] : undefined}
                        ticks={chartData.unit === '%' ? [0, 25, 50, 75, 100] : undefined}
                        tickFormatter={(tick) => `${tick}${chartData.unit}`}
                      />
                      <Tooltip content={<TrendCustomTooltip />} />
                      <ReferenceLine 
                        y={chartData.baseline.targetValue} 
                        stroke="#c48a3d" 
                        strokeDasharray="4 4" 
                        strokeWidth={1.5} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2f78ff" 
                        strokeWidth={2} 
                        dot={{ r: 3.5, fill: '#2f78ff', stroke: '#ffffff', strokeWidth: 1 }} 
                        activeDot={{ r: 5, fill: '#2f78ff', stroke: '#ffffff', strokeWidth: 2 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-400 px-1 font-sans border-t border-gray-50 pt-3 mt-auto">
                  <div></div>
                  <span className="text-gray-500 font-medium">统计汇总: {baselineSubText}</span>
                </div>
              </div>

              {/* Right Block: 观察期折线图 */}
              <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] font-mono">
                      {!hasObservationData && (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-sans">
                          待开启监测
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">观察期</span>
                  </div>
                </div>

                <div className="h-[300px] w-full mt-2 flex items-center justify-center">
                  {hasObservationData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.observation.points} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#8c8c8c' }}
                          interval={0}
                        />
                        <YAxis 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false}
                          tick={{ fill: '#8c8c8c' }}
                          domain={chartData.unit === '%' ? [0, 100] : undefined}
                          ticks={chartData.unit === '%' ? [0, 25, 50, 75, 100] : undefined}
                          tickFormatter={(tick) => `${tick}${chartData.unit}`}
                        />
                        <Tooltip content={<TrendCustomTooltip />} />
                        <ReferenceLine 
                          y={chartData.observation.targetValue} 
                          stroke="#c48a3d" 
                          strokeDasharray="4 4" 
                          strokeWidth={1.5} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2f78ff" 
                          strokeWidth={2} 
                          dot={{ r: 3.5, fill: '#2f78ff', stroke: '#ffffff', strokeWidth: 1 }} 
                          activeDot={{ r: 5, fill: '#2f78ff', stroke: '#ffffff', strokeWidth: 2 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center space-y-3 w-full h-full bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                        <TrendingUp size={24} />
                      </div>
                      <p className="text-gray-400 text-sm font-medium">待进入观察期后见波动数据</p>
                      <p className="text-gray-300 text-[11px]">上线后将开启实时监测</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-400 px-1 font-sans border-t border-gray-50 pt-3 mt-auto">
                  <div></div>
                  <span className="text-blue-600 font-medium">监测进度: {observationSubText}</span>
                </div>
              </div>
            </div>);

        {/* Daily Detail Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Baseline Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-700">基准期明细</div>
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100 text-gray-500 font-normal">
                  <th className="px-4 py-2.5">日期</th>
                  <th className="px-4 py-2.5">指标 ({selectedMetricTab})</th>
                  <th className="px-4 py-2.5">有效样本</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {chartData.baseline.points.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-gray-800">{p.date}</td>
                    <td className="px-4 py-3 font-mono font-medium text-gray-800">{p.val}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{p.den}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Observation Table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-700">观察期明细</div>
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-100 text-gray-500 font-normal">
                  <th className="px-4 py-2.5">日期</th>
                  <th className="px-4 py-2.5">指标 ({selectedMetricTab})</th>
                  <th className="px-4 py-2.5">有效样本</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {chartData.observation.points.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-gray-800">{p.date}</td>
                    <td className="px-4 py-3 font-mono font-medium text-gray-800">{p.val}</td>
                    <td className="px-4 py-3 font-mono text-gray-700">{p.den}</td>
                  </tr>
                ))}
                {!hasObservationData && (
                  <tr className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-gray-400" colSpan={3}>暂无观察期数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. 人工观察结论 */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center">
          <h2 className="text-sm font-bold text-gray-950">人工观察结论</h2>
        </div>

        <div className="grid grid-cols-1 gap-8 text-xs">
          <div className="space-y-1.5">
            <label className="block text-gray-500">效果结论</label>
            <select 
              className="w-48 px-3 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white text-gray-800 cursor-pointer"
              value={conclusionStatus}
              onChange={(e) => setConclusionStatus(e.target.value)}
              disabled={isConclusionSaved}
            >
              <option value="未填写">未填写</option>
              <option value="达到预期">达到预期</option>
              <option value="改善不足">改善不足</option>
              <option value="效果退化">效果退化</option>
              <option value="暂无法判断">暂无法判断</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="block text-gray-500">结论</label>
          <textarea 
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white text-gray-800"
            value={conclusionAction}
            onChange={(e) => setConclusionAction(e.target.value)}
            disabled={isConclusionSaved}
          />
        </div>

        {/* Action Buttons Row */}
        {!isConclusionSaved && (
          <div className="flex items-center gap-3 pt-1">
            <button 
              type="button"
              onClick={handleSaveConclusion}
              className="px-4 py-1.5 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
            >
              保存结论
            </button>
            <button 
              type="button"
              onClick={() => setShowExtendModal(true)}
              className="px-4 py-1.5 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer shadow-2xs"
            >
              延长观察
            </button>
          </div>
        )}

        {showExtendModal && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 space-y-3">
            <div className="flex gap-4 items-end">
              <div className="space-y-1">
                <label className="block text-xs text-gray-500">新的观察期结束日</label>
                <input type="date" value={extendDate} onChange={(e) => setExtendDate(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs" />
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs text-gray-500">延期理由</label>
                <input type="text" value={extendReason} onChange={(e) => setExtendReason(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded text-xs" />
              </div>
              <button onClick={handleSaveExtend} className="px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-100">保存延期</button>
              <button onClick={() => setShowExtendModal(false)} className="text-xs text-blue-600">取消</button>
            </div>
          </div>
        )}

        {/* 结束跟踪 Box */}
        <div className="pt-2">
          <div className="space-y-1.5">
            <div className="text-xs text-gray-500">结束跟踪理由</div>
            <div className="flex items-center gap-4">
              <input 
                type="text"
                placeholder="提前结束、观察结束或终止的具体理由"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white text-gray-800"
                value={finishReason}
                onChange={(e) => setFinishReason(e.target.value)}
              />
              <button 
                type="button"
                onClick={handleFinishTracking}
                className="px-5 py-1.5 bg-[#2563eb] hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
              >
                结束跟踪
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. 过程与结论历史 */}
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center">
          <h2 className="text-sm font-bold text-gray-950">过程与结论历史</h2>
        </div>

        <div className="space-y-4 text-xs">
          {historyList.map((item, idx) => (
            <div key={idx} className="space-y-1 border-l-2 border-blue-500 pl-3 py-0.5">
              <div className="font-semibold text-gray-950">{item.action}</div>
              <div className="text-gray-400 font-mono text-[11px]">{item.time}</div>
              <div className="text-gray-600">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
