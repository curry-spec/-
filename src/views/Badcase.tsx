/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ArrowLeft, Download, Plus, ExternalLink, MessageSquare, AlertTriangle, CheckCircle2, X, Sparkles } from 'lucide-react';
import { Channel } from '../types';
import { useBadcaseIssues } from '../badcaseStore';
import Drawer from '../components/Drawer';

interface BadcaseProps {
  channel: Channel;
  date: string;
}

export default function Badcase({ channel: globalChannel }: BadcaseProps) {
  const { issues: systemIssues, addIssue, updateIssueSamples } = useBadcaseIssues();
  const [source, setSource] = useState<'system' | 'agent'>('system');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  // Tab 1 (问题清单) filter states
  const [searchTitle, setSearchTitle] = useState('');
  const [sourceMetric, setSourceMetric] = useState('全部来源指标');
  const [evalBatch, setEvalBatch] = useState('日常自动评估');
  const [reviewProgress, setReviewProgress] = useState('全部复核进度');

  // Tab 2 (坐席反馈复核) filter states
  const [agentContentSearch, setAgentContentSearch] = useState('');
  const [agentIntentSearch, setAgentIntentSearch] = useState('');
  const [agentStatusSearch, setAgentStatusSearch] = useState('全部状态');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [jumpPage, setJumpPage] = useState('1');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Detail View (样本复核) local filter states
  const [detailReviewStatus, setDetailReviewStatus] = useState('全部复核状态');
  const [detailSessionSearch, setDetailSessionSearch] = useState('');
  const [detailSessionIdSearch, setDetailSessionIdSearch] = useState('');

  // Review Drawer states
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [agentFeedbackDrawerOpen, setAgentFeedbackDrawerOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'review' | 'evidence'>('review');
  const [selectedSampleForReview, setSelectedSampleForReview] = useState<any>(null);
  const [selectedAgentFeedback, setSelectedAgentFeedback] = useState<any>(null);
  
  // Agent Feedback Form states
  const [agentProcessAction, setAgentProcessAction] = useState('请选择');
  const [agentFinalReason, setAgentFinalReason] = useState('');
  const [agentFinalLink, setAgentFinalLink] = useState('请选择');
  const [agentExclusionReason, setAgentExclusionReason] = useState('');
  const [agentSubmitError, setAgentSubmitError] = useState('');
  const [isJoinIssueDrawerOpen, setIsJoinIssueDrawerOpen] = useState(false);
  const [joinIssueMethod, setJoinIssueMethod] = useState('新建问题单');
  const [joinIssueTitle, setJoinIssueTitle] = useState('未关联指标异常');
  const [selectedExistingIssueId, setSelectedExistingIssueId] = useState('');
  const [joinIssueOwner, setJoinIssueOwner] = useState('AI运营人员');
  const [joinIssuePriority, setJoinIssuePriority] = useState('P2 · 常规');

  const [isJudgeAccepted, setIsJudgeAccepted] = useState<string>(''); 
  const [judgeRejectionReason, setJudgeRejectionReason] = useState('');
  const [isIncluded, setIsIncluded] = useState<string>(''); 
  const [finalLink, setFinalLink] = useState('TurnGate评估');
  const [finalReason, setFinalReason] = useState('');
  const [confirmationBasis, setConfirmationBasis] = useState('');
  const [adjustmentSuggestion, setAdjustmentSuggestion] = useState('');
  const [exclusionReason, setExclusionReason] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleResetSystemFilters = () => {
    setSearchTitle('');
    setSourceMetric('全部来源指标');
    setEvalBatch('日常自动评估');
    setReviewProgress('全部复核进度');
    setCurrentPage(1);
  };

  const handleResetAgentFilters = () => {
    setAgentContentSearch('');
    setAgentIntentSearch('');
    setAgentStatusSearch('全部状态');
    setCurrentPage(1);
  };

  const handleSaveAgentFeedback = () => {
    if (!selectedAgentFeedback) return;
    
    // Basic Validation
    if (agentProcessAction === '请选择') {
      setAgentSubmitError('请选择处理操作！');
      return;
    }
    if (!agentFinalReason.trim()) {
      setAgentSubmitError('请填写人工最终原因 / 分析依据！');
      return;
    }
    if (agentProcessAction === '纳入问题清单' && agentFinalLink === '请选择') {
      setAgentSubmitError('请选择最终所属环节！');
      return;
    }
    if (agentProcessAction === '不纳入' && !agentExclusionReason.trim()) {
      setAgentSubmitError('请填写不纳入理由！');
      return;
    }

    // Success - update local state
    setAgentSubmitError('');
    
    if (agentProcessAction === '纳入问题清单') {
      setAgentFeedbackDrawerOpen(false);
      setIsJoinIssueDrawerOpen(true);
      return;
    }

    const updated = agentFeedbacks.map(f => {
      if (f.id === selectedAgentFeedback.id) {
        return { 
          ...f, 
          progress: '未纳入' as const,
          action: '不纳入',
          exclusionReason: agentExclusionReason
        };
      }
      return f;
    });
    setAgentFeedbacks(updated);
    setAgentFeedbackDrawerOpen(false);
  };

  const handleOpenAssociatedIssue = (issueId?: string) => {
    const targetIssueId = issueId || selectedAgentFeedback?.associatedIssueId;
    const target = systemIssues.find(i => i.id === targetIssueId) || systemIssues[0];
    if (target) {
      setAgentFeedbackDrawerOpen(false);
      setIsJoinIssueDrawerOpen(false);
      setSource('system');
      setSelectedIssueId(target.id);
      setCurrentPage(1);
    }
  };

  const handleResetDetailFilters = () => {
    setDetailReviewStatus('全部复核状态');
    setDetailSessionSearch('');
    setDetailSessionIdSearch('');
  };

  interface SampleHistory {
    time: string;
    action: string;
    isJudgeAccepted: string;
    isIncluded: string;
    finalLink: string;
    linkReason?: string;
  }

  interface DetailSample {
    content: string;
    code: string;
    judgeResult: string;
    judgeReason: string;
    status: string;
    link: string;
    linkReason: string;
    history?: SampleHistory[];
    isJudgeAccepted?: string;
    judgeRejectionReason?: string;
    isIncluded?: string;
    finalLink?: string;
    finalReason?: string;
    confirmationBasis?: string;
    adjustmentSuggestion?: string;
    exclusionReason?: string;
  }

  const [detailSamples, setDetailSamples] = useState<DetailSample[]>([
    { 
      content: '对，帮我办理刚才说的业务。', 
      code: 'D08-BLOCK-P-0001', 
      judgeResult: 'system_error', 
      judgeReason: '上下文业务诉求被拦截', 
      status: '已纳入', 
      link: 'TurnGate评估', 
      linkReason: '2423', 
      isJudgeAccepted: 'yes',
      isIncluded: 'yes',
      finalLink: 'TurnGate评估',
      finalReason: '2423',
      confirmationBasis: '在TurnGate策略日志分析中确认，由于前置过滤决策码匹配错误导致上下文拦截。',
      adjustmentSuggestion: '调整匹配词库范围。',
      history: [
        {
          time: '2026-10-06T01:48:23.700Z',
          action: '提交复核',
          isJudgeAccepted: 'yes',
          isIncluded: 'yes',
          finalLink: 'TurnGate评估',
          linkReason: '2423'
        }
      ] 
    },
    { content: '对，帮我办理刚才说的业务。', code: 'D08-BLOCK-P-0002', judgeResult: 'system_error', judgeReason: '上下文业务诉求被拦截', status: '待复核', link: '未确认', linkReason: '未确认', history: [] },
    { 
      content: '对，帮我办理刚才说的业务。', 
      code: 'D08-BLOCK-P-0003', 
      judgeResult: 'system_error', 
      judgeReason: '上下文业务诉求被拦截', 
      status: '不纳入', 
      link: '-', 
      linkReason: '未满足调优条件', 
      isJudgeAccepted: 'no',
      judgeRejectionReason: '拦截决策符合系统对原型演示业务的隔离规则，非真正异常。',
      isIncluded: 'no',
      exclusionReason: '未满足调优条件',
      history: [
        {
          time: '2026-10-05T09:12:45.300Z',
          action: '提交复核',
          isJudgeAccepted: 'no',
          isIncluded: 'no',
          finalLink: '-',
          linkReason: '未满足调优条件'
        }
      ] 
    },
    { 
      content: '对，帮我办理刚才说的业务。', 
      code: 'D08-BLOCK-P-0004', 
      judgeResult: 'system_error', 
      judgeReason: '上下文业务诉求被拦截', 
      status: '草稿', 
      link: '未确认', 
      linkReason: '未确认', 
      isJudgeAccepted: 'yes',
      isIncluded: 'yes',
      finalLink: '意图识别环节',
      finalReason: '意图模型将补卡识别为换卡。',
      confirmationBasis: '转写文本表明客户明确要补卡。',
      history: [] 
    },
    { content: '对，帮我办理刚才说的业务。', code: 'D08-BLOCK-P-0005', judgeResult: 'system_error', judgeReason: '上下文业务诉求被拦截', status: '待复核', link: '未确认', linkReason: '未确认', history: [] },
  ]);

  const openDrawer = (sample: DetailSample, mode: 'review' | 'evidence') => {
    setSelectedSampleForReview(sample);
    setDrawerMode(mode);
    setSubmitError('');

    // Request 1 & 3 logic:
    // If viewing evidence: show data if status is 已纳入, 不纳入, or 草稿
    // If reviewing: only show data if status is 草稿
    let shouldPrepopulate = false;
    if (mode === 'evidence') {
      if (['已纳入', '不纳入', '草稿'].includes(sample.status)) {
        shouldPrepopulate = true;
      }
    } else if (mode === 'review') {
      if (sample.status === '草稿') {
        shouldPrepopulate = true;
      }
    }

    if (shouldPrepopulate) {
      setIsJudgeAccepted(sample.isJudgeAccepted || '');
      setJudgeRejectionReason(sample.judgeRejectionReason || '');
      setIsIncluded(sample.isIncluded || '');
      setFinalLink(sample.finalLink || 'TurnGate评估');
      setFinalReason(sample.finalReason || '');
      setConfirmationBasis(sample.confirmationBasis || '');
      setAdjustmentSuggestion(sample.adjustmentSuggestion || '');
      setExclusionReason(sample.exclusionReason || '');
    } else {
      // Clear/Reset all fields for a fresh review (e.g. status is 已纳入, 不纳入, or 待复核)
      setIsJudgeAccepted('');
      setJudgeRejectionReason('');
      setIsIncluded('');
      setFinalLink('TurnGate评估');
      setFinalReason('');
      setConfirmationBasis('');
      setAdjustmentSuggestion('');
      setExclusionReason('');
    }
    
    setReviewDrawerOpen(true);
  };

  const handleSaveDraft = () => {
    if (!selectedSampleForReview) return;
    const updated = detailSamples.map(s => {
      if (s.code === selectedSampleForReview.code) {
        return { 
          ...s, 
          status: '草稿', 
          link: '未确认', 
          linkReason: '未确认',
          isJudgeAccepted,
          judgeRejectionReason,
          isIncluded,
          finalLink,
          finalReason,
          confirmationBasis,
          adjustmentSuggestion,
          exclusionReason
        };
      }
      return s;
    });
    setDetailSamples(updated);
    setReviewDrawerOpen(false);
  };

  const handleSubmitReview = () => {
    if (!selectedSampleForReview) return;
    
    // Form Validation
    if (!isJudgeAccepted) {
      setSubmitError('请选择是否认可本次 Judge 对该样本的判定及原因！');
      return;
    }
    if (isJudgeAccepted === 'no' && !judgeRejectionReason.trim()) {
      setSubmitError('请填写否定 Judge 判定的详细依据！');
      return;
    }
    if (!isIncluded) {
      setSubmitError('请选择是否纳入调优数据集！');
      return;
    }
    if (isIncluded === 'yes') {
      if (!finalReason.trim()) {
        setSubmitError('请填写最终原因！');
        return;
      }
      if (!confirmationBasis.trim()) {
        setSubmitError('请填写确认依据！');
        return;
      }
    }
    if (isIncluded === 'no' && !exclusionReason.trim()) {
      setSubmitError('请填写不纳入理由！');
      return;
    }

    setSubmitError('');
    const now = new Date().toISOString();
    const updated = detailSamples.map(s => {
      if (s.code === selectedSampleForReview.code) {
        const historyEntry = {
          time: now,
          action: '提交复核',
          isJudgeAccepted,
          isIncluded,
          finalLink: isIncluded === 'yes' ? finalLink : '-',
          linkReason: isIncluded === 'yes' ? (finalReason || '已核实归因') : (exclusionReason || '未满足调优条件')
        };
        
        const newHistory = s.history ? [...s.history, historyEntry] : [historyEntry];

        if (isIncluded === 'yes') {
          return { 
            ...s, 
            status: '已纳入', 
            link: finalLink, 
            linkReason: finalReason || '已核实归因',
            history: newHistory,
            isJudgeAccepted,
            judgeRejectionReason,
            isIncluded,
            finalLink,
            finalReason,
            confirmationBasis,
            adjustmentSuggestion,
            exclusionReason
          };
        } else {
          return { 
            ...s, 
            status: '不纳入', 
            link: '-', 
            linkReason: exclusionReason || '未满足调优条件',
            history: newHistory,
            isJudgeAccepted,
            judgeRejectionReason,
            isIncluded,
            finalLink,
            finalReason,
            confirmationBasis,
            adjustmentSuggestion,
            exclusionReason
          };
        }
      }
      return s;
    });
    setDetailSamples(updated);
    setReviewDrawerOpen(false);
  };

  const filteredDetailSamples = useMemo(() => {
    return detailSamples.filter(s => {
      if (detailReviewStatus !== '全部复核状态' && s.status !== detailReviewStatus) return false;
      if (detailSessionSearch && !s.content.includes(detailSessionSearch)) return false;
      if (detailSessionIdSearch && !s.code.toLowerCase().includes(detailSessionIdSearch.toLowerCase())) return false;
      return true;
    });
  }, [detailSamples, detailReviewStatus, detailSessionSearch, detailSessionIdSearch]);

  const paginatedDetailSamples = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDetailSamples.slice(start, start + pageSize);
  }, [filteredDetailSamples, currentPage, pageSize]);

  const detailTotalPages = Math.ceil(filteredDetailSamples.length / pageSize) || 1;

  // Filter systemIssues loaded from store
  const filteredIssues = useMemo(() => {
    return systemIssues.filter(item => {
      if (searchTitle) {
        const q = searchTitle.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchId = item.id.toLowerCase().includes(q);
        const matchCode = item.metricCode.toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchCode) return false;
      }
      if (sourceMetric !== '全部来源指标' && item.metricName !== sourceMetric) return false;
      if (evalBatch !== '日常自动评估' && item.batch !== evalBatch) return false;
      if (reviewProgress === '待复核' && item.progress !== '待复核') return false;
      if (reviewProgress === '已复核归因' && item.progress !== '已复核归因') return false;
      return true;
    });
  }, [systemIssues, searchTitle, sourceMetric, evalBatch, reviewProgress]);

  const paginatedIssues = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIssues.slice(start, start + pageSize);
  }, [filteredIssues, currentPage, pageSize]);

  const systemTotalPages = Math.ceil(filteredIssues.length / pageSize) || 1;

  // Sample data for 坐席反馈复核
  interface AgentFeedbackItem {
    id: string;
    code: string;
    content: string;
    intent: string;
    reason: string;
    progress: '待处理' | '已纳入' | '未纳入';
    agent: string;
    action?: string;
    finalReason?: string;
    finalLink?: string;
    exclusionReason?: string;
    associatedIssueId?: string;
    associatedIssueTitle?: string;
  }

  const [agentFeedbacks, setAgentFeedbacks] = useState<AgentFeedbackItem[]>([
    { 
      id: '1', 
      code: 'DEMO-FEEDBACK-INTENT-001', 
      content: '我的卡找不到了，先帮我挂失。', 
      intent: '信用卡补卡', 
      reason: '客户当前表达的是挂失诉求，推送成了补卡办理。', 
      progress: '待处理',
      agent: '示例数据未提供'
    },
    { 
      id: '2', 
      code: 'DEMO-FEEDBACK-INTENT-002', 
      content: '我想先还利息，本金晚一点再还，可以怎么申请？', 
      intent: '贷款提前结清', 
      reason: '客户咨询还款协商，推送成了提前结清。', 
      progress: '已纳入',
      agent: '示例数据未提供',
      action: '纳入问题清单',
      finalReason: '客户表达的是还款协商与还款日延后诉求，意图模型门控识别为贷款提前结清，属于业务门控与意图混淆。',
      finalLink: 'TurnGate评估',
      associatedIssueId: 'BC-mutdc6sk',
      associatedIssueTitle: '误拦截率异常'
    },
    { 
      id: '3', 
      code: 'DEMO-FEEDBACK-INTENT-003', 
      content: '我上个月的账单是不是算错了？为什么多了50元年费？', 
      intent: '账单明细查询', 
      reason: '客户咨询年费疑问，意图识别为普通账单查询，未触发费用减免或年费规则解释。', 
      progress: '待处理',
      agent: '示例数据未提供'
    },
    { 
      id: '4', 
      code: 'DEMO-FEEDBACK-INTENT-004', 
      content: '请问理财赎回到账一般需要几天？', 
      intent: '活期理财赎回', 
      reason: '坐席认为解答不够详尽，但模型分类和推送流程均正确无误。', 
      progress: '未纳入',
      agent: '示例数据未提供',
      action: '不纳入',
      exclusionReason: '模型意图识别正确，属于话术优化建议，非意图与识别缺陷，因此不纳入Badcase清单。'
    },
  ]);

  const filteredAgentFeedbacks = useMemo(() => {
    return agentFeedbacks.filter(item => {
      if (agentContentSearch && !item.content.toLowerCase().includes(agentContentSearch.toLowerCase())) return false;
      if (agentIntentSearch && !item.intent.toLowerCase().includes(agentIntentSearch.toLowerCase())) return false;
      if (agentStatusSearch !== '全部状态' && item.progress !== agentStatusSearch) return false;
      return true;
    });
  }, [agentFeedbacks, agentContentSearch, agentIntentSearch, agentStatusSearch]);

  const paginatedAgentFeedbacks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAgentFeedbacks.slice(start, start + pageSize);
  }, [filteredAgentFeedbacks, currentPage, pageSize]);

  const agentTotalPages = Math.ceil(filteredAgentFeedbacks.length / pageSize) || 1;

  const selectedIssue = useMemo(() => 
    systemIssues.find(i => i.id === selectedIssueId),
    [systemIssues, selectedIssueId]
  );

  // Checkbox Selection
  const toggleSelectAll = (ids: string[]) => {
    if (selectedIds.size === ids.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ids));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const renderDetailView = () => {
    if (!selectedIssue) return null;
    return (
      <div className="animate-in fade-in duration-300">
        {/* Breadcrumb / Back Navigation Row */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => {
              setSelectedIssueId(null);
              setCurrentPage(1);
            }}
            className="flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span className="text-[14px] ml-1">返回</span>
          </button>
          <div className="w-px h-3 bg-gray-300 mx-2"></div>
          <h2 className="text-[16px] font-bold text-gray-900">
            {selectedIssue.title}
          </h2>
        </div>

        {/* Source Snapshot Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            <h2 className="text-[16px] font-bold text-gray-800">来源快照</h2>
          </div>
          
          <div className="space-y-1 mb-5 pl-3 border-l-2 border-gray-100">
            <p className="text-[14px] text-gray-800 font-bold">
              {selectedIssue.batch}
            </p>
            <p className="text-[13px] text-gray-400 flex items-center gap-3">
              <span>2026-09-08</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <span>全部渠道</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
              <span className="text-blue-500 font-medium">{selectedIssue.metricName}</span>
              <span className="font-mono text-[12px] text-gray-300">({selectedIssue.metricCode})</span>
            </p>
          </div>

          <div className="bg-[#D6E2FF] rounded-xl p-5 flex items-center justify-around text-[14px] border border-blue-100/50">
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 text-[12px]">关联指标</span>
              <span className="font-bold text-gray-800 text-[15px]">{selectedIssue.metricName}</span>
            </div>
            <div className="w-px h-8 bg-blue-100"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 text-[12px]">指标值</span>
              <span className="font-bold text-blue-600 text-[20px]">{selectedIssue.value}</span>
            </div>
            <div className="w-px h-8 bg-blue-100"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-gray-400 text-[12px]">目标</span>
              <span className="text-gray-700 font-semibold">{selectedIssue.target}</span>
            </div>
          </div>
        </div>

        {/* Sample Review Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <h2 className="text-[15px] font-bold text-gray-800">样本复核</h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="h-[30px] px-4 bg-[#2563eb] hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-all cursor-pointer shadow-2xs">
                导出有效Badcase
              </button>
            </div>
          </div>

          {/* Inner Filter Bar (White Card Container Style) */}
          <div className="p-4 bg-gray-50/30 flex items-center gap-6 border-b border-gray-100 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">复核状态</span>
              <select 
                className="h-[32px] px-3 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer w-[130px]"
                value={detailReviewStatus}
                onChange={(e) => setDetailReviewStatus(e.target.value)}
              >
                <option>全部复核状态</option>
                <option>待复核</option>
                <option>已纳入</option>
                <option>不纳入</option>
                <option>草稿</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">会话</span>
              <input 
                type="text" 
                placeholder="搜索会话内容" 
                className="w-[200px] h-[32px] px-3 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 bg-white"
                value={detailSessionSearch}
                onChange={(e) => setDetailSessionSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">会话ID</span>
              <input 
                type="text" 
                placeholder="搜索会话ID" 
                className="w-[180px] h-[32px] px-3 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400 bg-white font-mono"
                value={detailSessionIdSearch}
                onChange={(e) => setDetailSessionIdSearch(e.target.value)}
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button 
                className="h-[30px] px-4 bg-[#2563eb] hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-all cursor-pointer shadow-2xs"
                onClick={() => {}}
              >
                查询
              </button>
              <button 
                className="h-[30px] px-4 bg-white hover:bg-gray-50 text-blue-600 border border-blue-500 text-[12px] font-medium rounded transition-all cursor-pointer"
                onClick={handleResetDetailFilters}
              >
                重置
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#D6E2FF] text-gray-500 text-[12.5px] border-b border-gray-100">
                  <th className="py-4 px-6 font-semibold w-[25%]">会话</th>
                  <th className="py-4 px-6 font-semibold w-[15%] text-center">会话ID</th>
                  <th className="py-4 px-6 font-semibold w-[20%]">Judge 原判定原因</th>
                  <th className="py-4 px-6 font-semibold w-[15%]">人工最终结论</th>
                  <th className="py-4 px-6 font-semibold w-[15%]">最终环节 / 原因</th>
                  <th className="py-4 px-6 text-center font-semibold">操作</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-gray-100">
                    { paginatedDetailSamples.length > 0 ? (
                    paginatedDetailSamples.map((s, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/10 transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-relaxed">{s.content}</p>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="font-mono bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-gray-500 text-[12px]">{s.code}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <p className="font-mono text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded-md w-fit text-[11px] uppercase">{s.judgeResult}</p>
                            <p className="text-[12.5px] text-gray-600 mt-1">{s.judgeReason}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded text-[12px] w-fit font-medium ${
                            s.status === '已纳入' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            s.status === '待复核' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                            s.status === '不纳入' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <p className="text-gray-800 font-medium">{s.link}</p>
                            <p className="text-[12px] text-gray-400 font-mono">{s.linkReason}</p>
                          </div>
                        </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <button 
                            className="text-blue-600 hover:text-blue-700 font-medium transition-all cursor-pointer"
                            onClick={() => openDrawer(s, 'evidence')}
                          >
                            查看证据
                          </button>
                          <button 
                            className="text-blue-600 hover:text-blue-700 font-medium transition-all cursor-pointer"
                            onClick={() => openDrawer(s, 'review')}
                          >
                            复核
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        暂无符合条件的复核数据
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer for Detail View */}
          <div className="bg-[#f4f5f7] py-2 px-4 flex justify-end items-center text-[13px] text-gray-600 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="mr-1">共 {filteredDetailSamples.length} 条</span>
              
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
              {Array.from({ length: detailTotalPages }, (_, i) => i + 1).map(page => (
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
                className={`w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${currentPage >= detailTotalPages ? 'bg-[#e8e8e8] text-gray-300 cursor-not-allowed' : 'bg-[#e8e8e8] hover:bg-gray-300 text-gray-600 cursor-pointer'}`}
                disabled={currentPage >= detailTotalPages}
                onClick={() => setCurrentPage(p => Math.min(detailTotalPages, p + 1))}
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
                    if (!isNaN(p) && p >= 1 && p <= detailTotalPages) {
                      setCurrentPage(p);
                    }
                  }
                }}
              />
              <span>页</span>
            </div>
          </div>
        </div>

        {/* Review Drawer */}
        {/* Review Drawer */}
        <Drawer
          isOpen={reviewDrawerOpen}
          onClose={() => setReviewDrawerOpen(false)}
          size="lg"
          hideCloseButton={drawerMode === 'evidence'}
          eyebrow={`日常自动评估 · ${selectedSampleForReview?.code || 'D08-BLOCK-P-0009'}`}
          title={<span className="text-[20px] font-bold text-gray-900">单条样本 · 证据与人工复核</span>}
        >
          <div className="bg-white">
            {/* Sample Info Grid - Matching Analysis.tsx grid style */}
            <div className="grid grid-cols-2 gap-y-5 py-6 border-y border-gray-100 my-4">
              <div className="space-y-1">
                <div className="text-[12px] text-gray-400">评估记录</div>
                <div className="text-[14px] font-bold text-gray-800 break-all leading-snug">
                  日常自动评估 | {selectedSampleForReview?.code || 'D08-BLOCK-P-0009'}
                </div>
              </div>
            </div>
            {/* Section: Original Conversation - Matching Analysis.tsx context style */}
            <section className="mb-10">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">原始会话与系统证据</h3>
              <div className="space-y-4">
                <div className="bg-[#D6E2FF] p-5 rounded border-l-4 border-gray-200">
                  <div className="text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wider">前序对话</div>
                  <div className="text-[14px] text-gray-700 leading-relaxed">
                    客户：信用卡坏了，需要补办新卡。客服：您确认为要补办信用卡吗？
                  </div>
                </div>
                <div className="bg-[#eff6ff] p-5 rounded border-l-4 border-[#bfdbfe]">
                  <div className="text-[11px] text-blue-500 mb-1.5 font-medium uppercase tracking-wider">当前客户输入</div>
                  <div className="text-[15px] font-bold text-gray-900">
                    {selectedSampleForReview?.content || '对，帮我办理刚才说的业务。'}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-10">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[12px]">系统输出</span>
                  <span className="text-gray-900 font-bold text-[14px]">拦截</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-[12px] bg-gray-100 px-1.5 rounded">参考结果</span>
                  <span className="text-gray-900 font-bold text-[14px]">放行</span>
                </div>
                <button 
                  className="ml-auto flex items-center gap-2 text-blue-600 hover:text-blue-700 text-[13px] font-bold transition-colors cursor-pointer"
                  onClick={() => setChatModalOpen(true)}
                >
                  <MessageSquare size={14} />
                  <span>查看对话记录</span>
                </button>
              </div>
            </section>

            {/* Section: Judge Info - Clean style matching screenshot */}
            <section className="mb-10">
              <h3 className="text-[15px] font-bold text-gray-900 mb-6">Judge 原判定与依据</h3>
              <div className="grid grid-cols-2 gap-x-12 gap-y-6 pb-10 border-b border-gray-100">
                <div className="space-y-2">
                  <div className="text-[12px] text-gray-400">原判定</div>
                  <div className="text-[14px] text-gray-800 font-medium">{selectedSampleForReview?.judgeResult || 'system_error'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[12px] text-gray-400">原错误类型</div>
                  <div className="text-[14px] text-gray-800 font-medium">{selectedSampleForReview?.judgeReason || '上下文业务诉求被拦截'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[12px] text-gray-400">来源字段</div>
                  <div className="text-[14px] text-gray-800 font-medium">混淆矩阵标签 / 错误归因</div>
                  <div className="text-[13px] text-gray-500">当前句依赖前序业务上下文</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[12px] text-gray-400">来源工作表</div>
                  <div className="text-[14px] text-gray-800 font-medium">TurnGate评估明细</div>
                </div>
              </div>
            </section>

            {/* Section: Execution Log - Matching Analysis.tsx logs style */}
            <section className="mb-10">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4">逐环节执行记录</h3>
              <div className="divide-y divide-gray-100 border-t border-gray-100">
                <div className="py-5 flex justify-between items-center">
                  <div className="w-[120px] flex-shrink-0 text-[13px] text-gray-400">输入与清洗</div>
                  <div className="flex-1 px-4">
                    <div className="text-[14px] font-bold text-gray-800">{selectedSampleForReview?.content || '对，帮我办理刚才说的业务。'}</div>
                    <div className="text-[12px] text-gray-400 mt-1">录音未关联，当前仅有转写及清洗文本</div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded">已记录</span>
                </div>
                <div className="py-5 flex justify-between items-center">
                  <div className="w-[120px] flex-shrink-0 text-[13px] text-gray-400">前置过滤</div>
                  <div className="flex-1 px-4">
                    <div className="text-[14px] font-bold text-gray-800">实际拦截</div>
                    <div className="text-[12px] text-gray-400 mt-1 leading-relaxed">当前句依赖前序业务上下文；需复核 SessionState、最近业务诉求与阈值。</div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-rose-50 text-rose-500 text-[11px] font-medium rounded border border-rose-100">异常</span>
                </div>
                <div className="py-5 flex justify-between items-center">
                  <div className="w-[120px] flex-shrink-0 text-[13px] text-gray-400">下游链路</div>
                  <div className="flex-1 px-4">
                    <div className="text-[14px] font-bold text-gray-800">未执行</div>
                    <div className="text-[12px] text-gray-400 mt-1">门控拦截后没有改写、检索或LLM记录</div>
                  </div>
                  <span className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded">已记录</span>
                </div>
              </div>
            </section>

            {/* Section: Manual Review Form - Match Analysis.tsx style */}
            <section className="mb-10">
              <h3 className="text-[15px] font-bold text-gray-900 mb-6">人工复核</h3>
              
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="text-[14px] text-gray-700 font-medium">是否认可本次 Judge 对该样本的判定及原因？</div>
                  <div className="flex items-center gap-10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="judge_accept" 
                        value="yes"
                        checked={isJudgeAccepted === 'yes'}
                        onChange={(e) => setIsJudgeAccepted(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed" 
                      />
                      <span className="text-[14px] text-gray-600 group-hover:text-gray-900 transition-colors">是，认可判定</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="judge_accept" 
                        value="no"
                        checked={isJudgeAccepted === 'no'}
                        onChange={(e) => setIsJudgeAccepted(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed" 
                      />
                      <span className="text-[14px] text-gray-600 group-hover:text-gray-900 transition-colors">否，不认可判定</span>
                    </label>
                  </div>
                </div>

                  {isJudgeAccepted === 'no' && (
                    <div className="space-y-3">
                      <div className="text-[14px] text-gray-700 font-bold">否定依据（必填）</div>
                      <textarea 
                        placeholder="请输入否定 Judge 判定的详细依据..."
                        className="w-full h-32 p-4 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-500 transition-all placeholder-gray-300 bg-gray-50/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                        value={judgeRejectionReason}
                        onChange={(e) => setJudgeRejectionReason(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                      ></textarea>
                    </div>
                  )}

                <div className="space-y-4">
                  <div className="text-[14px] text-gray-700 font-medium">是否纳入调优数据集？</div>
                  <div className="flex items-center gap-10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="is_included" 
                        value="yes"
                        checked={isIncluded === 'yes'}
                        onChange={(e) => setIsIncluded(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed" 
                      />
                      <span className="text-[14px] text-gray-600 group-hover:text-gray-900 transition-colors">是，纳入调优集</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="is_included" 
                        value="no"
                        checked={isIncluded === 'no'}
                        onChange={(e) => setIsIncluded(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed" 
                      />
                      <span className="text-[14px] text-gray-600 group-hover:text-gray-900 transition-colors">否，不满足调优</span>
                    </label>
                  </div>
                </div>

                {isIncluded === 'yes' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="text-[14px] text-gray-700 font-bold">最终所属环节 <span className="text-red-500">*</span></div>
                      <select 
                        className="w-full h-[40px] px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                        value={finalLink}
                        onChange={(e) => setFinalLink(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                      >
                        <option>TurnGate评估</option>
                        <option>意图识别环节</option>
                        <option>Query改写环节</option>
                        <option>混合检索环节</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[14px] text-gray-700 font-bold">最终原因 <span className="text-red-500">*</span></div>
                      <textarea 
                        placeholder="请输入最终确认的原因分析..."
                        className="w-full h-24 p-4 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-500 transition-all placeholder-gray-300 bg-gray-50/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                        value={finalReason}
                        onChange={(e) => setFinalReason(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                      ></textarea>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[14px] text-gray-700 font-bold">确认依据 <span className="text-red-500">*</span></div>
                      <textarea 
                        placeholder="请输入确认该原因的详细依据..."
                        className="w-full h-24 p-4 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-500 transition-all placeholder-gray-300 bg-gray-50/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                        value={confirmationBasis}
                        onChange={(e) => setConfirmationBasis(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                      ></textarea>
                    </div>
                    <div className="space-y-2">
                      <div className="text-[14px] text-gray-700 font-bold">调整建议（选填）</div>
                      <textarea 
                        placeholder="请输入对该问题的后续调整建议..."
                        className="w-full h-24 p-4 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-500 transition-all placeholder-gray-300 bg-gray-50/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                        value={adjustmentSuggestion}
                        onChange={(e) => setAdjustmentSuggestion(e.target.value)}
                        disabled={drawerMode === 'evidence'}
                      ></textarea>
                    </div>
                  </div>
                )}

                {isIncluded === 'no' && (
                  <div className="space-y-3">
                    <div className="text-[14px] text-gray-700 font-bold">不纳入理由 <span className="text-red-500">*</span></div>
                    <textarea 
                      placeholder="请输入不纳入调优数据集的详细理由..."
                      className="w-full h-32 p-4 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-blue-500 transition-all placeholder-gray-300 bg-gray-50/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                      value={exclusionReason}
                      onChange={(e) => setExclusionReason(e.target.value)}
                      disabled={drawerMode === 'evidence'}
                    ></textarea>
                  </div>
                )}
              </div>
            </section>

            {/* Actions at the end of scrollable content */}
            {submitError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-[13px] font-medium rounded-lg mt-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></span>
                <span>{submitError}</span>
              </div>
            )}

            {drawerMode === 'review' && (
              <div className="pt-10 flex items-center justify-end gap-3 border-t border-gray-100 mt-10">
                <button 
                  className="h-[36px] px-6 border border-gray-300 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                  onClick={handleSaveDraft}
                >
                  保存草稿
                </button>
                <button 
                  className="h-[36px] px-8 bg-[#2563eb] text-white text-[13px] font-medium rounded-lg hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-100"
                  onClick={handleSubmitReview}
                >
                  提交复核
                </button>
              </div>
            )}

            {/* Review History Section */}
            {selectedSampleForReview?.history && selectedSampleForReview.history.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100 pb-20">
                <h3 className="text-[16px] font-bold text-gray-900 mb-6">复核历史</h3>
                <div className="space-y-8">
                  {selectedSampleForReview.history.map((h: any, idx: number) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-[13px] text-gray-400">
                        {h.time} · {h.action}
                      </div>
                      <div className="text-[14px] text-gray-600">
                        {h.isJudgeAccepted === 'yes' ? '认可 Judge' : '不认可 Judge'}; {h.isIncluded === 'yes' ? `纳入; ${h.finalLink}` : '不纳入'}
                        {h.linkReason && <span className="text-gray-400 ml-2">({h.linkReason})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Drawer>
      </div>
    );
  };

  return (
    <div className="page pb-20">
      {/* Top Tab Bar - Exact Style from Screenshot */}
      <div className="bg-white border-b border-gray-200 -mx-7 -mt-6 px-7 pt-3 flex items-center mb-8">
        <div className="flex items-center gap-8">
          <button
            className={`pb-2 text-[14px] font-medium transition-all relative cursor-pointer ${
              source === 'system'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
            }`}
            onClick={() => {
              setSource('system');
              setSelectedIds(new Set());
              setCurrentPage(1);
            }}
          >
            问题清单
          </button>
          <button
            className={`pb-2 text-[14px] font-medium transition-all relative cursor-pointer ${
              source === 'agent'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-900 border-b-2 border-transparent'
            }`}
            onClick={() => {
              setSource('agent');
              setSelectedIds(new Set());
              setCurrentPage(1);
            }}
          >
            坐席反馈复核
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[20px] font-bold text-gray-900">
          {selectedIssueId ? '' : (source === 'system' ? '问题清单' : '坐席反馈复核')}
        </h1>
      </div>

      {selectedIssueId && selectedIssue ? renderDetailView() : (
        source === 'system' ? (
          /* Tab 1: 问题清单 */
          <div>
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-2xs mb-4">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">问题名称</span>
                  <input
                    type="text"
                    placeholder="搜索标题、问题 ID 或指标编码"
                    className="w-[240px] h-[32px] px-3 border border-gray-300 rounded text-[13px] bg-white outline-none focus:border-blue-500 transition-all text-gray-800 placeholder-gray-400"
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(1)}
                  />
                </div>

              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">来源指标</span>
                <select
                  className="h-[32px] w-[180px] px-2 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                  value={sourceMetric}
                  onChange={(e) => { setSourceMetric(e.target.value); setCurrentPage(1); }}
                >
                  <option value="全部来源指标">全部来源指标</option>
                  <option value="误拦截率">误拦截率</option>
                  <option value="漏拦截率">漏拦截率</option>
                  <option value="模型与 Judge 操作集合一致率">模型与 Judge 操作集合一致率</option>
                  <option value="模型-Judge 端到端代理准确率">模型-Judge 端到端代理准确率</option>
                  <option value="RRF 前K命中率">RRF 前K命中率</option>
                  <option value="Reranker Top1 准确率">Reranker Top1 准确率</option>
                  <option value="Reranker 直出意图准确率">Reranker 直出意图准确率</option>
                  <option value="意图识别准确率">意图识别准确率</option>
                  <option value="拒识命中率">拒识命中率</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">评估批次</span>
                <select
                  className="h-[32px] w-[140px] px-2 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                  value={evalBatch}
                  onChange={(e) => { setEvalBatch(e.target.value); setCurrentPage(1); }}
                >
                  <option value="日常自动评估">日常自动评估</option>
                  <option value="全量评估">全量评估</option>
                  <option value="专项抽检">专项抽检</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">复核进度</span>
                <select
                  className="h-[32px] w-[140px] px-2 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                  value={reviewProgress}
                  onChange={(e) => { setReviewProgress(e.target.value); setCurrentPage(1); }}
                >
                  <option value="全部复核进度">全部复核进度</option>
                  <option value="待复核">待复核</option>
                  <option value="已复核归因">已复核归因</option>
                </select>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  className="h-[32px] px-5 bg-[#2563eb] hover:bg-blue-700 text-white text-[13px] font-medium rounded transition-all cursor-pointer shadow-2xs"
                  onClick={() => setCurrentPage(1)}
                >
                  查询
                </button>
                <button
                  className="h-[32px] px-5 bg-white hover:bg-gray-50 text-blue-600 border border-blue-500 text-[13px] font-medium rounded transition-all cursor-pointer"
                  onClick={handleResetSystemFilters}
                >
                  重置
                </button>
              </div>
            </div>
          </div>

          {/* Action Row: Export Button */}
          <div className="mb-4">
            <button 
              className={`h-[30px] px-3 text-[12px] font-medium rounded transition-all border-0 ${
                selectedIds.size > 0 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm' 
                  : 'bg-gray-200/80 text-gray-400 cursor-not-allowed'
              }`}
              disabled={selectedIds.size === 0}
            >
              导出有效badcase
            </button>
          </div>

          {/* Table List (Exact Header Style from Image) */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#D6E2FF] text-gray-900 text-[13px] font-medium border-b border-gray-200">
                  <th className="py-3 px-4 w-[40px]">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 cursor-pointer"
                      checked={selectedIds.size > 0 && selectedIds.size === filteredIssues.length}
                      onChange={() => toggleSelectAll(filteredIssues.map(i => i.id))}
                    />
                  </th>
                  <th className="py-3 px-4 font-normal">问题</th>
                  <th className="py-3 px-4 font-normal">来源指标</th>
                  <th className="py-3 px-4 font-normal">评估批次</th>
                  <th className="py-3 px-4 font-normal">关联时指标值 / 目标</th>
                  <th className="py-3 px-4 font-normal">样本复核</th>
                  <th className="py-3 px-4 font-normal">负责人</th>
                  <th className="py-3 px-4 font-normal">更新时间</th>
                  <th className="py-3 px-4 w-[90px] text-right font-normal">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] text-gray-800">
                {paginatedIssues.length > 0 ? (
                  paginatedIssues.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3.5 px-4 align-top pt-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 cursor-pointer"
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelectOne(item.id)}
                        />
                      </td>
                      <td className="py-3.5 px-4 align-top pt-4">
                        <div className="flex flex-col gap-0.5">
                          <strong className="text-[14px] font-bold text-gray-900 leading-snug">
                            {item.title}
                          </strong>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top pt-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[13px] font-medium text-gray-800">
                            {item.metricName}
                          </span>
                          <span className="text-[12px] text-gray-400 font-mono">
                            {item.metricCode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top pt-4">
                        <span className="text-[13px] text-gray-700">
                          {item.batch}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-top pt-4">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-gray-800">{item.value}</span>
                          <span className="text-[12px] text-gray-400 mt-0.5">{item.target}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top pt-4">
                        <div className="flex flex-col">
                          <span className="text-[13px] text-gray-800">
                            {item.sampleTotal} 条 · 待复核 {item.samplePending}
                          </span>
                          <span className="text-[12px] text-gray-400 mt-0.5">
                            复核中 · 可导出 {item.sampleExportable}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top pt-4">
                        <span className="text-[13px] text-gray-800">{item.owner}</span>
                      </td>
                      <td className="py-3.5 px-4 align-top pt-4">
                        <span className="text-[12px] text-gray-500 font-mono">{item.updateTime}</span>
                      </td>
                      <td className="py-3.5 px-4 align-top pt-4 text-right">
                        <button 
                          className="text-[13px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                          onClick={() => {
                            setSelectedIssueId(item.id);
                            setCurrentPage(1);
                          }}
                        >
                          查看问题
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400 text-[13px]">
                      暂无相关问题数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Footer (Exact Match with Image) */}
            <div className="bg-[#f4f5f7] py-2 px-4 flex justify-end items-center text-[13px] text-gray-600 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="mr-1">共 {filteredIssues.length} 条</span>
                
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
                {Array.from({ length: systemTotalPages }, (_, i) => i + 1).map(page => (
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
                  className={`w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${currentPage >= systemTotalPages ? 'bg-[#e8e8e8] text-gray-300 cursor-not-allowed' : 'bg-[#e8e8e8] hover:bg-gray-300 text-gray-600 cursor-pointer'}`}
                  disabled={currentPage >= systemTotalPages}
                  onClick={() => setCurrentPage(p => Math.min(systemTotalPages, p + 1))}
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
                      if (!isNaN(p) && p >= 1 && p <= systemTotalPages) {
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
      ) : (
        /* Tab 2: 坐席反馈复核 */
        <div>
          {/* Form Filter Bar */}
          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-2xs mb-4">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">对话内容</span>
                <input
                  type="text"
                  placeholder="搜索对话内容"
                  className="h-[32px] w-[220px] px-3 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white"
                  value={agentContentSearch}
                  onChange={(e) => setAgentContentSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">意图名称</span>
                <input
                  type="text"
                  placeholder="意图名称"
                  className="h-[32px] w-[180px] px-3 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white"
                  value={agentIntentSearch}
                  onChange={(e) => setAgentIntentSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-gray-800 whitespace-nowrap">状态</span>
                <select
                  className="h-[32px] w-[150px] px-2 border border-gray-300 rounded text-[13px] outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                  value={agentStatusSearch}
                  onChange={(e) => setAgentStatusSearch(e.target.value)}
                >
                  <option value="全部状态">全部状态</option>
                  <option value="已纳入">已纳入</option>
                  <option value="未纳入">未纳入</option>
                  <option value="待处理">待处理</option>
                </select>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  className="h-[32px] px-5 bg-[#2563eb] hover:bg-blue-700 text-white text-[13px] font-medium rounded transition-all cursor-pointer"
                  onClick={() => setCurrentPage(1)}
                >
                  查询
                </button>
                <button
                  className="h-[32px] px-5 bg-white hover:bg-gray-50 text-blue-600 border border-blue-500 text-[13px] font-medium rounded transition-all cursor-pointer"
                  onClick={handleResetAgentFilters}
                >
                  重置
                </button>
              </div>
            </div>
          </div>

          {/* Action Row: No export button here per Request 10 */}
          <div className="mb-4 h-[30px]"></div>

          {/* Table for 坐席反馈复核 */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#D6E2FF] text-gray-500 text-[13px] font-medium border-b border-gray-200">
                  <th className="py-4 px-6 font-normal w-[35%] text-gray-400">对话内容</th>
                  <th className="py-4 px-6 font-normal w-[20%] text-gray-400">被点踩意图</th>
                  <th className="py-4 px-6 font-normal w-[25%] text-gray-400">反馈理由</th>
                  <th className="py-4 px-6 font-normal w-[10%] text-gray-400">状态</th>
                  <th className="py-4 px-6 font-normal w-[10%] text-right text-gray-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px] text-gray-800">
                {paginatedAgentFeedbacks.length > 0 ? (
                  paginatedAgentFeedbacks.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/10 transition-colors">
                      <td className="py-5 px-6">
                        <p className="text-gray-800 leading-relaxed font-medium">{item.content}</p>
                      </td>
                      <td className="py-5 px-6 text-gray-600 font-medium">{item.intent}</td>
                      <td className="py-5 px-6 text-gray-600 leading-relaxed">{item.reason}</td>
                      <td className="py-5 px-6">
                        <span className={`px-2 py-0.5 text-[12px] rounded-sm border ${
                          item.progress === '已纳入' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : item.progress === '未纳入'
                              ? 'bg-gray-100 text-gray-600 border-gray-200'
                              : 'bg-orange-50 text-orange-500 border-orange-100'
                        }`}>
                          {item.progress}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button 
                          className="text-blue-600 hover:text-blue-700 font-medium transition-all cursor-pointer"
                          onClick={() => {
                            setSelectedAgentFeedback(item);
                            if (item.progress !== '待处理') {
                              setAgentProcessAction(item.action || (item.progress === '已纳入' ? '纳入问题清单' : '不纳入'));
                              setAgentFinalReason(item.finalReason || '');
                              setAgentFinalLink(item.finalLink || 'TurnGate评估');
                              setAgentExclusionReason(item.exclusionReason || '');
                            } else {
                              setAgentProcessAction('请选择');
                              setAgentFinalReason('');
                              setAgentFinalLink('请选择');
                              setAgentExclusionReason('');
                              setJoinIssueTitle(item.intent ? `${item.intent}识别与门控异常` : '');
                            }
                            setAgentSubmitError('');
                            setAgentFeedbackDrawerOpen(true);
                          }}
                        >
                          {item.progress !== '待处理' ? '查看' : '分析处理'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 text-[13px]">
                      暂无相关反馈数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Footer (Exact Match with Image) */}
            <div className="bg-[#f4f5f7] py-2 px-4 flex justify-end items-center text-[13px] text-gray-600 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="mr-1">共 {filteredAgentFeedbacks.length} 条</span>
                
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
                {Array.from({ length: agentTotalPages }, (_, i) => i + 1).map(page => (
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
                  className={`w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${currentPage >= agentTotalPages ? 'bg-[#e8e8e8] text-gray-300 cursor-not-allowed' : 'bg-[#e8e8e8] hover:bg-gray-300 text-gray-600 cursor-pointer'}`}
                  disabled={currentPage >= agentTotalPages}
                  onClick={() => setCurrentPage(p => Math.min(agentTotalPages, p + 1))}
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
                      if (!isNaN(p) && p >= 1 && p <= agentTotalPages) {
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
      ))}

      {/* --- ALL SHARED DRAWERS --- */}

      {/* Agent Feedback Analysis Drawer */}
      <Drawer 
        isOpen={agentFeedbackDrawerOpen} 
        onClose={() => setAgentFeedbackDrawerOpen(false)}
        title={
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-400 font-normal">{selectedAgentFeedback?.code} · 交互示例</span>
            <span className="text-[20px] font-bold text-gray-900 mt-1">
              {selectedAgentFeedback?.progress !== '待处理' ? '坐席意图点踩 · 复核详情' : '坐席意图点踩 · 分析处理'}
            </span>
          </div>
        }
        size="md"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-y-6 mb-8">
              <div className="space-y-1">
                <div className="text-[13px] text-gray-400">被点踩意图</div>
                <div className="text-[15px] font-medium text-gray-900">{selectedAgentFeedback?.intent}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[13px] text-gray-400">反馈状态</div>
                <div className="text-[15px] font-medium text-gray-900">{selectedAgentFeedback?.progress}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[13px] text-gray-400">坐席</div>
                <div className="text-[15px] font-medium text-gray-900">{selectedAgentFeedback?.agent}</div>
              </div>
            </div>

            {/* Content Box */}
            <div className="bg-[#eff6ff] p-5 rounded-lg mb-4">
              <div className="text-[12px] text-blue-500 font-medium mb-2 uppercase tracking-wider">客户原话（片段）</div>
              <div className="text-[15px] font-bold text-gray-900">
                {selectedAgentFeedback?.content}
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <button 
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-[13px] font-bold transition-colors cursor-pointer"
                onClick={() => setChatModalOpen(true)}
              >
                <MessageSquare size={14} />
                <span>查看对话记录</span>
              </button>
            </div>
            <div className="text-[13px] text-gray-500 mb-8 pl-1">
              坐席原始反馈：<span className="text-gray-700 font-medium">{selectedAgentFeedback?.reason}</span>
            </div>

            {/* Form Section */}
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="text-[14px] text-gray-700 font-bold">处理操作</div>
                <select 
                  className={`w-full h-[44px] px-3 border border-gray-200 rounded-lg text-[14px] outline-none bg-white text-gray-700 ${
                    selectedAgentFeedback?.progress !== '待处理' ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'cursor-pointer focus:border-blue-500'
                  }`}
                  value={agentProcessAction}
                  disabled={selectedAgentFeedback?.progress !== '待处理'}
                  onChange={(e) => setAgentProcessAction(e.target.value)}
                >
                  <option>请选择</option>
                  <option>纳入问题清单</option>
                  <option>不纳入</option>
                </select>
              </div>

              {agentProcessAction === '纳入问题清单' && (
                <>
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="text-[14px] text-gray-700 font-bold">人工最终原因 / 分析依据</div>
                    <textarea 
                      placeholder="请输入最终确认的原因分析或分析依据..."
                      className={`w-full h-32 p-4 border border-gray-200 rounded-xl text-[14px] outline-none transition-all placeholder-gray-300 ${
                        selectedAgentFeedback?.progress !== '待处理' ? 'bg-gray-50 text-gray-700 cursor-default' : 'bg-gray-50/20 focus:border-blue-500'
                      }`}
                      value={agentFinalReason}
                      readOnly={selectedAgentFeedback?.progress !== '待处理'}
                      onChange={(e) => setAgentFinalReason(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="text-[14px] text-gray-700 font-bold">最终所属环节</div>
                    <select 
                      className={`w-full h-[44px] px-3 border border-gray-200 rounded-lg text-[14px] outline-none bg-white text-gray-700 ${
                        selectedAgentFeedback?.progress !== '待处理' ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'cursor-pointer focus:border-blue-500'
                      }`}
                      value={agentFinalLink}
                      disabled={selectedAgentFeedback?.progress !== '待处理'}
                      onChange={(e) => setAgentFinalLink(e.target.value)}
                    >
                      <option>请选择</option>
                      <option>TurnGate评估</option>
                      <option>意图识别环节</option>
                      <option>Query改写环节</option>
                      <option>混合检索环节</option>
                    </select>
                  </div>
                </>
              )}

              {agentProcessAction === '不纳入' && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="text-[14px] text-gray-700 font-bold">不纳入理由</div>
                  <textarea 
                    placeholder="请输入不纳入调优数据集的详细理由..."
                    className={`w-full h-32 p-4 border border-gray-200 rounded-xl text-[14px] outline-none transition-all placeholder-gray-300 ${
                      selectedAgentFeedback?.progress !== '待处理' ? 'bg-gray-50 text-gray-700 cursor-default' : 'bg-gray-50/20 focus:border-blue-500'
                    }`}
                    value={agentExclusionReason}
                    readOnly={selectedAgentFeedback?.progress !== '待处理'}
                    onChange={(e) => setAgentExclusionReason(e.target.value)}
                  ></textarea>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="p-8 pt-6 border-t border-gray-50 mt-auto bg-white rounded-b-2xl">
            {agentSubmitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-500 text-[13px] rounded-lg flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                {agentSubmitError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              {selectedAgentFeedback?.progress !== '待处理' ? (
                <>
                  {selectedAgentFeedback?.associatedIssueId && (
                    <button 
                      type="button"
                      className="h-[40px] px-5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 rounded-lg text-[14px] font-medium transition-all cursor-pointer shadow-2xs"
                      onClick={() => handleOpenAssociatedIssue(selectedAgentFeedback?.associatedIssueId)}
                    >
                      查看关联问题
                    </button>
                  )}
                  <button 
                    type="button"
                    className="h-[40px] px-8 bg-[#2563eb] text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-100"
                    onClick={() => setAgentFeedbackDrawerOpen(false)}
                  >
                    关闭
                  </button>
                </>
              ) : (
                <button 
                  className="h-[40px] px-8 bg-[#2563eb] text-white text-[14px] font-bold rounded-lg hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-100 active:scale-95"
                  onClick={handleSaveAgentFeedback}
                >
                  保存处理
                </button>
              )}
            </div>
          </div>
        </div>
      </Drawer>

      {/* Join Badcase Issue List Drawer */}
      <Drawer
        isOpen={isJoinIssueDrawerOpen}
        onClose={() => setIsJoinIssueDrawerOpen(false)}
        title="加入 Badcase 问题清单"
        size="md"
      >
        <div className="flex flex-col h-full -mt-2">
          <div className="space-y-6 flex-1 px-1">
            {/* Form Section - matching Analysis.tsx badcase drawer style */}
            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <label className="text-[13px] text-gray-700">处理方式</label>
                <select 
                  className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] outline-none focus:border-blue-500 transition-all bg-white text-gray-700 cursor-pointer"
                  value={joinIssueMethod}
                  onChange={(e) => setJoinIssueMethod(e.target.value)}
                >
                  <option value="新建问题单">新建问题单</option>
                  <option value="关联已有问题单">关联已有问题单</option>
                </select>
              </div>

              {joinIssueMethod === '新建问题单' ? (
                <div className="space-y-2">
                  <label className="text-[13px] text-gray-700">问题标题</label>
                  <input 
                    type="text" 
                    className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] outline-none focus:border-blue-500 transition-all bg-white text-gray-800"
                    placeholder="请输入问题标题"
                    value={joinIssueTitle}
                    onChange={(e) => setJoinIssueTitle(e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[13px] text-gray-700">选择问题单</label>
                  <select 
                    className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] outline-none focus:border-blue-500 transition-all bg-white text-gray-700 cursor-pointer"
                    value={selectedExistingIssueId || (systemIssues[0]?.id || '')}
                    onChange={(e) => setSelectedExistingIssueId(e.target.value)}
                  >
                    {systemIssues.map((iss) => (
                      <option key={iss.id} value={iss.id}>
                        {iss.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {joinIssueMethod === '新建问题单' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[13px] text-gray-700">负责人</label>
                    <select 
                      className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] outline-none focus:border-blue-500 transition-all bg-white text-gray-700 cursor-pointer"
                      value={joinIssueOwner}
                      onChange={(e) => setJoinIssueOwner(e.target.value)}
                    >
                      <option>AI运营人员</option>
                      <option>算法负责人</option>
                      <option>系统管理员</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] text-gray-700">优先级</label>
                    <select 
                      className="w-full h-9 px-3 border border-gray-200 rounded-md text-[13px] outline-none focus:border-blue-500 transition-all bg-white text-gray-700 cursor-pointer"
                      value={joinIssuePriority}
                      onChange={(e) => setJoinIssuePriority(e.target.value)}
                    >
                      <option value="P1 · 高优先级">P1 · 高优先级</option>
                      <option value="P2 · 常规">P2 · 常规</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - matching Analysis.tsx badcase drawer style */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button 
              className="px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-md transition-all cursor-pointer"
              onClick={() => setIsJoinIssueDrawerOpen(false)}
            >
              取消
            </button>
            <button 
              className="px-4 py-2 text-[13px] bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-all shadow-sm cursor-pointer"
              onClick={() => {
                let createdIssueId = '';
                let createdIssueTitle = '';
                if (joinIssueMethod === '新建问题单') {
                  const title = joinIssueTitle.trim() || `${selectedAgentFeedback?.intent || '意图'}识别异常`;
                  const created = addIssue({
                    title: title,
                    batch: '日常自动评估',
                    metricName: selectedAgentFeedback?.intent || '意图点踩',
                    metricCode: selectedAgentFeedback?.code || 'AGENT-FEEDBACK',
                    value: '异常',
                    target: '-',
                    sampleTotal: 1,
                    samplePending: 1,
                    sampleExportable: 0,
                    owner: joinIssueOwner,
                  });
                  createdIssueId = created?.id || `BC-${Date.now().toString(36)}`;
                  createdIssueTitle = title;
                } else {
                  const targetIssueId = selectedExistingIssueId || (systemIssues[0]?.id || 'BC-mutdc6sk');
                  createdIssueId = targetIssueId;
                  const found = systemIssues.find(i => i.id === targetIssueId);
                  createdIssueTitle = found ? found.title : '关联已有问题单';
                  if (targetIssueId) {
                    updateIssueSamples(targetIssueId, 1);
                  }
                }
                const updated = agentFeedbacks.map(f => {
                  if (f.id === selectedAgentFeedback?.id) {
                    return { 
                      ...f, 
                      progress: '已纳入' as const,
                      action: '纳入问题清单',
                      finalReason: agentFinalReason,
                      finalLink: agentFinalLink,
                      associatedIssueId: createdIssueId,
                      associatedIssueTitle: createdIssueTitle
                    };
                  }
                  return f;
                });
                setAgentFeedbacks(updated);
                setIsJoinIssueDrawerOpen(false);
              }}
            >
              确定
            </button>
          </div>
        </div>
      </Drawer>

      {/* Conversation Chat Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setChatModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[700px] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">贷款来电 · 对话示例</h3>
                <p className="text-[12px] text-gray-400 mt-1">用户提供的完整案例示例 · 证件及账号数字已隐藏</p>
              </div>
              <button 
                onClick={() => setChatModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Toolbar */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[12px]">
                <span className="text-gray-500 font-medium">共 84 条消息</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className="text-gray-400">红色为示例选中的样本发言</span>
                </div>
              </div>
              <button className="text-blue-600 font-bold text-[12px] hover:underline">定位示例样本</button>
            </div>

            {/* Instruction */}
            <div className="px-6 py-3 bg-gray-50/30 text-[12px] text-gray-400 border-b border-gray-100">
              示例选中 “将还款时间改到月底” 的发言，用于演示自动定位；红色标记不代表评估结论。
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#fdfdfd]">
              {/* Bot Message */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-[12px] font-bold flex-shrink-0">
                  坐
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-900">坐席</span>
                    <span className="text-[10px] text-gray-300">第 42 条</span>
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-[14px] text-gray-700 leading-relaxed">
                    什么？
                  </div>
                </div>
              </div>

              {/* Bot Message 2 */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 text-[12px] font-bold flex-shrink-0">
                  坐
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-900">坐席</span>
                    <span className="text-[10px] text-gray-300">第 43 条</span>
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-[14px] text-gray-700 leading-relaxed">
                    嗯，好的，这个确实可能要以这个系统审核为准。嗯，那您这边看一下是不是还有没有其他办法呢？
                  </div>
                </div>
              </div>

              {/* Selected Customer Message */}
              <div className="flex flex-row-reverse items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-[12px] font-bold flex-shrink-0">
                  客
                </div>
                <div className="flex-1 flex flex-col items-end space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded font-bold">示例选中</span>
                    <span className="text-[10px] text-gray-300">第 44 条</span>
                    <span className="text-[11px] font-bold text-gray-900">客户</span>
                  </div>
                  <div className="bg-rose-50/50 border-2 border-rose-200 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-[14px] text-rose-600 font-medium leading-relaxed">
                    我就是没有办法再给你们打这个电话嘛，<span className="bg-rose-100 px-0.5">你给我把它我这个还款的时间给我改到月底去，我把它还进来，好吧？</span>
                  </div>
                </div>
              </div>

              {/* Customer Message 2 */}
              <div className="flex flex-row-reverse items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[12px] font-bold flex-shrink-0">
                  客
                </div>
                <div className="flex-1 flex flex-col items-end space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-300">第 45 条</span>
                    <span className="text-[11px] font-bold text-gray-900">客户</span>
                  </div>
                  <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-[14px] text-gray-700 leading-relaxed">
                    你不要算我的这个征信逾期。
                  </div>
                </div>
              </div>

              {/* Customer Message 3 */}
              <div className="flex flex-row-reverse items-start gap-3 pb-10">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-[12px] font-bold flex-shrink-0">
                  客
                </div>
                <div className="flex-1 flex flex-col items-end space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-300">第 46 条</span>
                    <span className="text-[11px] font-bold text-gray-900">客户</span>
                  </div>
                  <div className="bg-blue-50/30 border border-blue-100 p-4 rounded-2xl rounded-tr-none shadow-sm max-w-[85%] text-[14px] text-gray-700 leading-relaxed">
                    我后面所有的贷款都不然我都会还不了的这个钱。
                  </div>
                </div>
              </div>
            </div>
            <div className="h-2 bg-gradient-to-t from-gray-50 to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
}

