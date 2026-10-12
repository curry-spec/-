/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Info, 
  Search, 
  Filter, 
  Check,
  ClipboardPlus,
  TextCursorInput,
  BrainCircuit,
  Calendar,
  RotateCcw,
  TrendingUp,
  Table,
  MessageSquare
} from 'lucide-react';
import { Channel, Metric, BatchData } from '../types';
import { metrics, stages, baseData, dailyTrends } from '../data';
import Drawer from '../components/Drawer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useBadcaseIssues } from '../badcaseStore';

interface AnalysisProps {
  channel: Channel;
  date: string;
  selectedMetricId: string;
  onMetricSelect: (id: string) => void;
  timeRange: string;
  onTimeRangeChange: (t: string) => void;
  startDate: string;
  onStartDateChange: (d: string) => void;
  endDate: string;
  onEndDateChange: (d: string) => void;
  onNavigateToBadcase?: () => void;
}

export default function Analysis({ 
  channel, 
  date, 
  selectedMetricId, 
  onMetricSelect,
  timeRange,
  onTimeRangeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onNavigateToBadcase
}: AnalysisProps) {
  const { issues: existingIssues, addIssue, updateIssueSamples } = useBadcaseIssues();

  const selectedMetric = useMemo(() => 
    metrics.find(m => m.id === selectedMetricId) || metrics[0]
  , [selectedMetricId]);

  const [dimension, setDimension] = useState('intent');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部');
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [caliberMetricId, setCaliberMetricId] = useState<string | null>(null);
  const [badcaseDrawerOpen, setBadcaseDrawerOpen] = useState(false);
  const [badcaseType, setBadcaseType] = useState<'batch'>('batch');
  const [traceDrawerOpen, setTraceDrawerOpen] = useState(false);
  const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
  const [isTrendExpanded, setIsTrendExpanded] = useState(true);
  const [trendDrawerOpen, setTrendDrawerOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);

  // Badcase form states
  const [processingMethod, setProcessingMethod] = useState('new'); // 'new' or 'existing'
  const [issueTitle, setIssueTitle] = useState('');
  const [selectedExistingIssueId, setSelectedExistingIssueId] = useState('');
  const [assignee, setAssignee] = useState('AI运营人员');
  const [priority, setPriority] = useState('P2');
  const [toastInfo, setToastInfo] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });

  useEffect(() => {
    if (existingIssues.length > 0 && !selectedExistingIssueId) {
      setSelectedExistingIssueId(existingIssues[0].id);
    }
  }, [existingIssues, selectedExistingIssueId]);

  const [blockDimension, setBlockDimension] = useState<'round' | 'reason'>('round');
  const [hitDimension, setHitDimension] = useState<'intent' | 'channel'>('intent');
  const [llmDimension, setLlmDimension] = useState<'intent' | 'format'>('intent');
  const [selectedBlockSlice, setSelectedBlockSlice] = useState<string | null>(null);

  // Query Rewrite filters
  const [rewriteErrorType, setRewriteErrorType] = useState<string | null>(null);
  const [rewriteOps, setRewriteOps] = useState<string[]>([]);
  const [evalRewriteOps, setEvalRewriteOps] = useState<string[]>([]);
  const [opConsistency, setOpConsistency] = useState<string | null>(null);
  const [e2eAgentValid, setE2eAgentValid] = useState<string | null>(null);
  const [rewriteCount, setRewriteCount] = useState<string | null>(null);
  const [blockErrorType, setBlockErrorType] = useState<string[]>([]);
  const [roundTypeCorrectness, setRoundTypeCorrectness] = useState<string | null>(null);
  const [rrfTopKHit, setRrfTopKHit] = useState<string | null>(null);
  const [rerankerTop1Consistency, setRerankerTop1Consistency] = useState<string | null>(null);
  const [isDirectOutput, setIsDirectOutput] = useState<string | null>(null);
  const [rerankerDirectConsistency, setRerankerDirectConsistency] = useState<string | null>(null);
  const [evalModelPassed, setEvalModelPassed] = useState<string | null>(null);
  const [intentErrorType, setIntentErrorType] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [jumpPage, setJumpPage] = useState('1');
  const [selectedSampleIds, setSelectedSampleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedBlockSlice(null);
    setRewriteErrorType(null);
    setRewriteOps([]);
    setEvalRewriteOps([]);
    setOpConsistency(null);
    setE2eAgentValid(null);
    setRewriteCount(null);
    setBlockErrorType([]);
    setRoundTypeCorrectness(null);
    setRrfTopKHit(null);
    setRerankerTop1Consistency(null);
    setIsDirectOutput(null);
    setRerankerDirectConsistency(null);
    setEvalModelPassed(null);
    setIntentErrorType(null);
    
    setCurrentPage(1);
    setJumpPage('1');
    setSelectedSampleIds(new Set());
  }, [blockDimension, selectedMetricId, hitDimension, llmDimension]);

  useEffect(() => {
    setCurrentPage(1);
    setJumpPage('1');
    setSelectedSampleIds(new Set());
  }, [selectedBlockSlice, pageSize]);

  useEffect(() => {
    setJumpPage(String(currentPage));
  }, [currentPage]);

  const [localChannel, setLocalChannel] = useState<Channel>(channel);

  const setTimeRange = onTimeRangeChange;
  const setStartDate = onStartDateChange;
  const setEndDate = onEndDateChange;

  useEffect(() => {
    setLocalChannel(channel);
  }, [channel]);

  const caliberMetric = useMemo(() => 
    metrics.find(m => m.id === (caliberMetricId || selectedMetricId)) || selectedMetric
  , [caliberMetricId, selectedMetricId, selectedMetric]);

  const currentData = useMemo(() => {
    const chData = localChannel === 'all' 
      ? { 
          total: baseData.phone.total + baseData.online.total,
          rewriteN: baseData.phone.rewriteN + baseData.online.rewriteN,
          correct: baseData.phone.correct + baseData.online.correct,
          hit: baseData.phone.hit + baseData.online.hit,
          recall: baseData.phone.recall + baseData.online.recall,
          latency: (baseData.phone.latency * baseData.phone.total + baseData.online.latency * baseData.online.total) / (baseData.phone.total + baseData.online.total)
        }
      : baseData[localChannel];
    
    return chData;
  }, [localChannel]);

  // Convert endDate '2026/09/08' or '2026-09-08' to '09-08' trend key
  const dateKey = useMemo(() => {
    if (!endDate) return '09-08';
    const separator = endDate.includes('-') ? '-' : '/';
    const parts = endDate.split(separator);
    if (parts.length === 3) {
      return `${parts[1]}-${parts[2]}`;
    }
    return '09-08';
  }, [endDate]);

  const dayTrend = useMemo(() => {
    return dailyTrends.find(t => t.date === dateKey) || dailyTrends[dailyTrends.length - 1];
  }, [dateKey]);

  const getMetricValueForDate = useCallback((m: Metric) => {
    if (dayTrend && dayTrend[m.name as keyof typeof dayTrend] !== undefined) {
      return dayTrend[m.name as keyof typeof dayTrend] as number;
    }
    if (m.id === 'latency') return currentData.latency;
    if (!m.n || !m.d) return 0;
    return ((currentData[m.n as keyof typeof currentData] as number) / (currentData[m.d as keyof typeof currentData] as number)) * 100;
  }, [dayTrend, currentData]);

  const value = useMemo(() => {
    return getMetricValueForDate(selectedMetric);
  }, [selectedMetric, getMetricValueForDate]);

  const isSelectedTargetProvided = useMemo(() => {
    return typeof selectedMetric.target === 'number';
  }, [selectedMetric]);

  const isBad = useMemo(() => {
    if (!isSelectedTargetProvided || typeof selectedMetric.target !== 'number') return false;
    return selectedMetric.dir === 'lt' ? value > selectedMetric.target : value < selectedMetric.target;
  }, [selectedMetric, value, isSelectedTargetProvided]);

  const prevValue = useMemo(() => {
    const noiseMap: Record<string, number> = {
      'hit': 94.20,
      'recall': 96.10,
      'direct': 94.80,
      'operations': 92.50,
      'query': 88.40,
      'block': 4.25,
      'missed': 20.80,
      'llm': 96.80,
      'reject': 91.20,
      'latency': 750
    };
    return noiseMap[selectedMetric.id] || value * 0.98;
  }, [selectedMetric.id, value]);

  const diff = value - prevValue;
  const isBetter = selectedMetric.dir === 'lt' ? diff < 0 : diff > 0;

  const chartData = useMemo(() => {
    return dailyTrends.map(t => ({
      name: t.date,
      value: t[selectedMetric.name as keyof typeof t] as number || 90
    }));
  }, [selectedMetric]);

  const durationDays = useMemo(() => {
    if (timeRange === '今日' || timeRange === '昨日') return 1;
    if (timeRange === '近7天') return 7;
    if (timeRange === '近30天') return 30;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }, [timeRange, startDate, endDate]);

  const metricTrendData = useMemo(() => {
    // Determine dates list based on timeRange and date selections
    let endDateObj = new Date(endDate);
    let startDateObj = new Date(endDateObj.getTime() - (durationDays - 1) * 24 * 60 * 60 * 1000);

    if (timeRange === '自定义') {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
    } else if (timeRange === '昨日') {
      const yesterday = new Date(endDateObj.getTime() - 24 * 60 * 60 * 1000);
      startDateObj = yesterday;
      endDateObj = yesterday;
    }

    const dateList: string[] = [];
    for (let i = 0; i < durationDays; i++) {
      const cur = new Date(startDateObj.getTime() + i * 24 * 60 * 60 * 1000);
      const str = `${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      dateList.push(str);
    }

    // Base 7-day data mappings per channel (phone, online)
    const blockMap: Record<string, { phone: { n: number, d: number }, online: { n: number, d: number } }> = {
      '09-02': { phone: { n: 295, d: 7000 }, online: { n: 275, d: 7000 } },
      '09-03': { phone: { n: 322, d: 7000 }, online: { n: 298, d: 7000 } },
      '09-04': { phone: { n: 338, d: 7000 }, online: { n: 312, d: 7000 } },
      '09-05': { phone: { n: 365, d: 7000 }, online: { n: 335, d: 7000 } },
      '09-06': { phone: { n: 374, d: 7000 }, online: { n: 346, d: 7000 } },
      '09-07': { phone: { n: 352, d: 7000 }, online: { n: 328, d: 7000 } },
      '09-08': { phone: { n: 428, d: 7000 }, online: { n: 392, d: 7000 } }
    };

    const missedMap: Record<string, { phone: { n: number, d: number }, online: { n: number, d: number } }> = {
      '09-02': { phone: { n: 2210, d: 10700 }, online: { n: 2090, d: 10700 } },
      '09-03': { phone: { n: 2260, d: 10700 }, online: { n: 2140, d: 10700 } },
      '09-04': { phone: { n: 2315, d: 10700 }, online: { n: 2185, d: 10700 } },
      '09-05': { phone: { n: 2370, d: 10700 }, online: { n: 2230, d: 10700 } },
      '09-06': { phone: { n: 2340, d: 10700 }, online: { n: 2210, d: 10700 } },
      '09-07': { phone: { n: 2380, d: 10700 }, online: { n: 2240, d: 10700 } },
      '09-08': { phone: { n: 2420, d: 10700 }, online: { n: 2280, d: 10700 } }
    };

    const operationsMap: Record<string, { phone: { n: number, d: number }, online: { n: number, d: number } }> = {
      '09-02': { phone: { n: 7020, d: 7250 }, online: { n: 7030, d: 7250 } },
      '09-03': { phone: { n: 7035, d: 7250 }, online: { n: 7045, d: 7250 } },
      '09-04': { phone: { n: 7028, d: 7250 }, online: { n: 7037, d: 7250 } },
      '09-05': { phone: { n: 7042, d: 7250 }, online: { n: 7053, d: 7250 } },
      '09-06': { phone: { n: 7050, d: 7250 }, online: { n: 7060, d: 7250 } },
      '09-07': { phone: { n: 7035, d: 7250 }, online: { n: 7045, d: 7250 } },
      '09-08': { phone: { n: 7030, d: 7250 }, online: { n: 7040, d: 7250 } }
    };

    const queryMap: Record<string, { phone: { n: number, d: number }, online: { n: number, d: number } }> = {
      '09-02': { phone: { n: 7042, d: 7250 }, online: { n: 7052, d: 7250 } },
      '09-03': { phone: { n: 7050, d: 7250 }, online: { n: 7059, d: 7250 } },
      '09-04': { phone: { n: 7035, d: 7250 }, online: { n: 7045, d: 7250 } },
      '09-05': { phone: { n: 7057, d: 7250 }, online: { n: 7066, d: 7250 } },
      '09-06': { phone: { n: 7064, d: 7250 }, online: { n: 7074, d: 7250 } },
      '09-07': { phone: { n: 7050, d: 7250 }, online: { n: 7059, d: 7250 } },
      '09-08': { phone: { n: 7045, d: 7250 }, online: { n: 7055, d: 7250 } }
    };

    const currentMap = selectedMetricId === 'block' ? blockMap : 
                       (selectedMetricId === 'missed' ? missedMap : 
                       (selectedMetricId === 'operations' ? operationsMap : 
                       (selectedMetricId === 'query' ? queryMap : null)));

    const seed = startDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + 
                 endDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return dateList.map((dStr, idx) => {
      if (currentMap && currentMap[dStr]) {
        const item = currentMap[dStr];
        let n = 0;
        let d = 0;
        if (localChannel === 'phone') {
          n = item.phone.n;
          d = item.phone.d;
        } else if (localChannel === 'online') {
          n = item.online.n;
          d = item.online.d;
        } else {
          n = item.phone.n + item.online.n;
          d = item.phone.d + item.online.d;
        }
        const val = Number(((n / d) * 100).toFixed(2));
        return { date: dStr, numerator: n, denominator: d, value: val };
      }

      // If outside the 7 default dates, compute deterministic synthetic values aligned with Overview
      const trendRow = dailyTrends.find(t => t.date === dStr);
      const baseVal = trendRow && trendRow[selectedMetric.name as keyof typeof trendRow] !== undefined
        ? (trendRow[selectedMetric.name as keyof typeof trendRow] as number)
        : (selectedMetric.id === 'block' ? 4.8 : (selectedMetric.id === 'missed' ? 21.4 : 97.1));

      const chFactor = localChannel === 'phone' ? 1.02 : localChannel === 'online' ? 0.98 : 1.0;
      const noise = Math.sin(seed + idx) * 0.04;
      const finalVal = Number((baseVal * chFactor * (1 + noise)).toFixed(2));
      const totalD = localChannel === 'all' ? 14000 : 7000;
      const totalN = Math.round((finalVal / 100) * totalD);

      return {
        date: dStr,
        numerator: totalN,
        denominator: totalD,
        value: finalVal
      };
    });
  }, [selectedMetricId, selectedMetric.name, localChannel, timeRange, startDate, endDate, durationDays]);

  const yDomain = useMemo(() => {
    if (selectedMetricId === 'block') return [0, 8.5];
    if (selectedMetricId === 'missed') return [0, 30.0];
    if (selectedMetricId === 'operations' || selectedMetricId === 'query') return [90.0, 100.0];
    if (selectedMetricId === 'llm' || selectedMetricId === 'reject' || selectedMetricId === 'hit' || selectedMetricId === 'recall' || selectedMetricId === 'direct') return [85.0, 100.0];
    return [0, 100.0];
  }, [selectedMetricId]);

  const yTicks = useMemo(() => {
    if (selectedMetricId === 'block') return [0.0, 4.3, 8.5];
    if (selectedMetricId === 'missed') return [0.0, 15.0, 30.0];
    if (selectedMetricId === 'operations' || selectedMetricId === 'query') return [90.0, 95.0, 100.0];
    if (selectedMetricId === 'llm' || selectedMetricId === 'reject' || selectedMetricId === 'hit' || selectedMetricId === 'recall' || selectedMetricId === 'direct') return [85.0, 92.5, 100.0];
    return [0.0, 50.0, 100.0];
  }, [selectedMetricId]);

  const TrendCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#182334] text-white text-[12px] px-2.5 py-1 rounded shadow-lg font-mono">
          {data.date} · {data.value.toFixed(2)}% · {data.numerator.toLocaleString()}/{data.denominator.toLocaleString()}
        </div>
      );
    }
    return null;
  };

  const breakdownData = [
    { label: '信用卡补卡', count: 450 },
    { label: '信用卡账单分期', count: 250 },
    { label: '信用卡挂失', count: 150 },
    { label: '信用卡额度调整', count: 80 }
  ];

  const errorBuckets = [
    { id: '1', label: '正确意图未进入融合候选', code: 'GOLD_NOT_IN_RRF', count: 500, note: '两路召回均未命中' },
    { id: '2', label: 'Reranker Top1 与评估意图不一致', code: 'REGRESSION', count: 430, note: '精排排序偏差' }
  ];

  const totalErrors = breakdownData.reduce((s, x) => s + x.count, 0);

  // False Block Rate (TG-FBR / 误拦截率) data definitions
  const blockRoundData = useMemo(() => [
    { label: 'NEED_PLUS', count: 533, percent: 65.0 },
    { label: 'SLOT_VALUE', count: 123, percent: 15.0 },
    { label: 'ENDING', count: 164, percent: 20.0 }
  ], []);

  const blockReasonData = useMemo(() => [
    { label: 'MODEL_NEED_PLUS', count: 410, percent: 50.0 },
    { label: 'RULE_EXPLICIT_BUSINESS', count: 246, percent: 30.0 },
    { label: 'MODEL_NO_PLUS_HIGH_CONFIDENCE', count: 164, percent: 20.0 }
  ], []);

  const blockSamples = useMemo(() => {
    const records: any[] = [];
    const statuses = ['未提交', '待复核', '已确认问题'];

    const createBatch = (count: number, round: string, reason: string, expression: string, tag: string, type: string, refVal: string = '放行', actualVal: string = '拦截') => {
      for (let i = 0; i < count; i++) {
        const idNum = records.length + 1;
        records.push({
          id: `S${String(idNum).padStart(3, '0')}`,
          expression,
          meta: `09-08 · D08-BLOCK-P-${String(idNum).padStart(4, '0')} · 电话客服`,
          tag,
          ref: refVal,
          actual: actualVal,
          type,
          status: statuses[idNum % 3],
          round,
          reason,
          blockErrorType: refVal === actualVal ? '放行' : (i % 10 === 0 ? '类型误判' : '误拦截')
        });
      }
    };

    // Distribute records
    // Add some correct 'Pass/Pass' samples at the top
    createBatch(1, 'NEED_PLUS', 'MODEL_NEED_PLUS', '你好，我想办理信用卡挂失。', '信用卡挂失 · 单轮完整表达', '', '放行', '放行');
    createBatch(2, 'NEED_PLUS', 'MODEL_NEED_PLUS', '我想查询一下我的账单。', '账单查询 · 单轮完整表达', '正常放行样本', '放行', '放行');

    // 533 NEED_PLUS records
    createBatch(410, 'NEED_PLUS', 'MODEL_NEED_PLUS', '对，帮我办理刚才说的业务。', '', '上下文业务诉求被拦截');
    createBatch(123, 'NEED_PLUS', 'RULE_EXPLICIT_BUSINESS', '你好，我想补办信用卡。', '信用卡补卡 · 单轮完整表达', '上下文业务诉求被拦截');
    
    // Remaining correct samples
    createBatch(49, 'NEED_PLUS', 'MODEL_NEED_PLUS', '我想查询一下我的账单。', '账单查询 · 单轮完整表达', '正常放行样本', '放行', '放行');
    createBatch(30, 'NEED_PLUS', 'RULE_EXPLICIT_BUSINESS', '帮我查一下这笔交易。', '交易查询 · 单轮完整表达', '正常放行样本', '放行', '放行');

    // 123 SLOT_VALUE records
    createBatch(123, 'SLOT_VALUE', 'RULE_EXPLICIT_BUSINESS', '这笔分期利息是多少？', '账单分期 · 信息咨询', '会话状态与门控动作冲突');
    
    // 164 ENDING records
    createBatch(164, 'ENDING', 'MODEL_NO_PLUS_HIGH_CONFIDENCE', '好的谢谢。', '结束语 · 礼貌用语', '短句 / 转写片段被拦截');

    return records;
  }, []);

  // Missed Block Rate (TG-MBR / 漏拦截率) data definitions
  const missedRoundData = useMemo(() => [
    { label: 'SLOT_VALUE', count: 2350, percent: 50.0 },
    { label: 'ENDING', count: 2350, percent: 50.0 }
  ], []);

  const missedSamples = useMemo(() => {
    const records: any[] = [];
    const statuses = ['未提交', '待复核', '已确认问题'];

    const createMissedBatch = (count: number, round: string, type: string, expression: string, tag: string) => {
      for (let i = 0; i < count; i++) {
        const idNum = records.length + 1;
        records.push({
          id: `S${String(idNum).padStart(4, '0')}`,
          expression,
          meta: `09-08 · D08-MISSED-P-${String(idNum).padStart(4, '0')} · 电话客服`,
          tag,
          ref: '拦截：无效片段',
          actual: '放行',
          type,
          status: statuses[idNum % 3],
          round,
          blockErrorType: '漏拦截'
        });
      }
    };

    createMissedBatch(2350, 'SLOT_VALUE', '无效片段被放行', '呃，嗯……', '');
    createMissedBatch(1410, 'ENDING', '槽位回复被放行', '好的我知道了。', '账单分期 · 信息咨询');
    createMissedBatch(940, 'ENDING', '附和 / 结束语被放行', '对，好的。', '结束语 · 礼貌用语');

    return records;
  }, []);

  // Operations Consistency Rate (QR-OP-SET-MATCH / 模型与 Judge 操作集合一致率) data definitions
  const operationsRoundData = useMemo(() => [
    { label: 'CTX_CORRECTION', count: 215, percent: 50.0 },
    { label: 'CTX_COREFERENCE', count: 129, percent: 30.0 },
    { label: 'CTX_COMPLETION', count: 86, percent: 20.0 }
  ], []);

  const operationsSamples = useMemo(() => {
    const records: any[] = [];
    const statuses = ['未提交', '待复核', '已确认问题'];
    const errorTypes = ['仅漏报操作', '仅多报操作', '同时漏报与多报'];
    const ops = ['修正替换', '指代还原', '上下文补全', '增量合并'];
    const counts = ['单操作（1项）', '多操作（2项及以上）'];

    const createOpsBatch = (count: number, ref: string, actual: string, type: string, expression: string, tag: string) => {
      for (let i = 0; i < count; i++) {
        const idNum = records.length + 1;
        records.push({
          id: `S${String(idNum).padStart(4, '0')}`,
          expression,
          meta: `09-08 · D08-OPERATIONS-P-${String(idNum).padStart(4, '0')} · 电话客服`,
          tag,
          ref,
          actual,
          type,
          status: statuses[idNum % 3],
          round: ref,
          rewriteErrorType: errorTypes[idNum % 3],
          rewriteOps: [ops[idNum % 4]],
          rewriteCount: counts[idNum % 2]
        });
      }
    };

    createOpsBatch(14, 'CTX_CORRECTION', 'NONE_KEEP', '应执行操作漏报', '对，帮我办理刚才说的业务。', '');
    createOpsBatch(8, 'CTX_COREFERENCE', 'NONE_KEEP', '应执行操作多报', '对，帮我办理刚才说的业务。', '');
    createOpsBatch(7, 'CTX_COMPLETION', 'NONE_KEEP', '操作组合不一致', '你好，我想办理信用卡账单分期。', '信用卡账单分期 · 单轮完整表达');

    return records;
  }, []);

  // Model-Judge End-to-End Proxy Accuracy (QR-E2E-PROXY-ACC / 模型-Judge 端到端代理准确率) data definitions
  const queryRoundData = useMemo(() => [
    { label: 'CTX_CORRECTION', count: 14, percent: 48.3 },
    { label: 'CTX_COREFERENCE', count: 8, percent: 27.6 },
    { label: 'CTX_COMPLETION', count: 7, percent: 24.1 }
  ], []);

  const querySamples = useMemo(() => {
    const records: any[] = [];
    const statuses = ["未提交", "待复核", "已确认问题"];
    const errorTypes = ["仅漏报操作", "仅多报操作", "同时漏报与多报"];
    const ops = ["修正替换", "指代还原", "上下文补全", "增量合并"];
    const counts = ["单操作（1项）", "多操作（2项及以上）"];

    const createQueryBatch = (count: number, ref: string, actual: string, type: string, expression: string, tag: string) => {
      for (let i = 0; i < count; i++) {
        const idNum = records.length + 1;
        records.push({
          id: `Q${String(idNum).padStart(4, "0")}`,
          expression,
          meta: `09-08 · D08-QUERY-P-${String(idNum).padStart(4, "0")} · 电话客服`,
          tag,
          ref,
          actual,
          type,
          status: statuses[idNum % 3],
          round: ref,
          rewriteErrorType: errorTypes[idNum % 3],
          rewriteOps: [ops[idNum % 4]],
          rewriteCount: counts[idNum % 2]
        });
      }
    };

    createQueryBatch(14, "CTX_CORRECTION", "取消补办信用卡", "槽位或否定信息丢失", "对，帮我办理刚才说的业务。", "");
    createQueryBatch(8, "CTX_COREFERENCE", "取消补办信用卡", "槽位或否定信息丢失", "对，帮我办理刚才说的业务。", "");
    createQueryBatch(7, "CTX_COMPLETION", "取消补办信用卡", "槽位或否定信息丢失", "你好，我想补办信用卡。", "信用卡补卡 · 单轮完整表达");
    return records;
  }, []);

  // RRF Hit@K (HJ_RRF_HIT_AT_K / RRF 前K命中率) data definitions matching user screenshot
  const recallRoundData = useMemo(() => [
    { label: 'Sparse', count: 1295, percent: 50.0 },
    { label: 'RRF', count: 1295, percent: 50.0 }
  ], []);

  const recallSamples = useMemo(() => {
    const records: any[] = [];
    const statusList = ['未提交', '待复核', '已确认问题'];
    
    // Explicit 5 rows matching user image
    const imgRows = [
      {
        expression: '对，帮我办理刚才说的业务。',
        meta: '09-02 · D02-RECALL-P-0001 · 电话客服',
        tag: '',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '两路召回均未命中',
        status: '已确认问题',
        round: 'Sparse'
      },
      {
        expression: '对，帮我办理刚才说的业务。',
        meta: '09-02 · D02-RECALL-P-0002 · 电话客服',
        tag: '',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '两路召回均未命中',
        status: '未提交',
        round: 'Sparse'
      },
      {
        expression: '对，帮我办理刚才说的业务。',
        meta: '09-02 · D02-RECALL-P-0003 · 电话客服',
        tag: '',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '两路召回均未命中',
        status: '待复核',
        round: 'Sparse'
      },
      {
        expression: '你好，我想补办信用卡。',
        meta: '09-02 · D02-RECALL-P-0004 · 电话客服',
        tag: '信用卡补卡 · 单轮完整表达',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '两路召回均未命中',
        status: '未提交',
        round: 'Sparse'
      },
      {
        expression: '办理信用卡账单分期。',
        meta: '09-02 · D02-RECALL-P-0005 · 电话客服',
        tag: '信用卡账单分期 · 单轮短句 / 片段',
        ref: '信用卡账单分期',
        actual: '信用卡还款',
        type: '两路召回均未命中',
        status: '待复核',
        round: 'Sparse'
      }
    ];

    imgRows.forEach((r, idx) => {
      records.push({
        id: `S${String(idx + 1).padStart(4, '0')}`,
        ...r
      });
    });

    // Fill remaining Sparse samples up to 1295 (idx 5 to 1294)
    for (let i = 5; i < 1295; i++) {
      const idNum = i + 1;
      const isCard = i % 2 === 0;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: isCard ? '对，帮我办理刚才说的业务。' : '办理信用卡账单分期。',
        meta: `09-02 · D02-RECALL-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: isCard ? '' : '信用卡账单分期 · 单轮短句 / 片段',
        ref: isCard ? '信用卡补卡' : '信用卡账单分期',
        actual: isCard ? '信用卡换卡' : '信用卡还款',
        type: '两路召回均未命中',
        status: statusList[i % 3],
        round: 'Sparse',
        recallRrfHit: '否',
        recallRerankerHit: i % 10 === 0 ? '是' : '否'
      });
    }

    // 777 RRF samples for 融合截断丢失正确候选 (idNum 1296 to 2072)
    for (let i = 1295; i < 2072; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '你好，我想办理信用卡账单分期。',
        meta: `09-02 · D02-RECALL-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡账单分期 · 单轮完整表达',
        ref: '办理信用卡账单分期',
        actual: '账单分期试算',
        type: '融合截断丢失正确候选',
        status: statusList[i % 3],
        round: 'RRF',
        recallRrfHit: '是',
        recallRerankerHit: '否'
      });
    }

    // 518 RRF samples for 零候选 (idNum 2073 to 2590)
    for (let i = 2072; i < 2590; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想挂失这张信用卡，被盗刷了。',
        meta: `09-02 · D02-RECALL-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡挂失 · 紧急业务',
        ref: '挂失信用卡',
        actual: '零候选',
        type: '零候选',
        status: statusList[i % 3],
        round: 'RRF',
        recallRrfHit: i % 5 === 0 ? '是' : '否',
        recallRerankerHit: '否'
      });
    }

    return records;
  }, []);

  // Reranker Top1 Accuracy (HJ_RERANK_TOP1_ACC / Reranker Top1 准确率) data definitions
  const hitIntentData = useMemo(() => [
    { label: '信用卡补卡', count: 2758, percent: 48.0 },
    { label: '信用卡账单分期', count: 1547, percent: 27.0 },
    { label: '信用卡挂失', count: 861, percent: 15.0 },
    { label: '信用卡额度调整', count: 574, percent: 10.0 }
  ], []);

  const hitChannelData = useMemo(() => [
    { label: '电话客服', count: 4620, percent: 80.5 },
    { label: '在线客服', count: 1120, percent: 19.5 }
  ], []);

  const hitSamples = useMemo(() => {
    const records: any[] = [];
    const statusList = ['未提交', '待复核', '已确认问题'];
    
    // Explicit 8 rows matching user image
    for (let i = 1; i <= 7; i++) {
      records.push({
        id: `S${String(i).padStart(4, '0')}`,
        expression: '对，帮我办理刚才说的业务。',
        meta: `09-02 · D02-HIT-P-${String(i).padStart(4, '0')} · 电话客服`,
        tag: '',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '正确意图未进入融合候选',
        status: statusList[i % 3],
        round: '信用卡补卡',
        channel: '电话客服',
        recallRrfHit: '否',
        recallRerankerHit: '否'
      });
    }

    records.push({
      id: 'S0008',
      expression: '你好，我想补办信用卡。',
      meta: '09-02 · D02-HIT-P-0008 · 电话客服',
      tag: '信用卡补卡 · 单轮完整表达',
      ref: '信用卡补卡',
      actual: '信用卡换卡',
      type: '正确意图未进入融合候选',
      status: '未提交',
      round: '信用卡补卡',
      channel: '电话客服',
      recallRrfHit: '否',
      recallRerankerHit: '否'
    });

    // Fill remaining 信用卡补卡 from idx 8 to 2757 (idNum 9 to 2758)
    for (let i = 8; i < 2758; i++) {
      const idNum = i + 1;
      const isPhone = idNum <= 4620;
      const isGold = i < 1244; // 1244 total GOLD errors for 信用卡补卡
      const isAlt = i % 2 === 0;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: isAlt ? '对，帮我办理刚才说的业务。' : '你好，我想补办信用卡。',
        meta: `09-02 · D02-HIT-${isPhone ? 'P' : 'O'}-${String(idNum).padStart(4, '0')} · ${isPhone ? '电话客服' : '在线客服'}`,
        tag: isAlt ? '' : '信用卡补卡 · 单轮完整表达',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: isGold ? '正确意图未进入融合候选' : 'Reranker Top1 与评估意图不一致',
        status: statusList[i % 3],
        round: '信用卡补卡',
        channel: isPhone ? '电话客服' : '在线客服',
        recallRrfHit: i % 3 === 0 ? '是' : '否',
        recallRerankerHit: '否'
      });
    }

    // Fill 信用卡账单分期 (1,547 items: idNum 2759 to 4305) -> 698 GOLD, 849 REGRESSION
    for (let i = 2758; i < 4305; i++) {
      const idNum = i + 1;
      const isPhone = idNum <= 4620;
      const isGold = (i - 2758) < 698;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '办理信用卡账单分期。',
        meta: `09-02 · D02-HIT-${isPhone ? 'P' : 'O'}-${String(idNum).padStart(4, '0')} · ${isPhone ? '电话客服' : '在线客服'}`,
        tag: '信用卡账单分期 · 单轮短句 / 片段',
        ref: '信用卡账单分期',
        actual: '信用卡还款',
        type: isGold ? '正确意图未进入融合候选' : 'Reranker Top1 与评估意图不一致',
        status: statusList[i % 3],
        round: '信用卡账单分期',
        channel: isPhone ? '电话客服' : '在线客服',
        recallRrfHit: '是',
        recallRerankerHit: '否'
      });
    }

    // Fill 信用卡挂失 (861 items: idNum 4306 to 5166) -> 388 GOLD, 473 REGRESSION
    for (let i = 4305; i < 5166; i++) {
      const idNum = i + 1;
      const isPhone = idNum <= 4620;
      const isGold = (i - 4305) < 388;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想挂失这张信用卡，被盗刷了。',
        meta: `09-02 · D02-HIT-${isPhone ? 'P' : 'O'}-${String(idNum).padStart(4, '0')} · ${isPhone ? '电话客服' : '在线客服'}`,
        tag: '信用卡挂失 · 紧急业务',
        ref: '信用卡挂失',
        actual: '信用卡解挂',
        type: isGold ? '正确意图未进入融合候选' : 'Reranker Top1 与评估意图不一致',
        status: statusList[i % 3],
        round: '信用卡挂失',
        channel: isPhone ? '电话客服' : '在线客服',
        recallRrfHit: i % 2 === 0 ? '是' : '否',
        recallRerankerHit: '否'
      });
    }

    // Fill 信用卡额度调整 (574 items: idNum 5167 to 5740) -> 260 GOLD, 314 REGRESSION
    for (let i = 5166; i < 5740; i++) {
      const idNum = i + 1;
      const isPhone = idNum <= 4620;
      const isGold = (i - 5166) < 260;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想提高我的信用卡临时额度。',
        meta: `09-02 · D02-HIT-${isPhone ? 'P' : 'O'}-${String(idNum).padStart(4, '0')} · ${isPhone ? '电话客服' : '在线客服'}`,
        tag: '信用卡额度调整 · 单轮完整表达',
        ref: '信用卡额度调整',
        actual: '固定额度调整',
        type: isGold ? '正确意图未进入融合候选' : 'Reranker Top1 与评估意图不一致',
        status: statusList[i % 3],
        round: '信用卡额度调整',
        channel: isPhone ? '电话客服' : '在线客服',
        recallRrfHit: '是',
        recallRerankerHit: '否'
      });
    }

    return records;
  }, []);

  // Reranker Direct Return Accuracy (HJ_DIRECT_RETURN_ACC / Reranker 直出意图准确率) data definitions
  const directRoundData = useMemo(() => [
    { label: 'direct_return', count: 1344, percent: 30.0 },
    { label: 'intent_routing', count: 2240, percent: 50.0 },
    { label: 'error', count: 896, percent: 20.0 }
  ], []);

  const directSamples = useMemo(() => {
    const records: any[] = [];
    const statusList = ['未提交', '待复核', '已确认问题'];
    
    // Explicit 8 rows matching user image
    for (let i = 1; i <= 6; i++) {
      records.push({
        id: `S${String(i).padStart(4, '0')}`,
        expression: '对，帮我办理刚才说的业务。',
        meta: `09-02 · D02-DIRECT-P-${String(i).padStart(4, '0')} · 电话客服`,
        tag: '',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '直出前已缺失正确候选',
        status: statusList[i % 3],
        round: 'direct_return',
        channel: '电话客服',
        recallRrfHit: '否',
        recallRerankerHit: '否'
      });
    }

    for (let i = 7; i <= 8; i++) {
      records.push({
        id: `S${String(i).padStart(4, '0')}`,
        expression: '你好，我想补办信用卡。',
        meta: `09-02 · D02-DIRECT-P-${String(i).padStart(4, '0')} · 电话客服`,
        tag: '信用卡补卡 · 单轮完整表达',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '直出前已缺失正确候选',
        status: statusList[i % 3],
        round: 'direct_return',
        channel: '电话客服',
        recallRrfHit: '否',
        recallRerankerHit: '否'
      });
    }

    // Fill remaining direct_return (idx 8 to 1343, idNum 9 to 1344)
    for (let i = 8; i < 1344; i++) {
      const idNum = i + 1;
      const isPhone = idNum <= 3584;
      const isAlt = i % 2 === 0;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: isAlt ? '对，帮我办理刚才说的业务。' : '你好，我想补办信用卡。',
        meta: `09-02 · D02-DIRECT-${isPhone ? 'P' : 'O'}-${String(idNum).padStart(4, '0')} · ${isPhone ? '电话客服' : '在线客服'}`,
        tag: isAlt ? '' : '信用卡补卡 · 单轮完整表达',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '直出前已缺失正确候选',
        status: statusList[i % 3],
        round: 'direct_return',
        channel: isPhone ? '电话客服' : '在线客服',
        recallRrfHit: '是',
        recallRerankerHit: '否'
      });
    }

    // Fill intent_routing (2,240 items: idNum 1345 to 3584)
    for (let i = 1344; i < 3584; i++) {
      const idNum = i + 1;
      const isPhone = idNum <= 3584;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '办理信用卡账单分期。',
        meta: `09-02 · D02-DIRECT-${isPhone ? 'P' : 'O'}-${String(idNum).padStart(4, '0')} · ${isPhone ? '电话客服' : '在线客服'}`,
        tag: '信用卡账单分期 · 单轮短句 / 片段',
        ref: '信用卡账单分期',
        actual: '信用卡还款',
        type: '错误 Top1 被直接输出',
        status: statusList[i % 3],
        round: 'intent_routing',
        channel: isPhone ? '电话客服' : '在线客服',
        recallRrfHit: '是',
        recallRerankerHit: '是'
      });
    }

    // Fill error (896 items: idNum 3585 to 4480)
    for (let i = 3584; i < 4480; i++) {
      const idNum = i + 1;
      const isPhone = false; // online for the rest
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想挂失这张信用卡，被盗刷了。',
        meta: `09-02 · D02-DIRECT-${isPhone ? 'P' : 'O'}-${String(idNum).padStart(4, '0')} · ${isPhone ? '电话客服' : '在线客服'}`,
        tag: '信用卡挂失 · 紧急业务',
        ref: '信用卡挂失',
        actual: '信用卡解挂',
        type: '实际直出偏离正确 Top1',
        status: statusList[i % 3],
        round: 'error',
        channel: isPhone ? '电话客服' : '在线客服',
        recallRrfHit: '否',
        recallRerankerHit: '否'
      });
    }

    return records;
  }, []);

  // LLM Intent Recognition Accuracy (LLM-INTENT-ACC / 意图识别准确率) data definitions
  const llmIntentData = useMemo(() => [
    { label: '信用卡补卡', count: 196, percent: 50.9 },
    { label: '信用卡账单分期', count: 98, percent: 25.5 },
    { label: '信用卡挂失', count: 56, percent: 14.5 },
    { label: '信用卡额度调整', count: 35, percent: 9.1 }
  ], []);

  const llmFormatData = useMemo(() => [
    { label: '合法', count: 301, percent: 78.2 },
    { label: '不合法', count: 84, percent: 21.8 }
  ], []);

  // Reject accuracy (LLM-REJECT-ACC / 拒识命中率) data definitions
  const rejectData = useMemo(() => [
    { label: '正确拒识', count: 49, percent: 20.0 },
    { label: '误接受', count: 126, percent: 51.4 },
    { label: '误拒识', count: 70, percent: 28.6 }
  ], []);

  const rejectSamples = useMemo(() => {
    const records: any[] = [];
    
    const statusList = ['未提交', '待复核', '已确认问题'];

    // Explicit 8 rows matching user screenshot
    const first8 = [
      {
        expression: '帮我查另一家银行的账户。',
        meta: '09-02 · D02-REJECT-P-0001 · 电话客服',
        tag: '',
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: '已确认问题',
        round: '误接受'
      },
      {
        expression: '帮我查另一家银行的账户。',
        meta: '09-02 · D02-REJECT-P-0002 · 电话客服',
        tag: '信用卡补卡 · 单轮短句 / 片段',
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: '未提交',
        round: '误接受'
      },
      {
        expression: '帮我查另一家银行的账户。',
        meta: '09-02 · D02-REJECT-P-0003 · 电话客服',
        tag: '',
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: '待复核',
        round: '误接受'
      },
      {
        expression: '帮我查另一家银行的账户。',
        meta: '09-02 · D02-REJECT-P-0004 · 电话客服',
        tag: '信用卡账单分期 · 多轮指代 / 省略',
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: '未提交',
        round: '误接受'
      },
      {
        expression: '帮我查另一家银行的账户。',
        meta: '09-02 · D02-REJECT-P-0005 · 电话客服',
        tag: '信用卡额度调整 · 多轮指代 / 省略',
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: '已确认问题',
        round: '误接受'
      },
      {
        expression: '帮我查另一家银行的账户。',
        meta: '09-02 · D02-REJECT-P-0006 · 电话客服',
        tag: '信用卡补卡 · 单轮短句 / 片段',
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: '待复核',
        round: '误接受'
      },
      {
        expression: '帮我查另一家银行的账户。',
        meta: '09-02 · D02-REJECT-P-0007 · 电话客服',
        tag: '信用卡补卡 · 单轮完整表达',
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: '未提交',
        round: '误接受'
      },
      {
        expression: '帮我查另一家银行的账户。',
        meta: '09-02 · D02-REJECT-P-0008 · 电话客服',
        tag: '信用卡账单分期 · 多轮指代 / 省略',
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: '待复核',
        round: '误接受'
      }
    ];

    first8.forEach((r, idx) => {
      records.push({
        id: `S${String(idx + 1).padStart(4, '0')}`,
        channel: '电话客服',
        ...r
      });
    });

    // Fill remaining 118 超出业务范围仍接受 (idNum 9 to 126)
    for (let i = 8; i < 126; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '帮我查另一家银行的账户。',
        meta: `09-02 · D02-REJECT-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: i % 3 === 0 ? '' : (i % 3 === 1 ? '信用卡补卡 · 单轮短句 / 片段' : '信用卡账单分期 · 多轮指代 / 省略'),
        ref: '拒识',
        actual: '查询账户余额',
        type: '超出业务范围仍接受',
        status: statusList[i % 3],
        round: '误接受',
        channel: '电话客服'
      });
    }

    // 70 信息不足仍强行识别 (idNum 127 to 196)
    for (let i = 126; i < 196; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '对，就是刚才那个。',
        meta: `09-02 · D02-REJECT-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信息不足 · 省略表达',
        ref: '澄清或拒识',
        actual: '信用卡额度调整',
        type: '信息不足仍强行识别',
        status: statusList[i % 3],
        round: '误拒识',
        channel: '电话客服'
      });
    }

    // 49 风险输入未拒识 (idNum 197 to 245)
    for (let i = 196; i < 245; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '你们这个信用卡利息太高了，我要投诉！',
        meta: `09-02 · D02-REJECT-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '高风险输入 · 抱怨投诉',
        ref: '高风险拦截',
        actual: '误执行敏感业务',
        type: '风险输入未拒识',
        status: statusList[i % 3],
        round: '正确拒识',
        channel: '电话客服'
      });
    }

    return records;
  }, []);

  const llmSamples = useMemo(() => {
    const records: any[] = [];
    const statusList = ['未提交', '待复核', '已确认问题'];
    
    // Explicit 8 rows matching user screenshot
    const first8 = [
      {
        expression: '对，帮我办理刚才说的业务。',
        meta: '09-02 · D02-LLM-P-0001 · 电话客服',
        tag: '',
        ref: '信用卡补卡',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: '已确认问题',
        round: '信用卡补卡',
        format: '不合法'
      },
      {
        expression: '对，帮我办理刚才说的业务。',
        meta: '09-02 · D02-LLM-P-0002 · 电话客服',
        tag: '信用卡额度调整 · 多轮指代 / 省略',
        ref: '信用卡额度调整',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: '未提交',
        round: '信用卡额度调整',
        format: '不合法'
      },
      {
        expression: '你好，我想挂失信用卡。',
        meta: '09-02 · D02-LLM-P-0003 · 电话客服',
        tag: '信用卡挂失 · 单轮完整表达',
        ref: '信用卡挂失',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: '待复核',
        round: '信用卡挂失',
        format: '不合法'
      },
      {
        expression: '前面的查询结束了，我还要挂失信用卡。',
        meta: '09-02 · D02-LLM-P-0004 · 电话客服',
        tag: '信用卡挂失 · 其他多轮表达',
        ref: '信用卡挂失',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: '未提交',
        round: '信用卡挂失',
        format: '不合法'
      },
      {
        expression: '对，帮我办理刚才说的业务。',
        meta: '09-02 · D02-LLM-P-0005 · 电话客服',
        tag: '信用卡账单分期 · 多轮指代 / 省略',
        ref: '信用卡账单分期',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: '已确认问题',
        round: '信用卡账单分期',
        format: '不合法'
      },
      {
        expression: '你好，我想办理信用卡账单分期。',
        meta: '09-02 · D02-LLM-P-0006 · 电话客服',
        tag: '信用卡账单分期 · 单轮完整表达',
        ref: '信用卡账单分期',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: '待复核',
        round: '信用卡账单分期',
        format: '不合法'
      },
      {
        expression: '前面的查询结束了，我还要办理信用卡账单分期。',
        meta: '09-02 · D02-LLM-P-0007 · 电话客服',
        tag: '信用卡账单分期 · 其他多轮表达',
        ref: '信用卡账单分期',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: '未提交',
        round: '信用卡账单分期',
        format: '不合法'
      },
      {
        expression: '对，帮我办理刚才说的业务。',
        meta: '09-02 · D02-LLM-P-0008 · 电话客服',
        tag: '',
        ref: '信用卡补卡',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: '待复核',
        round: '信用卡补卡',
        format: '不合法'
      }
    ];

    first8.forEach((r, idx) => {
      records.push({
        id: `S${String(idx + 1).padStart(4, '0')}`,
        channel: '电话客服',
        ...r
      });
    });

    // Fill remaining 输出格式异常 (76 items: idNum 9 to 84)
    // 40 信用卡补卡 (idNum 9 to 48)
    for (let i = 8; i < 48; i++) {
      const idNum = i + 1;
      const isAlt = i % 2 === 0;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: isAlt ? '对，帮我办理刚才说的业务。' : '你好，我想补办信用卡。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: isAlt ? '' : '信用卡补卡 · 单轮完整表达',
        ref: '信用卡补卡',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: statusList[i % 3],
        round: '信用卡补卡',
        format: '不合法',
        channel: '电话客服'
      });
    }

    // 18 信用卡账单分期 (idNum 49 to 66)
    for (let i = 48; i < 66; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '办理信用卡账单分期。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡账单分期 · 单轮短句 / 片段',
        ref: '信用卡账单分期',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: statusList[i % 3],
        round: '信用卡账单分期',
        format: '不合法',
        channel: '电话客服'
      });
    }

    // 12 信用卡挂失 (idNum 67 to 78)
    for (let i = 66; i < 78; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想挂失这张信用卡，被盗刷了。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡挂失 · 紧急业务',
        ref: '信用卡挂失',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: statusList[i % 3],
        round: '信用卡挂失',
        format: '不合法',
        channel: '电话客服'
      });
    }

    // 6 信用卡额度调整 (idNum 79 to 84)
    for (let i = 78; i < 84; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想提高我的信用卡临时额度。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡额度调整 · 单轮完整表达',
        ref: '信用卡额度调整',
        actual: '输出解析失败',
        type: '输出格式异常',
        status: statusList[i % 3],
        round: '信用卡额度调整',
        format: '不合法',
        channel: '电话客服'
      });
    }

    // Fill 候选存在但最终意图错误 (189 items: idNum 85 to 273)
    // 98 信用卡补卡 (idNum 85 to 182)
    for (let i = 84; i < 182; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '你好，我想补办信用卡。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡补卡 · 单轮完整表达',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '候选存在但最终意图错误',
        status: statusList[i % 3],
        round: '信用卡补卡',
        format: '合法',
        channel: '电话客服'
      });
    }

    // 49 信用卡账单分期 (idNum 183 to 231)
    for (let i = 182; i < 231; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '办理信用卡账单分期。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡账单分期 · 单轮完整表达',
        ref: '信用卡账单分期',
        actual: '信用卡还款',
        type: '候选存在但最终意图错误',
        status: statusList[i % 3],
        round: '信用卡账单分期',
        format: '合法',
        channel: '电话客服'
      });
    }

    // 26 信用卡挂失 (idNum 232 to 257)
    for (let i = 231; i < 257; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想挂失这张信用卡，被盗刷了。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡挂失 · 紧急业务',
        ref: '信用卡挂失',
        actual: '信用卡解挂',
        type: '候选存在但最终意图错误',
        status: statusList[i % 3],
        round: '信用卡挂失',
        format: '合法',
        channel: '电话客服'
      });
    }

    // 16 信用卡额度调整 (idNum 258 to 273)
    for (let i = 257; i < 273; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想提高我的信用卡临时额度。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡额度调整 · 单轮完整表达',
        ref: '信用卡额度调整',
        actual: '固定额度调整',
        type: '候选存在但最终意图错误',
        status: statusList[i % 3],
        round: '信用卡额度调整',
        format: '合法',
        channel: '电话客服'
      });
    }

    // Fill 上下文理解偏差 (112 items: idNum 274 to 385)
    // 56 信用卡补卡 (idNum 274 to 329)
    for (let i = 273; i < 329; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '对，帮我办理刚才说的业务。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '',
        ref: '信用卡补卡',
        actual: '信用卡换卡',
        type: '上下文理解偏差',
        status: statusList[i % 3],
        round: '信用卡补卡',
        format: '合法',
        channel: '电话客服'
      });
    }

    // 28 信用卡账单分期 (idNum 330 to 357)
    for (let i = 329; i < 357; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想办理信用卡账单分期。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡账单分期 · 多轮指代 / 省略',
        ref: '信用卡账单分期',
        actual: '信用卡还款',
        type: '上下文理解偏差',
        status: statusList[i % 3],
        round: '信用卡账单分期',
        format: '合法',
        channel: '电话客服'
      });
    }

    // 16 信用卡挂失 (idNum 358 to 373)
    for (let i = 357; i < 373; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '前面的查询结束了，我还要挂失信用卡。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡挂失 · 其他多轮表达',
        ref: '信用卡挂失',
        actual: '信用卡解挂',
        type: '上下文理解偏差',
        status: statusList[i % 3],
        round: '信用卡挂失',
        format: '合法',
        channel: '电话客服'
      });
    }

    // 12 信用卡额度调整 (idNum 374 to 385)
    for (let i = 373; i < 385; i++) {
      const idNum = i + 1;
      records.push({
        id: `S${String(idNum).padStart(4, '0')}`,
        expression: '我想提高我的信用卡临时额度。',
        meta: `09-02 · D02-LLM-P-${String(idNum).padStart(4, '0')} · 电话客服`,
        tag: '信用卡额度调整 · 多轮指代 / 省略',
        ref: '信用卡额度调整',
        actual: '固定额度调整',
        type: '上下文理解偏差',
        status: statusList[i % 3],
        round: '信用卡额度调整',
        format: '合法',
        channel: '电话客服'
      });
    }

    return records;
  }, []);

  const isCustomMetric = useMemo(() => {
    return ['block', 'missed', 'operations', 'query', 'recall', 'hit', 'direct', 'llm', 'reject'].includes(selectedMetricId);
  }, [selectedMetricId]);

  const isRewriteMetric = selectedMetricId === 'operations' || selectedMetricId === 'query';
  const isBlockMetric = selectedMetricId === 'block' || selectedMetricId === 'missed';
  const isHybridMetric = ['recall', 'hit', 'direct'].includes(selectedMetricId);
  const isIntentRoutingMetric = ['llm', 'reject'].includes(selectedMetricId);

  const currentRewriteBaseSamples = useMemo(() => {
    return selectedMetricId === 'operations' ? operationsSamples : querySamples;
  }, [selectedMetricId, operationsSamples, querySamples]);

  const currentBlockBaseSamples = useMemo(() => {
    return selectedMetricId === 'block' ? blockSamples : missedSamples;
  }, [selectedMetricId, blockSamples, missedSamples]);

  const currentHybridBaseSamples = useMemo(() => {
    if (selectedMetricId === 'recall') return recallSamples;
    if (selectedMetricId === 'hit') return hitSamples;
    if (selectedMetricId === 'direct') return directSamples;
    return recallSamples;
  }, [selectedMetricId, recallSamples, hitSamples, directSamples]);

  const blockErrorTypes = useMemo(() => {
    const labels = ['TP-正确拦截', 'TP-正确放行', 'FN-误拦截', 'FP-漏拦截'];
    let base = currentBlockBaseSamples;
    return labels.map(label => ({
      label,
      count: base.filter(s => s.blockErrorType === label).length
    }));
  }, [currentBlockBaseSamples]);

  const recallRrfHits = useMemo(() => {
    const labels = ['是', '否'];
    let base = currentHybridBaseSamples;
    if (rerankerTop1Consistency) base = base.filter(s => s.rerankerTop1Consistency === rerankerTop1Consistency);
    return labels.map(label => ({
      label,
      count: base.filter(s => s.recallRrfHit === label).length
    }));
  }, [currentHybridBaseSamples, rerankerTop1Consistency]);

  const recallRerankerHits = useMemo(() => {
    const labels = ['是', '否'];
    let base = currentHybridBaseSamples;
    if (rrfTopKHit) base = base.filter(s => s.rrfTopKHit === rrfTopKHit);
    return labels.map(label => ({
      label,
      count: base.filter(s => s.recallRerankerHit === label).length
    }));
  }, [currentHybridBaseSamples, rrfTopKHit]);

  const rewriteErrorTypes = useMemo(() => {
    const labels = ['仅漏报操作', '仅多报操作', '同时漏报与多报', '数据待核验'];
    // Apply OTHER filters: rewriteOps, rewriteCount
    let base = currentRewriteBaseSamples;
    if (rewriteOps.length > 0) {
      base = base.filter(s => rewriteOps.every(op => s.rewriteOps?.includes(op)));
    }
    if (rewriteCount) {
      base = base.filter(s => s.rewriteCount === rewriteCount);
    }
    
    return labels.map(label => ({
      label,
      count: base.filter(s => s.rewriteErrorType === label).length
    }));
  }, [currentRewriteBaseSamples, rewriteOps, rewriteCount]);

  const rewriteApplicableOps = useMemo(() => {
    const labels = ['修正替换', '指代还原', '上下文补全', '增量合并', '无需操作（空集合）', '数据待核验'];
    // Apply OTHER filters: rewriteErrorType, rewriteCount
    let base = currentRewriteBaseSamples;
    if (rewriteErrorType) {
      base = base.filter(s => s.rewriteErrorType === rewriteErrorType);
    }
    if (rewriteCount) {
      base = base.filter(s => s.rewriteCount === rewriteCount);
    }

    return labels.map(label => ({
      label,
      count: base.filter(s => s.rewriteOps?.includes(label)).length
    }));
  }, [currentRewriteBaseSamples, rewriteErrorType, rewriteCount]);

  const rewriteOpCounts = useMemo(() => {
    const labels = ['无需操作（0项）', '单操作（1项）', '多操作（2项及以上）', '数据待核验'];
    // Apply OTHER filters: rewriteErrorType, rewriteOps
    let base = currentRewriteBaseSamples;
    if (rewriteErrorType) {
      base = base.filter(s => s.rewriteErrorType === rewriteErrorType);
    }
    if (rewriteOps.length > 0) {
      base = base.filter(s => rewriteOps.every(op => s.rewriteOps?.includes(op)));
    }

    return labels.map(label => ({
      label,
      count: base.filter(s => s.rewriteCount === label).length
    }));
  }, [currentRewriteBaseSamples, rewriteErrorType, rewriteOps]);

  const filteredSamples = useMemo(() => {
    let samples = selectedMetricId === 'block' ? blockSamples : 
                  (selectedMetricId === 'missed' ? missedSamples : 
                  (selectedMetricId === 'operations' ? operationsSamples : 
                  (selectedMetricId === 'query' ? querySamples : 
                  (selectedMetricId === 'recall' ? recallSamples : 
                  (selectedMetricId === 'hit' ? hitSamples : 
                  (selectedMetricId === 'direct' ? directSamples : 
                  (selectedMetricId === 'llm' ? llmSamples : 
                  (selectedMetricId === 'reject' ? rejectSamples : []))))))));
    if (samples.length === 0) return [];
    
    // Dimension filter
    if (selectedBlockSlice) {
      if (selectedMetricId === 'block') {
        if (blockDimension === 'round') {
          samples = samples.filter(s => s.round === selectedBlockSlice);
        } else {
          samples = samples.filter(s => s.reason === selectedBlockSlice);
        }
      } else if (selectedMetricId === 'hit') {
        if (hitDimension === 'intent') {
          samples = samples.filter(s => s.round === selectedBlockSlice);
        } else {
          samples = samples.filter(s => s.channel === selectedBlockSlice);
        }
      } else if (selectedMetricId === 'llm') {
        if (llmDimension === 'intent') {
          samples = samples.filter(s => s.round === selectedBlockSlice);
        } else {
          samples = samples.filter(s => s.format === selectedBlockSlice);
        }
      } else {
        samples = samples.filter(s => s.round === selectedBlockSlice);
      }
    }

    // Rewrite specific filters
    if (isRewriteMetric) {
      if (rewriteErrorType) {
        samples = samples.filter(s => s.rewriteErrorType === rewriteErrorType);
      }
      if (rewriteOps.length > 0) {
        // Multi-select: simultaneously satisfy
        samples = samples.filter(s => rewriteOps.every(op => s.rewriteOps?.includes(op)));
      }
      if (rewriteCount) {
        samples = samples.filter(s => s.rewriteCount === rewriteCount);
      }
    }

    // Block specific filters
    if (isBlockMetric) {
      if (blockErrorType.length > 0) samples = samples.filter(s => blockErrorType.includes(s.blockErrorType));
      if (roundTypeCorrectness) samples = samples.filter(s => (roundTypeCorrectness === '正确' ? s.round === s.ref : s.round !== s.ref));
    }

    // Recall specific filters
    if (isHybridMetric) {
      if (rrfTopKHit) samples = samples.filter(s => s.rrfTopKHit === rrfTopKHit);
      if (rerankerTop1Consistency) samples = samples.filter(s => s.rerankerTop1Consistency === rerankerTop1Consistency);
      if (isDirectOutput) samples = samples.filter(s => s.isDirectOutput === isDirectOutput);
      if (rerankerDirectConsistency) samples = samples.filter(s => s.rerankerDirectConsistency === rerankerDirectConsistency);
    }

    // Intent Routing specific filters
    if (isIntentRoutingMetric) {
      if (evalModelPassed) samples = samples.filter(s => s.evalModelPassed === evalModelPassed);
      if (intentErrorType) samples = samples.filter(s => s.intentErrorType === intentErrorType);
    }

    // Status filter
    if (statusFilter !== '全部') {
      samples = samples.filter(s => {
        if (statusFilter === '已确认问题') {
          return s.status === '已确认问题' || s.status === '已确认错误';
        }
        return s.status === statusFilter;
      });
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      samples = samples.filter(s => 
        s.expression.toLowerCase().includes(q) || 
        s.id.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q)
      );
    }

    return samples;
  }, [
    selectedMetricId, selectedBlockSlice, blockDimension, hitDimension, llmDimension, 
    blockSamples, missedSamples, operationsSamples, querySamples, recallSamples, 
    hitSamples, directSamples, llmSamples, rejectSamples, statusFilter, search, 
    isRewriteMetric, rewriteErrorType, rewriteOps, rewriteCount,
    isBlockMetric, blockErrorType,
    isHybridMetric, rrfTopKHit, rerankerTop1Consistency, isDirectOutput, rerankerDirectConsistency,
    isIntentRoutingMetric, evalModelPassed, intentErrorType
  ]);

  const pagedSamples = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSamples.slice(start, start + pageSize);
  }, [filteredSamples, currentPage, pageSize]);

  const totalCount = isCustomMetric ? filteredSamples.length : 1;
  const totalPages = Math.ceil(totalCount / pageSize);

  const activeBlockData = selectedMetricId === 'reject'
    ? rejectData
    : (selectedMetricId === 'llm'
        ? (llmDimension === 'format' ? llmFormatData : llmIntentData)
        : (selectedMetricId === 'direct'
            ? directRoundData
            : (selectedMetricId === 'hit'
                ? (hitDimension === 'channel' ? hitChannelData : hitIntentData)
                : (selectedMetricId === 'recall'
                    ? recallRoundData
                    : (selectedMetricId === 'missed' 
                        ? missedRoundData 
                        : ( (selectedMetricId === 'operations' || selectedMetricId === 'query') 
                            ? (selectedMetricId === 'query' ? queryRoundData : operationsRoundData)
                            : (blockDimension === 'round' ? blockRoundData : blockReasonData)))))));

  const activeRightBlockList = useMemo(() => {
    if (selectedMetricId === 'reject') {
      if (!selectedBlockSlice) {
        return [
          { 
            label: '超出业务范围仍接受', 
            desc: '核查意图目录可承接范围', 
            count: 126, 
            percent: 51.4 
          },
          { 
            label: '信息不足仍强行识别', 
            desc: '核查是否需要澄清或拒识', 
            count: 70, 
            percent: 28.6 
          },
          { 
            label: '风险输入未拒识', 
            desc: '核查风险标注和拒识规则', 
            count: 49, 
            percent: 20.0 
          }
        ];
      }
      if (selectedBlockSlice === '正确拒识') {
        return [
          { label: '超出业务范围仍接受', desc: '核查意图目录可承接范围', count: 0, percent: 0.0 },
          { label: '信息不足仍强行识别', desc: '核查是否需要澄清或拒识', count: 0, percent: 0.0 },
          { label: '风险输入未拒识', desc: '核查风险标注和拒识规则', count: 49, percent: 100.0 }
        ];
      }
      if (selectedBlockSlice === '误接受') {
        return [
          { label: '超出业务范围仍接受', desc: '核查意图目录可承接范围', count: 126, percent: 100.0 },
          { label: '信息不足仍强行识别', desc: '核查是否需要澄清或拒识', count: 0, percent: 0.0 },
          { label: '风险输入未拒识', desc: '核查风险标注和拒识规则', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === '误拒识') {
        return [
          { label: '超出业务范围仍接受', desc: '核查意图目录可承接范围', count: 0, percent: 0.0 },
          { label: '信息不足仍强行识别', desc: '核查是否需要澄清或拒识', count: 70, percent: 100.0 },
          { label: '风险输入未拒识', desc: '核查风险标注和拒识规则', count: 0, percent: 0.0 }
        ];
      }
      return [];
    }
    if (selectedMetricId === 'llm') {
      if (!selectedBlockSlice) {
        return [
          { 
            label: '输出格式异常', 
            desc: '核查模型原始输出与解析结果', 
            count: 84, 
            percent: 21.8 
          },
          { 
            label: '候选存在但最终意图错误', 
            desc: '对照候选约束、意图定义与选择理由', 
            count: 189, 
            percent: 49.1 
          },
          { 
            label: '上下文理解偏差', 
            desc: '核查最近有效业务诉求与否定', 
            count: 112, 
            percent: 29.1 
          }
        ];
      }
      if (selectedBlockSlice === '信用卡补卡') {
        return [
          { label: '输出格式异常', desc: '核查模型原始输出与解析结果', count: 42, percent: 21.4 },
          { label: '候选存在但最终意图错误', desc: '对照候选约束、意图定义与选择理由', count: 98, percent: 50.0 },
          { label: '上下文理解偏差', desc: '核查最近有效业务诉求与否定', count: 56, percent: 28.6 }
        ];
      }
      if (selectedBlockSlice === '信用卡账单分期') {
        return [
          { label: '输出格式异常', desc: '核查模型原始输出与解析结果', count: 21, percent: 21.4 },
          { label: '候选存在但最终意图错误', desc: '对照候选约束、意图定义与选择理由', count: 49, percent: 50.0 },
          { label: '上下文理解偏差', desc: '核查最近有效业务诉求与否定', count: 28, percent: 28.6 }
        ];
      }
      if (selectedBlockSlice === '信用卡挂失') {
        return [
          { label: '输出格式异常', desc: '核查模型原始输出与解析结果', count: 14, percent: 25.0 },
          { label: '候选存在但最终意图错误', desc: '对照候选约束、意图定义与选择理由', count: 26, percent: 46.4 },
          { label: '上下文理解偏差', desc: '核查最近有效业务诉求与否定', count: 16, percent: 28.6 }
        ];
      }
      if (selectedBlockSlice === '信用卡额度调整') {
        return [
          { label: '输出格式异常', desc: '核查模型原始输出与解析结果', count: 7, percent: 20.0 },
          { label: '候选存在但最终意图错误', desc: '对照候选约束、意图定义与选择理由', count: 16, percent: 45.7 },
          { label: '上下文理解偏差', desc: '核查最近有效业务诉求与否定', count: 12, percent: 34.3 }
        ];
      }
      if (selectedBlockSlice === '合法') {
        return [
          { label: '输出格式异常', desc: '核查模型原始输出与解析结果', count: 0, percent: 0.0 },
          { label: '候选存在但最终意图错误', desc: '对照候选约束、意图定义与选择理由', count: 189, percent: 62.8 },
          { label: '上下文理解偏差', desc: '核查最近有效业务诉求与否定', count: 112, percent: 37.2 }
        ];
      }
      if (selectedBlockSlice === '不合法') {
        return [
          { label: '输出格式异常', desc: '核查模型原始输出与解析结果', count: 84, percent: 100.0 },
          { label: '候选存在但最终意图错误', desc: '对照候选约束、意图定义与选择理由', count: 0, percent: 0.0 },
          { label: '上下文理解偏差', desc: '核查最近有效业务诉求与否定', count: 0, percent: 0.0 }
        ];
      }
      return [];
    }
    if (selectedMetricId === 'direct') {
      if (!selectedBlockSlice) {
        return [
          { 
            label: '直出前已缺失正确候选', 
            desc: '直出请求中的召回缺失', 
            count: 1344, 
            percent: 30.0 
          },
          { 
            label: '错误 Top1 被直接输出', 
            desc: '候选存在，但排序和阈值需核查', 
            count: 2240, 
            percent: 50.0 
          },
          { 
            label: '实际直出偏离正确 Top1', 
            desc: '核查首个可直出候选选择规则', 
            count: 896, 
            percent: 20.0 
          }
        ];
      }
      if (selectedBlockSlice === 'direct_return') {
        return [
          { 
            label: '直出前已缺失正确候选', 
            desc: '直出请求中的召回缺失', 
            count: 1344, 
            percent: 100.0 
          },
          { 
            label: '错误 Top1 被直接输出', 
            desc: '候选存在，但排序和阈值需核查', 
            count: 0, 
            percent: 0.0 
          },
          { 
            label: '实际直出偏离正确 Top1', 
            desc: '核查首个可直出候选选择规则', 
            count: 0, 
            percent: 0.0 
          }
        ];
      }
      if (selectedBlockSlice === 'intent_routing') {
        return [
          { 
            label: '直出前已缺失正确候选', 
            desc: '直出请求中的召回缺失', 
            count: 0, 
            percent: 0.0 
          },
          { 
            label: '错误 Top1 被直接输出', 
            desc: '候选存在，但排序和阈值需核查', 
            count: 2240, 
            percent: 100.0 
          },
          { 
            label: '实际直出偏离正确 Top1', 
            desc: '核查首个可直出候选选择规则', 
            count: 0, 
            percent: 0.0 
          }
        ];
      }
      if (selectedBlockSlice === 'error') {
        return [
          { 
            label: '直出前已缺失正确候选', 
            desc: '直出请求中的召回缺失', 
            count: 0, 
            percent: 0.0 
          },
          { 
            label: '错误 Top1 被直接输出', 
            desc: '候选存在，但排序和阈值需核查', 
            count: 0, 
            percent: 0.0 
          },
          { 
            label: '实际直出偏离正确 Top1', 
            desc: '核查首个可直出候选选择规则', 
            count: 896, 
            percent: 100.0 
          }
        ];
      }
      return [];
    }
    if (selectedMetricId === 'hit') {
      if (!selectedBlockSlice) {
        return [
          { 
            label: '正确意图未进入融合候选 • GOLD_NOT_IN_RRF', 
            desc: '字段: 评估模型预测意图是否进入融合候选前K = 未命中', 
            count: 2590, 
            percent: 45.1 
          },
          { 
            label: 'Reranker Top1 与评估意图不一致 • REGRESSION', 
            desc: '字段: Reranker Top1 与评估模型预测意图是否一致 = 否', 
            count: 3150, 
            percent: 54.9 
          }
        ];
      }
      const totalSliceCount = activeBlockData.find(x => x.label === selectedBlockSlice)?.count || 5740;
      const goldCount = Math.round(totalSliceCount * 0.451);
      const regCount = totalSliceCount - goldCount;
      return [
        { 
          label: '正确意图未进入融合候选 • GOLD_NOT_IN_RRF', 
          desc: '字段: 评估模型预测意图是否进入融合候选前K = 未命中', 
          count: goldCount, 
          percent: 45.1 
        },
        { 
          label: 'Reranker Top1 与评估意图不一致 • REGRESSION', 
          desc: '字段: Reranker Top1 与评估模型预测意图是否一致 = 否', 
          count: regCount, 
          percent: 54.9 
        }
      ];
    }
    if (selectedMetricId === 'recall') {
      if (!selectedBlockSlice) {
        return [
          { label: '两路召回均未命中 • 字段待提供', desc: '对照检索输入与意图库覆盖', count: 1295, percent: 50.0 },
          { label: '融合截断丢失正确候选 • 字段待提供', desc: '对照各路排名与 RRF 前K', count: 777, percent: 30.0 },
          { label: '零候选 • 字段待提供', desc: '检查索引、过滤条件及执行记录', count: 518, percent: 20.0 }
        ];
      }
      if (selectedBlockSlice === 'Sparse') {
        return [
          { label: '两路召回均未命中 • 字段待提供', desc: '对照检索输入与意图库覆盖', count: 1295, percent: 100.0 },
          { label: '融合截断丢失正确候选 • 字段待提供', desc: '对照各路排名与 RRF 前K', count: 0, percent: 0.0 },
          { label: '零候选 • 字段待提供', desc: '检查索引、过滤条件及执行记录', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === 'RRF') {
        return [
          { label: '两路召回均未命中 • 字段待提供', desc: '对照检索输入与意图库覆盖', count: 0, percent: 0.0 },
          { label: '融合截断丢失正确候选 • 字段待提供', desc: '对照各路排名与 RRF 前K', count: 777, percent: 60.0 },
          { label: '零候选 • 字段待提供', desc: '检查索引、过滤条件及执行记录', count: 518, percent: 40.0 }
        ];
      }
      return [];
    }
    if (selectedMetricId === 'query') {
      if (!selectedBlockSlice) {
        return [
          { label: '槽位或否定信息丢失', desc: '核查业务对象、金额和否定词', count: 200, percent: 50.0 },
          { label: '引入无依据的历史信息', desc: '检查历史事实的归属与有效性', count: 120, percent: 30.0 },
          { label: '未完成上下文补全', desc: '检查指代与省略内容', count: 80, percent: 20.0 }
        ];
      }
      if (selectedBlockSlice === 'CTX_CORRECTION') {
        return [
          { label: '槽位或否定信息丢失', desc: '核查业务对象、金额和否定词', count: 200, percent: 100.0 },
          { label: '引入无依据的历史信息', desc: '检查历史事实的归属与有效性', count: 0, percent: 0.0 },
          { label: '未完成上下文补全', desc: '检查指代与省略内容', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === 'CTX_COREFERENCE') {
        return [
          { label: '槽位或否定信息丢失', desc: '核查业务对象、金额和否定词', count: 0, percent: 0.0 },
          { label: '引入无依据的历史信息', desc: '检查历史事实的归属与有效性', count: 120, percent: 100.0 },
          { label: '未完成上下文补全', desc: '检查指代与省略内容', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === 'CTX_COMPLETION') {
        return [
          { label: '槽位或否定信息丢失', desc: '核查业务对象、金额和否定词', count: 0, percent: 0.0 },
          { label: '引入无依据的历史信息', desc: '检查历史事实的归属与有效性', count: 0, percent: 0.0 },
          { label: '未完成上下文补全', desc: '检查指代与省略内容', count: 80, percent: 100.0 }
        ];
      }
      return [];
    }

    if (selectedMetricId === 'operations') {
      if (!selectedBlockSlice) {
        return [
          { label: '应执行操作漏报', desc: '对照参考操作及上下文证据', count: 215, percent: 50.0 },
          { label: '无需执行操作多报', desc: '核查是否过度使用历史信息', count: 129, percent: 30.0 },
          { label: '操作组合不一致', desc: '检查多操作集合的完整性', count: 86, percent: 20.0 }
        ];
      }
      if (selectedBlockSlice === 'CTX_CORRECTION') {
        return [
          { label: '应执行操作漏报', desc: '对照参考操作及上下文证据', count: 215, percent: 100.0 },
          { label: '无需执行操作多报', desc: '核查是否过度使用历史信息', count: 0, percent: 0.0 },
          { label: '操作组合不一致', desc: '检查多操作集合的完整性', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === 'CTX_COREFERENCE') {
        return [
          { label: '应执行操作漏报', desc: '对照参考操作及上下文证据', count: 0, percent: 0.0 },
          { label: '无需执行操作多报', desc: '核查是否过度使用历史信息', count: 129, percent: 100.0 },
          { label: '操作组合不一致', desc: '检查多操作集合的完整性', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === 'CTX_COMPLETION') {
        return [
          { label: '应执行操作漏报', desc: '对照参考操作及上下文证据', count: 0, percent: 0.0 },
          { label: '无需执行操作多报', desc: '核查是否过度使用历史信息', count: 0, percent: 0.0 },
          { label: '操作组合不一致', desc: '检查多操作集合的完整性', count: 86, percent: 100.0 }
        ];
      }
      return [];
    }

    if (selectedMetricId === 'missed') {
      if (!selectedBlockSlice) {
        return [
          { label: '无效片段被放行', desc: '核查片段完整性和置信阈值', count: 2350, percent: 50.0 },
          { label: '槽位回复被放行', desc: '核查当前轮次是否仅补充信息', count: 1410, percent: 30.0 },
          { label: '附和 / 结束语被放行', desc: '核查最近业务诉求和坐席期望', count: 940, percent: 20.0 }
        ];
      }
      if (selectedBlockSlice === 'SLOT_VALUE') {
        return [
          { label: '无效片段被放行', desc: '核查片段完整性和置信阈值', count: 2350, percent: 100.0 },
          { label: '槽位回复被放行', desc: '核查当前轮次是否仅补充信息', count: 0, percent: 0.0 },
          { label: '附和 / 结束语被放行', desc: '核查最近业务诉求和坐席期望', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === 'ENDING') {
        return [
          { label: '无效片段被放行', desc: '核查片段完整性和置信阈值', count: 0, percent: 0.0 },
          { label: '槽位回复被放行', desc: '核查当前轮次是否仅补充信息', count: 1410, percent: 60.0 },
          { label: '附和 / 结束语被放行', desc: '核查最近业务诉求和坐席期望', count: 940, percent: 40.0 }
        ];
      }
      return [];
    }

    if (!selectedBlockSlice) {
      return [
        { label: '上下文业务诉求被拦截', desc: '当前句依赖前序业务上下文', count: 410, percent: 50.0 },
        { label: '会话状态与门控动作冲突', desc: 'SessionState 与实际轮次需核查', count: 246, percent: 30.0 },
        { label: '短句 / 转写片段被拦截', desc: '需核验原始录音和清洗结果', count: 164, percent: 20.0 }
      ];
    }

    if (blockDimension === 'round') {
      if (selectedBlockSlice === 'NEED_PLUS') {
        return [
          { label: '上下文业务诉求被拦截', desc: '当前句依赖前序业务上下文', count: 350, percent: 65.7 },
          { label: '会话状态与门控动作冲突', desc: 'SessionState 与实际轮次需核查', count: 120, percent: 22.5 },
          { label: '短句 / 转写片段被拦截', desc: '需核验原始录音和清洗结果', count: 63, percent: 11.8 }
        ];
      }
      if (selectedBlockSlice === 'SLOT_VALUE') {
        return [
          { label: '上下文业务诉求被拦截', desc: '当前句依赖前序业务上下文', count: 30, percent: 24.4 },
          { label: '会话状态与门控动作冲突', desc: 'SessionState 与实际轮次需核查', count: 60, percent: 48.8 },
          { label: '短句 / 转写片段被拦截', desc: '需核验原始录音和清洗结果', count: 33, percent: 26.8 }
        ];
      }
      if (selectedBlockSlice === 'ENDING') {
        return [
          { label: '上下文业务诉求被拦截', desc: '当前句依赖前序业务上下文', count: 30, percent: 18.3 },
          { label: '会话状态与门控动作冲突', desc: 'SessionState 与实际轮次需核查', count: 66, percent: 40.2 },
          { label: '短句 / 转写片段被拦截', desc: '需核验原始录音和清洗结果', count: 68, percent: 41.5 }
        ];
      }
    } else {
      if (selectedBlockSlice === 'MODEL_NEED_PLUS') {
        return [
          { label: '上下文业务诉求被拦截', desc: '当前句依赖前序业务上下文', count: 410, percent: 100.0 },
          { label: '会话状态与门控动作冲突', desc: 'SessionState 与实际轮次需核查', count: 0, percent: 0.0 },
          { label: '短句 / 转写片段被拦截', desc: '需核验原始录音和清洗结果', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === 'RULE_EXPLICIT_BUSINESS') {
        return [
          { label: '上下文业务诉求被拦截', desc: '当前句依赖前序业务上下文', count: 0, percent: 0.0 },
          { label: '会话状态与门控动作冲突', desc: 'SessionState 与实际轮次需核查', count: 246, percent: 100.0 },
          { label: '短句 / 转写片段被拦截', desc: '需核验原始录音和清洗结果', count: 0, percent: 0.0 }
        ];
      }
      if (selectedBlockSlice === 'MODEL_NO_PLUS_HIGH_CONFIDENCE') {
        return [
          { label: '上下文业务诉求被拦截', desc: '当前句依赖前序业务上下文', count: 0, percent: 0.0 },
          { label: '会话状态与门控动作冲突', desc: 'SessionState 与实际轮次需核查', count: 0, percent: 0.0 },
          { label: '短句 / 转写片段被拦截', desc: '需核验原始录音和清洗结果', count: 164, percent: 100.0 }
        ];
      }
    }

    return [];
  }, [selectedMetricId, blockDimension, selectedBlockSlice]);

  const getMetricTotalErrorCount = (id: string) => {
    switch (id) {
      case 'reject': return '245';
      case 'llm': return '385';
      case 'direct': return '4,480';
      case 'hit': return '5,740';
      case 'recall': return '2,590';
      case 'block': return '820';
      case 'missed': return '4,700';
      case 'operations': return '29';
      case 'query': return '29';
      default: return totalErrors.toLocaleString();
    }
  };

  const getDimensionFieldName = () => {
    if (selectedMetricId === 'reject') return '拒识结果';
    if (selectedMetricId === 'llm') return llmDimension === 'format' ? '格式合法' : '评估模型预测意图名称';
    if (selectedMetricId === 'direct') return '决策类型';
    if (selectedMetricId === 'hit') return hitDimension === 'channel' ? '业务渠道' : '评估模型预测意图名称';
    if (selectedMetricId === 'recall') return '正确意图首次丢失位置';
    if (selectedMetricId === 'missed') return '评估轮次类型';
    if (selectedMetricId === 'operations' || selectedMetricId === 'query') return 'Judge适用operations';
    return blockDimension === 'round' ? '评估轮次类型' : '预测原因码';
  };

  const blockRightHeaderLabel = selectedBlockSlice || '全部错误样本';
  const blockRightHeaderCount = selectedBlockSlice 
    ? (activeBlockData.find(x => x.label === selectedBlockSlice)?.count || Number(getMetricTotalErrorCount(selectedMetricId).replace(/,/g, '')))
    : Number(getMetricTotalErrorCount(selectedMetricId).replace(/,/g, ''));

  // Custom adaptive tooltip matching Overview's look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const val = entry.value;

      let formattedDate = label;
      if (label && label.includes('-')) {
        formattedDate = `2026-${label}`;
      }

      let isPass = true;
      if (typeof selectedMetric.target === 'number') {
        isPass = selectedMetric.dir === 'lt' ? val <= selectedMetric.target : val >= selectedMetric.target;
      }

      const unit = selectedMetric.unit || '%';
      const passStatusText = isPass ? '达标' : '不达标';

      return (
        <div className="bg-white text-gray-900 text-[13.5px] px-2.5 py-1 border border-gray-900 shadow-sm whitespace-nowrap pointer-events-none z-50">
          <span>{formattedDate} · {selectedMetric.name}: {typeof val === 'number' ? val.toFixed(2) : val}{unit} · {passStatusText}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page pb-20">
      {/* breadcrumb row */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-gray-100 mb-6 -mx-5 bg-white -mt-6">
        <span className="text-[12px] text-gray-400">最近浏览:</span>
        <div className="flex gap-2">
          {['视频首页', '知识首页', '知识地图', '问答专区'].map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-500 cursor-pointer hover:bg-gray-100">{tag}</span>
          ))}
          <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-500 cursor-pointer hover:bg-gray-100">监控总览</span>
          <span className="px-2 py-1 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-600 font-medium">异常指标分析</span>
        </div>
      </div>

      {/* Main Title Row matching uploaded mockup */}
      <div className="flex justify-between items-center px-5 mb-4">
        <h1 className="text-[22px] font-bold text-gray-800">异常指标分析</h1>
      </div>

      <div className="px-5">
        {toastInfo.open && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-[13px] text-emerald-800 animate-fadeIn shadow-xs">
            <div className="flex items-center gap-2.5 font-medium">
              <Check className="text-emerald-600 flex-shrink-0" size={18} />
              <span>{toastInfo.msg}</span>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToBadcase && (
                <button
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[12px] font-medium transition-all cursor-pointer shadow-xs"
                  onClick={onNavigateToBadcase}
                >
                  前往 Badcase 分析查看 →
                </button>
              )}
              <button
                className="text-emerald-500 hover:text-emerald-700 cursor-pointer font-bold px-1 text-[15px]"
                onClick={() => setToastInfo({ open: false, msg: '' })}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="filters-container mb-6">
          <div className="filters-row">
            <div className="filter-item">
              <span className="filter-label">评估任务</span>
              <select 
                id="analysisSource" 
                className="filter-input w-[120px]"
              >
                <option value="daily">日常自动评估</option>
                <option value="special">专项 · 补换卡回归</option>
              </select>
            </div>

            {/* Segmented Timeline Control aligned with Overview's h-[36px] */}
            <div className="time-group">
              {['昨日', '近7天', '近30天', '自定义'].map(p => (
                <button 
                  key={p} 
                  className={`time-option ${timeRange === p ? 'active' : ''}`}
                  onClick={() => {
                    setTimeRange(p);
                    if (p === '昨日') {
                      setStartDate('2026-09-08');
                      setEndDate('2026-09-08');
                    } else if (p === '近7天') {
                      setStartDate('2026-09-02');
                      setEndDate('2026-09-08');
                    } else if (p === '近30天') {
                      setStartDate('2026-08-10');
                      setEndDate('2026-09-08');
                    } else {
                      setStartDate('2026-09-08');
                      setEndDate('2026-09-08');
                    }
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Date Inputs container matching Overview's date-input-container exactly with full width for dates */}
            <div className="date-input-container">
              <div className={`date-box ${timeRange !== '自定义' ? 'disabled' : ''}`} style={{ width: '140px' }}>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={timeRange !== '自定义'}
                />
                <Calendar size={14} />
              </div>
              <span className="text-gray-400">至</span>
              <div className={`date-box ${timeRange !== '自定义' ? 'disabled' : ''}`} style={{ width: '140px' }}>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={timeRange !== '自定义'}
                />
                <Calendar size={14} />
              </div>
            </div>

            {/* Channel Select Dropdown */}
            <div className="filter-item">
              <span className="filter-label">渠道</span>
              <select 
                className="filter-input w-[100px]"
                value={localChannel}
                onChange={(e) => setLocalChannel(e.target.value as Channel)}
              >
                <option value="all">全部渠道</option>
                <option value="phone">电话客服</option>
                <option value="online">在线客服</option>
              </select>
            </div>

            {/* Export Button with Blue background and white text per request */}
            <button className="ml-auto h-[36px] px-5 bg-[#2563eb] text-white rounded-lg text-[13px] font-medium shadow-sm hover:bg-blue-700 transition-all cursor-pointer">
              导出分析
            </button>
          </div>
        </div>

        {/* main layout structure */}
        <div className="grid grid-cols-[240px_minmax(0,1fr)] gap-6 mt-6">
          {/* Left Rail Sidebar */}
          <aside className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex flex-col h-fit sticky top-[90px]">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3 px-1">
              <strong className="text-[16px] font-bold text-gray-900">核心分析指标</strong>
              <span className="px-2 py-0.5 bg-[#f0f2f5] text-gray-500 rounded text-[11px] font-bold font-mono">9</span>
            </div>
            <div className="space-y-4 pr-1">
              {stages.map(s => {
                const stageMetrics = metrics.filter(m => m.stage === s.id);
                if (stageMetrics.length === 0) return null;
                return (
                  <div key={s.id} className="space-y-1.5">
                    <div className="text-[12px] text-gray-400 font-normal pl-1 mb-1.5">
                      {s.name}
                    </div>
                    <div className="space-y-1">
                      {stageMetrics.map(m => {
                        const mVal = getMetricValueForDate(m);
                        
                        const isTargetProvided = typeof m.target === 'number';
                        const isMetricBad = isTargetProvided && (m.dir === 'lt' ? mVal > (m.target as number) : mVal < (m.target as number));
                        const isSelected = selectedMetricId === m.id;

                        let statusText = '目标未提供';
                        if (isTargetProvided) {
                          statusText = isMetricBad ? '未达标' : '达标';
                        }

                        return (
                          <button
                            key={m.id}
                            className={`w-full text-left transition-all block ${
                              isSelected 
                                ? 'bg-[#f4f7fe] border border-blue-200 shadow-sm rounded-xl p-3.5' 
                                : 'bg-white border-0 py-2.5 px-1 hover:bg-[#D6E2FF]'
                            }`}
                            onClick={() => onMetricSelect(m.id)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className={`text-[13.5px] font-semibold truncate ${isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                {m.name}
                                {isMetricBad && (
                                  <span className="w-1.5 h-1.5 bg-[#cf1322] rounded-full inline-block ml-1.5 align-middle" />
                                )}
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between w-full mt-2">
                              <span className={`text-[19px] font-extrabold font-mono leading-none ${isMetricBad ? 'text-[#cf1322]' : 'text-gray-900'}`}>
                                {mVal.toFixed(2)}{m.unit || '%'}
                              </span>
                              <span className={`text-[12px] font-normal ${
                                !isTargetProvided 
                                  ? 'text-gray-400' 
                                  : isMetricBad 
                                    ? 'text-[#cf1322]' 
                                    : 'text-gray-400'
                              }`}>
                                {statusText}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3 mt-3 text-center">
              <span className="text-[12px] text-gray-400 font-normal">
                13 项核心分析指标均已设定目标
              </span>
            </div>
          </aside>

          {/* Right Main Panel */}
          <div className="space-y-6">
            {/* Step 1 Header */}
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-1.5 h-[22px] bg-blue-600 rounded-full"></div>
              <h2 className="text-[16px] font-bold text-gray-900 leading-none">指标结果</h2>
              <span className="text-[13px] text-gray-400 ml-2 leading-none font-normal flex items-center gap-1.5">
                <span>{stages.find(s => s.id === selectedMetric.stage)?.name || '全链路'}</span>
                <ChevronRight size={12} className="text-gray-300" />
                <span>{selectedMetric.name}</span>
              </span>
            </div>

            {/* Metric Title Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-[18px] font-bold text-gray-900">{selectedMetric.name}</h2>
                    {isSelectedTargetProvided ? (
                      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${
                        isBad ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'
                      }`}>
                        {isBad ? '未达标' : '已达标'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-gray-50 text-gray-400 border border-gray-200">
                        目标未提供
                      </span>
                    )}
                  </div>
              </div>
                <button 
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:border-blue-200 border border-gray-200 rounded-lg flex items-center gap-1.5 transition-all bg-white cursor-pointer"
                  onClick={() => {
                    setCaliberMetricId(selectedMetricId);
                    setDrawerOpen(true);
                  }}
                >
                  <span>指标口径</span>
                </button>
              </div>

              {/* Removed sample count line as requested */}
            </div>

            {/* Performance Metric Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
              {/* Card 1: Performance */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all">
                <div className="text-[12.5px] text-gray-400 font-normal mb-2">当前{selectedMetric.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-[30px] font-extrabold tracking-tight leading-none font-mono ${isBad ? 'text-red-500' : 'text-gray-900'}`}>
                    {value.toFixed(2)}
                  </span>
                  <span className={`text-[14px] ${isBad ? 'text-red-500' : 'text-gray-900'}`}>%</span>
                </div>
                <div className="text-[11.5px] text-gray-400 font-normal font-mono">
                  {isSelectedTargetProvided ? (
                    `目标 ${selectedMetric.dir === 'gt' ? '≥' : '≤'} ${selectedMetric.target}%`
                  ) : (
                    '目标未提供'
                  )}
                </div>
              </div>

              {/* Card 2: Period-on-Period change */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all">
                <div className="text-[12.5px] text-gray-400 font-normal mb-2">较上一等长期间</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-[30px] font-extrabold tracking-tight leading-none font-mono ${isBetter ? 'text-green-600' : 'text-red-500'}`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(2)}
                  </span>
                  <span className={`text-[14px] font-mono ${isBetter ? 'text-green-600' : 'text-red-500'}`}>
                    {selectedMetric.unit === 'ms' ? 'ms' : '%'}
                  </span>
                </div>
                <div className="text-[11.5px] text-gray-400 font-normal font-mono">
                  上一等长期间 {prevValue.toFixed(2)}{selectedMetric.unit || '%'}
                </div>
              </div>

              {/* Card 3: Anomaly Volume */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 transition-all">
                <div className="text-[12.5px] text-gray-400 font-normal mb-2">未通过</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-[30px] font-extrabold tracking-tight leading-none text-gray-900 font-mono">
                    {totalErrors.toLocaleString()}
                  </span>
                  <span className="text-[14px] text-gray-900 font-mono"> 条</span>
                </div>
                <div className="text-[11.5px] text-gray-400 font-normal">
                  AI全量质检
                </div>
              </div>
            </div>



            {/* Metric Trend Section */}
            <div className="mt-8 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between pb-3">
                <span className="text-[15px] font-bold text-gray-900">指标趋势</span>
                <button 
                  onClick={() => setIsTrendExpanded(!isTrendExpanded)} 
                  className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                >
                  {isTrendExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {isTrendExpanded && (
                <div className="pt-2">
                  <div className="flex justify-end mb-2">
                    <button 
                      onClick={() => setTrendDrawerOpen(true)}
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-[13px] font-medium cursor-pointer"
                    >
                      <Table size={14} />
                      <span>每日指标明细</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-[1fr_260px] gap-8 items-center">
                    <div>
                      {/* Legends */}
                      <div className="flex items-center gap-6 mb-3 text-[12px]">
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <span className="w-4 h-[2px] bg-[#2f78ff] inline-block"></span>
                          <span>{selectedMetric.name}</span>
                        </div>
                        {isSelectedTargetProvided && (
                          <div className="flex items-center gap-1.5 text-[#a87b32]">
                            <span className="w-4 border-t-2 border-dashed border-[#c48a3d] inline-block"></span>
                            <span>目标 {selectedMetric.dir === 'lt' ? '≤' : '≥'} {selectedMetric.target}{selectedMetric.unit || '%'}</span>
                          </div>
                        )}
                      </div>

                      {/* Line Chart */}
                      <div className="h-[210px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={metricTrendData} margin={{ top: 15, right: 20, left: -15, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
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
                              domain={yDomain}
                              ticks={yTicks}
                              tickFormatter={(tick) => `${tick.toFixed(1)}%`}
                            />
                            <Tooltip content={<TrendCustomTooltip />} />
                            {isSelectedTargetProvided && typeof selectedMetric.target === 'number' && (
                              <ReferenceLine 
                                y={selectedMetric.target} 
                                stroke="#c48a3d" 
                                strokeDasharray="4 4" 
                                strokeWidth={1.5} 
                              />
                            )}
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
                    </div>

                    {/* Right: Info Column */}
                    <div className="border-l border-gray-100 pl-6 h-full flex flex-col justify-center">
                      <h4 className="text-[14px] font-bold text-gray-900 leading-snug">
                        {startDate === endDate ? startDate : `${startDate} 至 ${endDate}`} • {localChannel === 'all' ? '全部渠道' : localChannel === 'phone' ? '电话客服' : '在线客服'} • 日常自动评估
                      </h4>
                      <p className="text-[12px] text-gray-500 leading-relaxed mt-2.5">
                        所选期间 {metricTrendData.length} / {metricTrendData.length} 天有数据。每日指标独立计算；期间值按分子、分母累计。上一等长期间暂无完整可比数据。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 Header */}
            <div className="flex items-center gap-2.5 mt-10 mb-2">
              <div className="w-1.5 h-[22px] bg-blue-600 rounded-full"></div>
              <h2 className="text-[16px] font-bold text-gray-900 leading-none">错误样本分布</h2>
            </div>

            {isRewriteMetric || isBlockMetric || isHybridMetric || isIntentRoutingMetric ? (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                {/* Banner */}
                <div className="bg-[#eff6ff] border-l-4 border-blue-500 p-4 rounded-r-lg mb-6 flex justify-between items-center">
                  <div className="text-[14px] text-blue-800">
                    {isRewriteMetric && !rewriteErrorType && rewriteOps.length === 0 && !rewriteCount ||
                     isBlockMetric && blockErrorType.length === 0 && !roundTypeCorrectness ||
                     isHybridMetric && !rrfTopKHit && !rerankerTop1Consistency && !isDirectOutput && !rerankerDirectConsistency ||
                     isIntentRoutingMetric && !evalModelPassed && !intentErrorType ? (
                      <span>未选择任何筛选 · 显示当前指标全部 <b className="font-mono text-[16px]">{filteredSamples.length}</b> 条错误 · 点击下方标签开始筛选</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Filter size={14} />
                        <span>已应用筛选 · 显示当前指标 <b className="font-mono text-[16px]">{filteredSamples.length}</b> 条错误 · 点击标签切换或重置</span>
                        <button 
                          className="ml-4 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                          onClick={() => {
                            if (isRewriteMetric) {
                              setRewriteErrorType(null);
                              setRewriteOps([]);
                              setRewriteCount(null);
                            } else if (isBlockMetric) {
                              setBlockErrorType([]);
                              setRoundTypeCorrectness(null);
                            } else if (isHybridMetric) {
                              setRrfTopKHit(null);
                              setRerankerTop1Consistency(null);
                            } else if (isIntentRoutingMetric) {
                              setEvalModelPassed(null);
                              setIntentErrorType(null);
                            }
                          }}
                        >
                          重置所有筛选
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-8">
                  {isIntentRoutingMetric && (
                    <div className="space-y-8">
                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">评估模型通过</h3>
                          <p className="text-[12px] text-gray-400 mt-1">单选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                          {['通过', '不通过'].map(t => (
                            <button
                              key={t}
                              className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                evalModelPassed === t 
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                              }`}
                              onClick={() => setEvalModelPassed(evalModelPassed === t ? null : t)}
                            >
                              {evalModelPassed === t && (
                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                  <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                </div>
                              )}
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">错误类型</h3>
                          <p className="text-[12px] text-gray-400 mt-1">单选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                          {['不在候选列表中', '模型输出错误'].map(t => (
                            <button
                              key={t}
                              className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                intentErrorType === t 
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                              }`}
                              onClick={() => setIntentErrorType(intentErrorType === t ? null : t)}
                            >
                              {intentErrorType === t && (
                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                  <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                </div>
                              )}
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {isRewriteMetric && (
                    <>
                      {/* Rewrite Filters */}
                      {/* 1. 模型操作 */}
                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">模型操作</h3>
                          <p className="text-[12px] text-gray-400 mt-1">多选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                          {['修正替换', '指代还原', '上下文补全', '增量合并', '无需操作'].map(op => {
                            const isSelected = rewriteOps.includes(op);
                            return (
                              <button
                                key={op}
                                className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                  isSelected ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                                }`}
                                onClick={() => isSelected ? setRewriteOps(rewriteOps.filter(o => o !== op)) : setRewriteOps([...rewriteOps, op])}
                              >
                                {isSelected && <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent"><Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} /></div>}
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <hr className="border-gray-50" />
                      {/* 2. 评测模型操作 */}
                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">评测模型操作</h3>
                          <p className="text-[12px] text-gray-400 mt-1">多选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                          {['修正替换', '指代还原', '上下文补全', '增量合并', '无需操作'].map(op => {
                            const isSelected = evalRewriteOps.includes(op);
                            return (
                              <button
                                key={op}
                                className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                  isSelected ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                                }`}
                                onClick={() => isSelected ? setEvalRewriteOps(evalRewriteOps.filter(o => o !== op)) : setEvalRewriteOps([...evalRewriteOps, op])}
                              >
                                {isSelected && <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent"><Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} /></div>}
                                {op}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <hr className="border-gray-50" />
                      {/* 3. 操作集合一致 */}
                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">操作集合一致</h3>
                          <p className="text-[12px] text-gray-400 mt-1">单选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                          {['通过', '不通过', '待评估'].map(opt => (
                            <button
                              key={opt}
                              className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                opConsistency === opt ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                              }`}
                              onClick={() => setOpConsistency(opConsistency === opt ? null : opt)}
                            >
                              {opConsistency === opt && <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent"><Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} /></div>}
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                      <hr className="border-gray-50" />
                      {/* 4. 端到端代理合格 */}
                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">端到端代理合格</h3>
                          <p className="text-[12px] text-gray-400 mt-1">单选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                          {['通过', '不通过', '待评估'].map(opt => (
                            <button
                              key={opt}
                              className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                e2eAgentValid === opt ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                              }`}
                              onClick={() => setE2eAgentValid(e2eAgentValid === opt ? null : opt)}
                            >
                              {e2eAgentValid === opt && <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent"><Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} /></div>}
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <hr className="border-gray-50" />

                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">操作数量</h3>
                          <p className="text-[12px] text-gray-400 mt-1">单选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                          {rewriteOpCounts.map(t => (
                            <button
                              key={t.label}
                              className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                rewriteCount === t.label 
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                  : t.count === 0 
                                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                              }`}
                              disabled={t.count === 0}
                              onClick={() => setRewriteCount(rewriteCount === t.label ? null : t.label)}
                            >
                              {rewriteCount === t.label && (
                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                  <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                </div>
                              )}
                              {t.label} <span className={`font-mono ${rewriteCount === t.label ? 'text-blue-500' : 'text-gray-400'}`}>{t.count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {isBlockMetric && (
                    <>
                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">混淆矩阵标签</h3>
                          <p className="text-[12px] text-gray-400 mt-1">多选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                              {blockErrorTypes.map(t => {
                                const isSelected = blockErrorType.includes(t.label);
                                return (
                                  <button
                                    key={t.label}
                                    className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                      isSelected
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                                    }`}
                                    onClick={() => {
                                      if (isSelected) setBlockErrorType(blockErrorType.filter(e => e !== t.label));
                                      else setBlockErrorType([...blockErrorType, t.label]);
                                    }}
                                  >
                                    {isSelected && (
                                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                        <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                      </div>
                                    )}
                                    {t.label}
                                  </button>
                                );
                              })}
                        </div>
                      </div>

                      <hr className="border-gray-50" />

                      <div className="flex gap-10">
                        <div className="w-[120px] pt-1">
                          <h3 className="text-[15px] font-bold text-gray-900">轮次类型是否正确</h3>
                          <p className="text-[12px] text-gray-400 mt-1">单选</p>
                        </div>
                        <div className="flex flex-wrap gap-3 flex-1">
                          {['正确', '错误'].map(t => (
                            <button
                              key={t}
                              className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                roundTypeCorrectness === t 
                                  ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                              }`}
                              onClick={() => setRoundTypeCorrectness(roundTypeCorrectness === t ? null : t)}
                            >
                              {roundTypeCorrectness === t && (
                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                  <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                </div>
                              )}
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {isHybridMetric && (
                    <>
                      {/* Hybrid Metric Logic */}
                      {selectedMetricId === 'recall' && (
                        <div className="flex gap-10">
                          <div className="w-[120px] pt-1">
                            <h3 className="text-[15px] font-bold text-gray-900">评估模型预测意图是否进入融合候选前K</h3>
                            <p className="text-[12px] text-gray-400 mt-1">单选</p>
                          </div>
                          <div className="flex flex-wrap gap-3 flex-1">
                            {['是', '否'].map(t => (
                              <button
                                key={t}
                                className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                  rrfTopKHit === t 
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                                }`}
                                onClick={() => setRrfTopKHit(rrfTopKHit === t ? null : t)}
                              >
                                {rrfTopKHit === t && (
                                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                    <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                  </div>
                                )}
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {['hit', 'direct'].includes(selectedMetricId) && (
                        <>
                          <div className="flex gap-10">
                            <div className="w-[120px] pt-1">
                              <h3 className="text-[15px] font-bold text-gray-900">rerankerTop1与评估模型预测意图是否一致</h3>
                              <p className="text-[12px] text-gray-400 mt-1">单选</p>
                            </div>
                            <div className="flex flex-wrap gap-3 flex-1">
                              {['是', '否'].map(t => (
                                <button
                                  key={t}
                                  className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                    rerankerTop1Consistency === t 
                                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                                  }`}
                                  onClick={() => setRerankerTop1Consistency(rerankerTop1Consistency === t ? null : t)}
                                >
                                  {rerankerTop1Consistency === t && (
                                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                      <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                    </div>
                                  )}
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <hr className="border-gray-50" />

                          <div className="flex gap-10">
                            <div className="w-[120px] pt-1">
                              <h3 className="text-[15px] font-bold text-gray-900">是否直出</h3>
                              <p className="text-[12px] text-gray-400 mt-1">单选</p>
                            </div>
                            <div className="flex flex-wrap gap-3 flex-1">
                              {['是', '否'].map(t => (
                                <button
                                  key={t}
                                  className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                    isDirectOutput === t 
                                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                                  }`}
                                  onClick={() => setIsDirectOutput(isDirectOutput === t ? null : t)}
                                >
                                  {isDirectOutput === t && (
                                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                      <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                    </div>
                                  )}
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <hr className="border-gray-50" />

                          <div className="flex gap-10">
                            <div className="w-[120px] pt-1">
                              <h3 className="text-[15px] font-bold text-gray-900">reranker实际直出意图与评估模型预测意图是否一致</h3>
                              <p className="text-[12px] text-gray-400 mt-1">单选</p>
                            </div>
                            <div className="flex flex-wrap gap-3 flex-1">
                              {['是', '否'].map(t => (
                                <button
                                  key={t}
                                  className={`px-4 h-[46.7396px] rounded-lg border text-[14px] transition-all flex items-center gap-2 cursor-pointer relative overflow-hidden ${
                                    rerankerDirectConsistency === t 
                                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold shadow-sm' 
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/30'
                                  }`}
                                  onClick={() => setRerankerDirectConsistency(rerankerDirectConsistency === t ? null : t)}
                                >
                                  {rerankerDirectConsistency === t && (
                                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[16px] border-t-blue-500 border-l-[16px] border-l-transparent">
                                      <Check size={8} className="text-white absolute -top-[16px] -right-[1px]" strokeWidth={4} />
                                    </div>
                                  )}
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : isCustomMetric ? (
              /* Custom distribution section for False Block Rate (Block), Missed Block Rate (Missed), Operations (Consistency), Query (Proxy Accuracy), RRF Hit@K (Recall), Reranker Top1 (Hit), Direct Return (Direct), and LLM Intent (LLM) */
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="grid grid-cols-[3fr_2fr] gap-6">
                  {/* Left Table */}
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-3 h-[32px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-bold text-gray-900">
                          {getDimensionFieldName()}
                        </span>
                      </div>
                      
                      {/* Filtering UI */}
                      <div className="flex items-center gap-2">
                        {selectedBlockSlice && (
                          <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5">
                             <Filter size={12}/>
                             已筛选: {selectedBlockSlice}
                             <button className="text-blue-400 hover:text-blue-600 font-bold" onClick={() => setSelectedBlockSlice(null)}>×</button>
                          </div>
                        )}
                        <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                          {selectedBlockSlice ? '点击下方标签切换筛选' : '点击下方标签开始筛选'}
                        </div>
                      </div>

                      {selectedMetricId === 'llm' && (
                        <select 
                          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 outline-none cursor-pointer hover:border-gray-300 h-full"
                          value={llmDimension}
                          onChange={(e) => {
                            setLlmDimension(e.target.value as 'intent' | 'format');
                            setSelectedBlockSlice(null);
                          }}
                        >
                          <option value="intent">评估模型预测意图名称</option>
                          <option value="format">格式合法</option>
                        </select>
                      )}
                      {selectedMetricId === 'hit' && (
                        <select 
                          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 outline-none cursor-pointer hover:border-gray-300 h-full"
                          value={hitDimension}
                          onChange={(e) => {
                            setHitDimension(e.target.value as 'intent' | 'channel');
                            setSelectedBlockSlice(null);
                          }}
                        >
                          <option value="intent">评估模型预测意图名称</option>
                          <option value="channel">业务渠道</option>
                        </select>
                      )}
                      {selectedMetricId === 'block' && (
                        <select 
                          className="text-xs border border-gray-200 rounded-lg p-1.5 bg-white text-gray-600 outline-none cursor-pointer hover:border-gray-300 h-full"
                          value={blockDimension}
                          onChange={(e) => setBlockDimension(e.target.value as 'round' | 'reason')}
                        >
                          <option value="round">评估轮次类型</option>
                          <option value="reason">预测原因码</option>
                        </select>
                      )}
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white flex-1">
                      <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                          <tr className="bg-[#D6E2FF] border-b border-gray-100 h-[44px]">
                            <th className="py-0 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF] w-[40px]"></th>
                            <th className="py-0 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF]">
                              {getDimensionFieldName()}
                            </th>
                            <th className="py-0 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF] w-[80px]">错误数</th>
                            <th className="py-0 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF] w-[140px]">占全部 {getMetricTotalErrorCount(selectedMetricId)} 条</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeBlockData.map((r) => {
                            const isSelected = selectedBlockSlice === r.label;
                            return (
                              <tr 
                                key={r.label} 
                                className={`border-b border-gray-50 last:border-b-0 hover:bg-[#f6f9fe]/50 transition-all h-[84px] ${
                                  isSelected ? 'bg-[#e6f4ff] font-bold shadow-[inset_3px_0_0_0_#2563eb]' : ''
                                }`}
                              >
                                <td className="py-0 px-4 w-[40px]">
                                  <button 
                                    className={`p-1.5 rounded hover:bg-blue-100 ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}
                                    onClick={() => setSelectedBlockSlice(isSelected ? null : r.label)}
                                  >
                                    <Filter size={14}/>
                                  </button>
                                </td>
                                <td className="py-0 px-4">
                                  <button 
                                    className="text-[13px] text-blue-600 hover:text-blue-700 font-medium hover:underline text-left block truncate w-full cursor-pointer" 
                                    onClick={() => setSelectedBlockSlice(isSelected ? null : r.label)}
                                  >
                                    {r.label}
                                  </button>
                                </td>
                                <td className="py-0 px-4 text-[13px] font-mono font-bold text-gray-800">
                                  {r.count.toLocaleString()}
                                </td>
                                <td className="py-0 px-4">
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="text-[12px] font-mono font-medium text-gray-700">
                                      {r.percent.toFixed(1)}%
                                    </span>
                                    <div className="w-[100px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-[#5b8ff9] h-full rounded-full" 
                                        style={{ width: `${r.percent}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="text-[11.5px] text-gray-400 mt-4 pl-1">
                      数据字段: {getDimensionFieldName()}；占比仅表示当前指标错误构成。
                    </div>
                  </div>

                  {/* Right Bucket list */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-3 h-[32px]">
                      <span className="text-[15px] font-bold text-gray-900">范围内的错误类型</span>
                    </div>

                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white flex-1">
                      {/* Header band */}
                      <div className="bg-[#D6E2FF] border-b border-gray-100 px-4 h-[44px] flex justify-between items-center text-[13px] font-medium text-gray-600">
                        <span>{blockRightHeaderLabel}</span>
                        <span className="font-bold text-gray-800 font-mono">{Number(blockRightHeaderCount).toLocaleString()} 条</span>
                      </div>

                      {/* Items without funnel icon */}
                      <div className="divide-y divide-gray-100">
                        {activeRightBlockList.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="h-[84px] px-4 flex items-center justify-between hover:bg-gray-50/30 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div className="min-w-0">
                                <strong className="text-[13.5px] font-bold text-gray-900 block truncate">
                                  {item.label}
                                </strong>
                                <small className="text-[12px] text-gray-400 block mt-1">
                                  {item.desc}
                                </small>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <b className="text-[20px] font-bold text-gray-800 block font-mono leading-none">
                                {item.count.toLocaleString()}
                              </b>
                              <small className="text-[12px] text-gray-400 block mt-1.5 font-mono">
                                {item.percent.toFixed(1)}%
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-[11.5px] text-gray-400 mt-4 pl-1">
                      错误类型来自指标明细字段，样本链路中保留原始字段。
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Existing distribution section for other metrics */
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="grid grid-cols-[3fr_2fr] gap-6">
                  {/* Left table of categories */}
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-3 h-[32px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[14px] font-bold text-gray-900">意图分类</span>
                      </div>
                      <select 
                        className="text-xs border border-gray-200 rounded-lg p-1.5 bg-white text-gray-600 outline-none h-full" 
                        value={dimension} 
                        onChange={(e) => setDimension(e.target.value)}
                      >
                        <option value="intent">评估模型预测意图名称</option>
                        <option value="channel">业务渠道</option>
                      </select>
                    </div>
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white flex-1">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#D6E2FF]">
                            <th className="py-3 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF] w-[40px]"></th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF]">意图名称</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF]">错误样本数</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF]">错误占比</th>
                            <th className="py-3 px-4 text-xs font-semibold text-gray-700 bg-[#D6E2FF] w-[40px]"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {breakdownData.map((r, i) => (
                            <tr key={i} className={`border-b border-gray-50 last:border-b-0 hover:bg-gray-50/30 transition-all ${selectedSlice === r.label ? 'bg-[#e6f4ff] font-bold shadow-[inset_3px_0_0_0_#2563eb]' : ''}`}>
                               <td className="py-[32px] px-4 w-[40px]">
                                  <button 
                                    className={`p-1.5 rounded hover:bg-blue-100 ${selectedSlice === r.label ? 'text-blue-600' : 'text-gray-300'}`}
                                    onClick={() => setSelectedSlice(selectedSlice === r.label ? null : r.label)}
                                  >
                                    <Filter size={14}/>
                                  </button>
                               </td>
                               <td className="py-[32px] px-4">
                                <button 
                                  className="text-[12.5px] text-blue-600 hover:text-blue-700 font-medium hover:underline text-left block" 
                                  onClick={() => setSelectedSlice(selectedSlice === r.label ? null : r.label)}
                                >
                                  {r.label}
                                </button>
                              </td>
                              <td className="py-[32px] px-4 text-[13px] font-mono font-bold text-gray-800">{r.count}</td>
                              <td className="py-[32px] px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-mono text-gray-500">{(r.count / totalErrors * 100).toFixed(1)}%</span>
                                  <div className="w-[80px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${r.count / totalErrors * 100}%` }}></div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-[17px] px-4 text-right">
                                {/* Filter icon removed */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right side error type buckets */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-3 h-[32px]">
                      <span className="text-[14px] font-bold text-gray-900">错误类型</span>
                    </div>
                    <div className="bg-[#D6E2FF] py-3 px-3 text-[13px] text-blue-800 border border-blue-100/50 rounded-lg flex justify-between mb-3 font-semibold">
                       <span>{selectedSlice || '全部错误样本'}</span>
                       <b>{selectedSlice ? breakdownData.find(d => d.label === selectedSlice)?.count : totalErrors} 条</b>
                    </div>
                    <div className="space-y-2 flex-1 border border-gray-100 rounded-xl p-4 bg-white shadow-sm overflow-y-auto">
                       {errorBuckets.map(g => (
                         <button 
                            key={g.id} 
                            className={`w-full py-[11px] px-3 rounded-lg border text-left flex items-center justify-between transition-all ${
                              selectedGroup === g.id 
                                ? 'bg-[#e6f4ff] border-blue-400 font-bold shadow-sm' 
                                : 'bg-white border-gray-100 hover:bg-[#D6E2FF]'
                            }`}
                            onClick={() => setSelectedGroup(selectedGroup === g.id ? null : g.id)}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-5 h-5 rounded flex items-center justify-center text-[10.5px] font-bold ${
                                selectedGroup === g.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {selectedGroup === g.id ? <Check size={11} strokeWidth={3}/> : g.id}
                              </span>
                              <div className="min-w-0">
                                <strong className="text-[12.5px] font-bold text-gray-800 block truncate">{g.label}</strong>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-2">
                              <b className="text-[13px] font-mono text-gray-800 block">{g.count}</b> 
                              <small className="text-[10px] text-gray-400 block mt-0.5">{(g.count / totalErrors * 100).toFixed(1)}%</small>
                            </div>
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scope trail and samples Header with Export Button matching image */}
            <div className="flex items-center justify-between mt-10 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-[22px] bg-blue-600 rounded-full"></div>
                <h2 className="text-[16px] font-bold text-gray-900 leading-none">会话样本</h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  className={`h-[36px] px-4 rounded-lg text-[13px] font-medium transition-all ${
                    selectedSampleIds.size > 0 
                      ? 'bg-[#2563eb] text-white shadow-sm cursor-pointer' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={selectedSampleIds.size === 0}
                  onClick={() => {
                    setIssueTitle('');
                    setBadcaseType('batch');
                    setBadcaseDrawerOpen(true);
                  }}
                >
                  批量加入badcase
                </button>
              </div>
            </div>

            {/* Scope trail and samples */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex gap-4 mb-4">
                <div className="flex-1 max-w-sm flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                  <Search size={14} className="text-gray-400" />
                  <input 
                    type="search" 
                    placeholder="搜索表达、意图或样本ID"
                    className="w-full border-0 focus:ring-0 text-xs p-0 outline-none text-gray-700 bg-transparent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select 
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 outline-none cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="全部">全部复核状态</option>
                  <option value="未提交">未提交</option>
                  <option value="待复核">待复核</option>
                  <option value="已确认问题">已确认问题</option>
                </select>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#D6E2FF]">
                      <th className="py-3 px-4 text-xs font-semibold text-gray-700 border-r border-white w-[40px]">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300" 
                          checked={pagedSamples.length > 0 && pagedSamples.every(s => selectedSampleIds.has(s.id))}
                          onChange={(e) => {
                            const newSet = new Set(selectedSampleIds);
                            if (e.target.checked) {
                              pagedSamples.forEach(s => newSet.add(s.id));
                            } else {
                              pagedSamples.forEach(s => newSet.delete(s.id));
                            }
                            setSelectedSampleIds(newSet);
                          }}
                        />
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-700 border-r border-white w-[30%]">客户表达 / 样本</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-700 border-r border-white">参考结果 / 实际结果</th>
                      <th className="py-3 px-4 text-xs font-semibold text-black border-r border-white w-[140px]">错误类型</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-700 border-r border-white w-[110px]">复核状态</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-700 last:border-r-0 w-[100px]">链路证据</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {isCustomMetric ? (
                      pagedSamples.map((s, idx) => (
                        <tr key={s.id} className={`hover:bg-blue-50/20 transition-colors ${idx % 2 === 1 ? 'bg-[#f9fbff]' : 'bg-white'} ${selectedSampleIds.has(s.id) ? 'bg-blue-50/40' : ''}`}>
                          <td className="py-4 px-4 align-top">
                            <input 
                              type="checkbox" 
                              className="rounded border-gray-300 mt-1" 
                              checked={selectedSampleIds.has(s.id)}
                              onChange={() => {
                                const newSet = new Set(selectedSampleIds);
                                if (newSet.has(s.id)) {
                                  newSet.delete(s.id);
                                } else {
                                  newSet.add(s.id);
                                }
                                setSelectedSampleIds(newSet);
                              }}
                            />
                          </td>
                          <td className="py-4 px-4 text-[12.5px] text-gray-800 font-medium leading-relaxed">
                            {s.expression}
                            <span className="block text-[11px] text-gray-400 font-normal mt-1 font-mono">{s.meta}</span>
                          </td>
                          <td className="py-4 px-4 text-[12.5px] text-gray-700">
                            {selectedMetricId === 'missed' ? (
                              <>
                                <span className="text-red-500 font-semibold">{s.ref}</span>
                                <span className="block text-[12.5px] text-gray-500 mt-1">{s.actual}</span>
                              </>
                            ) : (selectedMetricId === 'operations' ? (
                              <div className="flex flex-col gap-1">
                                <span className="text-blue-700 font-bold">{s.ref}</span>
                                <span className="text-gray-400 font-normal">{s.actual}</span>
                              </div>
                            ) : (selectedMetricId === 'recall' ? (
                              <div>
                                <span className="text-gray-800 font-medium text-[12.5px]">{s.ref}</span>
                                <span className="block text-[12px] text-gray-400 mt-1">{s.actual}</span>
                              </div>
                            ) : (
                              <>
                                <span className="text-gray-800 font-medium">{s.ref}</span>
                                <span className="block text-[12px] text-gray-400 mt-1">{s.actual}</span>
                              </>
                            )))}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-[12.5px] text-black font-medium">{s.type}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 border rounded text-[11px] font-medium ${
                              s.status === '未提交' 
                                ? 'bg-gray-100 text-gray-600 border-gray-200' 
                                : (s.status === '待复核'
                                    ? 'bg-amber-50 text-amber-600 border-amber-100 font-medium'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 font-medium')
                            }`}>
                              {s.status === '已确认错误' ? '已确认问题' : s.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button 
                              className="text-[13px] font-medium text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer flex items-center justify-center gap-0.5 mx-auto group"
                              onClick={() => {
                                setSelectedSample(s);
                                setTraceDrawerOpen(true);
                              }}
                            >
                              <span>查看链路</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="bg-white hover:bg-[#D6E2FF] transition-colors">
                        <td className="py-3 px-4"><input type="checkbox" className="rounded border-gray-300" /></td>
                        <td className="py-3 px-4 text-[12.5px] text-gray-800 font-medium leading-relaxed">
                          我的信用卡找不到了，不用挂失，直接补办新卡。
                          <span className="block text-[11px] text-gray-400 font-normal mt-1 font-mono">D08-HIT-P-0001 · 电话客服</span>
                        </td>
                        <td className="py-3 px-4 text-[12.5px] text-gray-700">
                          <span>信用卡补卡</span>
                          <span className="block text-[12.5px] text-red-500 font-semibold mt-1">信用卡换卡</span>
                        </td>
                        <td className="py-3 px-4 text-[12.5px] text-black font-medium">类型误判</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[11px] font-medium font-semibold">待复核</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button className="text-[13px] font-medium text-blue-600 hover:text-blue-700 bg-transparent border-0 cursor-pointer">
                            详情
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* New Pagination Footer exactly like the image and functional */}
                <div className="bg-[#f2f4f8] py-2.5 px-4 flex justify-between items-center text-[12.5px] text-gray-500 border-t border-gray-200">
                  <div className="flex items-center gap-5">
                    <span>共 {totalCount} 条</span>
                    <div className="relative">
                      <button 
                        className={`flex items-center justify-between gap-2 border rounded px-2.5 py-1 bg-white text-gray-600 outline-none w-[110px] h-[32px] transition-all ${pageSizeOpen ? 'border-blue-500 ring-2 ring-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                        onClick={() => setPageSizeOpen(!pageSizeOpen)}
                      >
                        <span className="text-[13px]">{pageSize}条/页</span>
                        {pageSizeOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
                      </button>
                      
                      {pageSizeOpen && (
                        <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded-lg shadow-xl z-[100] py-1 animate-fadeIn">
                          {[10, 20, 50, 100].map(val => (
                            <button 
                              key={val}
                              className={`w-full text-left px-4 py-2 text-[13px] hover:bg-blue-50 transition-colors ${pageSize === val ? 'text-blue-600 font-bold bg-blue-50/30' : 'text-gray-600 font-normal'}`}
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
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      className={`p-1 transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 cursor-pointer'}`}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      // Basic page display for brevity, can be expanded if needed
                      const page = i + 1;
                      return (
                        <button 
                          key={page}
                          className={`w-6 h-6 flex items-center justify-center rounded font-medium transition-all ${currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-gray-200 text-gray-600'}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && <span className="px-1 text-gray-400">...</span>}
                    {totalPages > 5 && (
                      <button 
                        className={`w-6 h-6 flex items-center justify-center rounded font-medium transition-all ${currentPage === totalPages ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 text-gray-600'}`}
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    )}

                    <button 
                      className={`p-1 transition-colors ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 cursor-pointer'}`}
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      <ChevronRight size={14} />
                    </button>
                    
                    <span className="ml-4">前往</span>
                    <input 
                      type="text" 
                      className="w-9 h-6 border border-gray-300 rounded text-center mx-1 outline-none text-gray-700 focus:border-blue-500" 
                      value={jumpPage}
                      onChange={(e) => setJumpPage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = parseInt(jumpPage);
                          if (!isNaN(val) && val >= 1 && val <= totalPages) {
                            setCurrentPage(val);
                          } else {
                            setJumpPage(String(currentPage));
                          }
                        }
                      }}
                      onBlur={() => {
                        const val = parseInt(jumpPage);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                          setCurrentPage(val);
                        } else {
                          setJumpPage(String(currentPage));
                        }
                      }}
                    />
                    <span>页</span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>

      <Drawer
        isOpen={traceDrawerOpen}
        onClose={() => setTraceDrawerOpen(false)}
        title={<span className="text-[20px] font-bold text-gray-900">04 • 样本链路分析</span>}
        eyebrow={selectedSample?.meta.startsWith('2026-') ? selectedSample.meta : `2026-${selectedSample?.meta}`}
        size="lg"
      >
        {selectedSample && (
          <div className="bg-white">
            <div className="mb-6 pt-2">
              <div className="flex gap-2">
                <span className={`px-2 py-0.5 text-[11px] font-medium rounded border ${
                  selectedSample.status === '未提交'
                    ? 'bg-gray-100 text-gray-600 border-gray-200'
                    : (selectedSample.status === '待复核'
                        ? 'bg-amber-50 text-[#d48806] border-amber-100 font-bold'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold')
                }`}>
                  {selectedSample.status === '已确认错误' ? '已确认问题' : selectedSample.status}
                </span>
              </div>
            </div>

            {/* Session ID Grid */}
            <div className="grid grid-cols-2 gap-y-4 py-5 border-y border-gray-100 my-6">
              <div>
                <div className="text-[12px] text-gray-400">会话 ID</div>
                <div className="text-[14px] font-bold text-gray-800 break-all leading-snug">
                  {selectedSample.id || 'D08-BLOCK-P-0009'}
                </div>
              </div>
            </div>

            {/* Session Context - High Fidelity */}
            <section className="mb-10">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">会话上下文</h3>
              <div className="space-y-4">
                <div className="bg-[#D6E2FF] p-5 rounded border-l-4 border-gray-200">
                  <div className="text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">前序对话</div>
                  <div className="text-[14px] text-gray-700 leading-relaxed">
                    {selectedMetricId === 'reject'
                      ? '客服：请问您需要什么服务？'
                      : ((selectedMetricId === 'operations' || selectedMetricId === 'query' || selectedMetricId === 'block')
                          ? '客户：信用卡坏了，需要补办新卡。 客服：您确认要补办信用卡吗？'
                          : '客户：刚才咨询补办信用卡。客服：请稍等，我在为您查询。')}
                  </div>
                </div>
                <div className="bg-[#eff6ff] p-5 rounded border-l-4 border-[#bfdbfe]">
                  <div className="text-[11px] text-blue-500 mb-1.5 font-medium uppercase tracking-wider">当前客户输入</div>
                  <div className="text-[15px] font-bold text-gray-900">
                    {selectedSample.expression}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button 
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-[13px] font-bold transition-colors cursor-pointer"
                  onClick={() => {}}
                >
                  <MessageSquare size={14} />
                  <span>查看对话记录</span>
                </button>
              </div>
            </section>

            {/* Step Logs - 4 Steps per user request */}
            <section className="mb-10">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">本条样本 • 逐环节记录</h3>
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                {/* 1. 前置过滤 */}
                <div className="py-6 flex justify-between items-start">
                  <div className="w-[100px] flex-shrink-0 text-[13px] text-gray-400">前置过滤</div>
                  <div className="flex-1 px-4 space-y-1">
                    <div className="text-gray-400 text-[12px]">处理结果</div>
                    <div className="text-[14px] font-bold text-gray-800">
                      {selectedSample.actual === '拦截' ? '拦截' : '放行'}
                    </div>
                  </div>
                </div>

                {selectedSample.actual !== '拦截' && (
                  <>
                    {/* 2. Query改写 */}
                    <div className="py-6 flex justify-between items-start">
                      <div className="w-[100px] flex-shrink-0 text-[13px] text-gray-400">Query 改写</div>
                      <div className="flex-1 px-4 space-y-3">
                        <div>
                          <div className="text-gray-400 text-[12px]">原内容</div>
                          <div className="text-[14px] font-bold text-gray-800">
                            {selectedSample.expression === '对，帮我办理刚才说的业务。' ? '你的信用卡丢失了，我的信用卡也丢了。' : selectedSample.expression}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-[12px]">改写结果</div>
                          <div className="text-[14px] font-bold text-gray-800">
                            {selectedSample.expression === '对，帮我办理刚才说的业务。' ? '我的信用卡丢失了，我想办理挂失业务。' : selectedSample.actual}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. 混合检索 */}
                    <div className="py-6 flex justify-between items-start">
                      <div className="w-[100px] flex-shrink-0 text-[13px] text-gray-400">混合检索</div>
                      <div className="flex-1 px-4 space-y-1">
                        <div className="text-gray-400 text-[12px]">匹配到的意图</div>
                        <div className="text-[14px] font-bold text-gray-800">
                          {selectedSample.ref || '信用卡挂失'} 账户查询
                        </div>
                      </div>
                    </div>

                    {/* 4. 意图路由 */}
                    <div className="py-6 flex justify-between items-start">
                      <div className="w-[100px] flex-shrink-0 text-[13px] text-gray-400">意图路由</div>
                      <div className="flex-1 px-4 space-y-1">
                        <div className="text-gray-400 text-[12px]">识别出的意图</div>
                        <div className="text-[14px] font-bold text-gray-800">
                          {selectedSample.actual}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>

            <div className="border-t border-gray-100 my-6"></div>
            {selectedSample.status === '未提交' && (
              <div className="pb-10 flex justify-start">
                <button 
                  className="px-6 h-[40px] bg-[#1890ff] text-white rounded text-[14px] font-medium hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                  onClick={() => {
                    setIssueTitle('');
                    setTraceDrawerOpen(false);
                    setBadcaseDrawerOpen(true);
                  }}
                >
                  将本条加入 Badcase
                </button>
              </div>
            )}
          </div>
        )}
      </Drawer>


      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400 font-mono mb-0.5">{caliberMetric.code || ''}</span>
            <span className="text-[18px] font-bold">{caliberMetric.name} • 指标口径</span>
          </div>
        }
      >
        <div className="space-y-6 text-gray-800 text-[13.5px] leading-relaxed">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 border-b border-gray-100 pb-6">
            <div>
              <span className="text-[12.5px] text-gray-400 block mb-1">任务范围</span>
              <strong className="text-[14px] text-gray-800 font-semibold block leading-snug">
                {startDate === endDate ? startDate : `${startDate} 至 ${endDate}`} · {localChannel === 'all' ? '全部渠道' : localChannel === 'phone' ? '电话客服' : '在线客服'} · 日常自动评估
              </strong>
            </div>
            <div>
              <span className="text-[12.5px] text-gray-400 block mb-1">验收目标</span>
              <strong className="text-[14px] text-gray-800 font-semibold block leading-snug">
                {caliberMetric.id === 'missed' ? '目标待确认' : `${caliberMetric.dir === 'gt' ? '≥' : '≤'} ${caliberMetric.target}%`}
              </strong>
            </div>
            <div>
              <span className="text-[12.5px] text-gray-400 block mb-1">参考答案</span>
              <strong className="text-[14px] text-gray-800 font-semibold block leading-snug">
                评估模型裁决
              </strong>
            </div>
            <div>
              <span className="text-[12.5px] text-gray-400 block mb-1">指标来源</span>
              <strong className="text-[14px] text-gray-800 font-semibold block leading-snug">
                意图识别指标清单 Excel
              </strong>
            </div>
          </div>

          {/* Section 1: 计算定义 */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">计算定义</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {caliberMetric.id === 'reject'
                ? '当前指标清单未提供独立的拒识命中率编码和目标，页面仅保留链路观察。'
                : (caliberMetric.id === 'llm' 
                    ? '当前指标清单未提供独立的 LLM 识别准确率编码和目标，页面仅保留链路观察。'
                    : (caliberMetric.id === 'missed' 
                        ? '应拦截却进入 Plus 的比例，Excel 标为辅助观察，不配置达标目标。' 
                        : (caliberMetric.definition || '格式合法、文本质量通过且模型与 Judge 操作集合一致的样本比例。')))}
            </p>
            {/* Highlighted blue block with matching left border */}
            <div className="bg-[#f0f5ff] border-l-4 border-blue-500 p-4 rounded-r text-[13px] text-gray-600 leading-relaxed">
              期间值与上一等长期间均按分子与分母合计后计算；任一期间缺失日期时不计算比较差。 单位 % 表示百分点差。
            </div>
          </div>

          {/* Section 2: 异常与缺失处理 */}
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-3">异常与缺失处理</h3>
            <p className="text-gray-600 leading-relaxed">
              绝对目标按模板判断。未设目标显示待确认。执行失败、Judge失败和标签缺失分别记录，缺失时显示未提供，不补零。错误占比只描述未通过样本的构成。
            </p>
          </div>
        </div>
      </Drawer>

      <Drawer
        isOpen={badcaseDrawerOpen}
        onClose={() => setBadcaseDrawerOpen(false)}
        title="加入 Badcase 问题清单"
      >
        <div className="flex flex-col h-full -mt-2">
          <div className="space-y-6 flex-1">
            {/* Form Section */}
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="text-[13px] text-gray-700">处理方式</label>
                <select 
                  className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] outline-none focus:border-blue-500 transition-all bg-white"
                  value={processingMethod}
                  onChange={(e) => setProcessingMethod(e.target.value)}
                >
                  <option value="new">新建问题单</option>
                  <option value="existing">关联已有问题单</option>
                </select>
              </div>

              {processingMethod === 'new' ? (
                <div className="space-y-2">
                  <label className="text-[13px] text-gray-700">问题标题</label>
                  <input 
                    type="text"
                    className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] outline-none focus:border-blue-500 transition-all"
                    placeholder="请输入问题标题"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[13px] text-gray-700">选择问题单</label>
                  <select 
                    className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] outline-none focus:border-blue-500 transition-all bg-white"
                    value={selectedExistingIssueId}
                    onChange={(e) => setSelectedExistingIssueId(e.target.value)}
                  >
                    {existingIssues.map((iss) => (
                      <option key={iss.id} value={iss.id}>
                        {iss.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}


            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button 
              className="px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-md transition-all cursor-pointer"
              onClick={() => setBadcaseDrawerOpen(false)}
            >
              取消
            </button>
            <button 
              className="px-4 py-2 text-[13px] text-white bg-[#2563eb] hover:bg-blue-700 rounded-md transition-all font-medium cursor-pointer shadow-xs"
              onClick={() => {
                const addedSampleCount = selectedSampleIds.size > 0 ? selectedSampleIds.size : 1;

                if (processingMethod === 'new') {
                  const created = addIssue({
                    title: issueTitle.trim() || `${selectedMetric.name}异常`,
                    batch: '日常自动评估',
                    metricName: selectedMetric.name,
                    metricCode: selectedMetric.code || 'LLM-REJECT-ACC',
                    value: `${value.toFixed(2)}${selectedMetric.unit || '%'}`,
                    target: isSelectedTargetProvided 
                      ? `目标 ${selectedMetric.dir === 'lt' ? '≤' : '≥'} ${selectedMetric.target}${selectedMetric.unit || '%'}` 
                      : '目标未确认',
                    sampleTotal: addedSampleCount,
                    samplePending: addedSampleCount,
                    sampleExportable: 0,
                    owner: assignee,
                  });
                  setToastInfo({
                    open: true,
                    msg: `已成功新建 Badcase 问题单 [${created.id} - ${created.title}]，并同步 ${addedSampleCount} 条样本到 Badcase 分析！`
                  });
                } else {
                  const targetIssueId = selectedExistingIssueId || (existingIssues[0]?.id || 'BC-mutdc6sk');
                  const targetIssue = existingIssues.find(i => i.id === targetIssueId);
                  updateIssueSamples(targetIssueId, addedSampleCount);
                  setToastInfo({
                    open: true,
                    msg: `已成功将 ${addedSampleCount} 条样本追加关联至 Badcase 问题单 [${targetIssueId}${targetIssue ? ` - ${targetIssue.title}` : ''}]！`
                  });
                }
                setBadcaseDrawerOpen(false);
              }}
            >
              保存问题单
            </button>
          </div>
        </div>
      </Drawer>

      {/* Daily Metric Details Drawer (Image 2) */}
      <Drawer
        isOpen={trendDrawerOpen}
        onClose={() => setTrendDrawerOpen(false)}
        eyebrow={`${startDate === endDate ? startDate : `${startDate} 至 ${endDate}`} · ${localChannel === 'all' ? '全部渠道' : localChannel === 'phone' ? '电话客服' : '在线客服'} · 日常自动评估`}
        title={<span className="text-[20px] font-bold text-gray-900">{selectedMetric.name} • 趋势数据</span>}
        size="md"
      >
        <div className="bg-white">
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#D6E2FF] border-b border-gray-100 text-gray-500 font-medium">
                <tr>
                  <th className="py-3 px-4">日期 / 版本</th>
                  <th className="py-3 px-4">分子</th>
                  <th className="py-3 px-4">分母</th>
                  <th className="py-3 px-4">指标值</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-800">
                {metricTrendData.map((row) => (
                  <tr key={row.date} className="hover:bg-blue-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-600">{row.date}</td>
                    <td className="py-3 px-4 font-mono">{row.numerator.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono">{row.denominator.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-medium">{row.value.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
