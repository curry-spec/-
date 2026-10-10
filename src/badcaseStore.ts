/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface BadcaseIssue {
  id: string;
  title: string;
  batch: string;
  metricName: string;
  metricCode: string;
  value: string;
  target: string;
  sampleTotal: number;
  samplePending: number;
  sampleExportable: number;
  owner: string;
  updateTime: string;
  progress: string;
}

const STORAGE_KEY = 'ai_studio_badcase_issues_v1';

export const DEFAULT_ISSUES: BadcaseIssue[] = [
  {
    id: 'BC-mutdc6sk',
    title: '误拦截率异常',
    batch: '日常自动评估',
    metricName: '误拦截率',
    metricCode: 'TG-FBR',
    value: '5.86%',
    target: '目标 ≤ 0.5%',
    sampleTotal: 820,
    samplePending: 819,
    sampleExportable: 1,
    owner: 'AI运营人员',
    updateTime: '2026/10/4 13:16:42',
    progress: '待复核'
  },
  {
    id: 'BC-mutdxsme',
    title: '误拦截率异常2',
    batch: '日常自动评估',
    metricName: '误拦截率',
    metricCode: 'TG-FBR',
    value: '5.86%',
    target: '目标 ≤ 0.5%',
    sampleTotal: 820,
    samplePending: 819,
    sampleExportable: 1,
    owner: '算法负责人',
    updateTime: '2026/10/4 13:33:31',
    progress: '待复核'
  },
  {
    id: 'BC-k1l2m3n4',
    title: 'Reranker Top1 准确率异常',
    batch: '日常自动评估',
    metricName: 'Reranker Top1 准确率',
    metricCode: 'HJ_RERANK_TOP1_ACC',
    value: '92.25%',
    target: '目标 ≥ 93.00%',
    sampleTotal: 18,
    samplePending: 15,
    sampleExportable: 3,
    owner: 'AI运营人员',
    updateTime: '2026/09/08 10:20:15',
    progress: '待复核'
  },
  {
    id: 'BC-yt829a01',
    title: '拒识命中率下滑分析单',
    batch: '日常自动评估',
    metricName: '拒识命中率',
    metricCode: 'TG-RR',
    value: '71.4%',
    target: '目标 ≥ 80.0%',
    sampleTotal: 245,
    samplePending: 112,
    sampleExportable: 133,
    owner: '核心算法组',
    updateTime: '2026/09/10 14:22:10',
    progress: '待复核'
  },
  {
    id: 'BC-yt829a02',
    title: '意图识别盲区样本归集',
    batch: '日常自动评估',
    metricName: '意图识别准确率',
    metricCode: 'HJ_INTENT_ACC',
    value: '88.5%',
    target: '目标 ≥ 95.0%',
    sampleTotal: 65,
    samplePending: 30,
    sampleExportable: 35,
    owner: '知识库治理组',
    updateTime: '2026/09/11 11:05:44',
    progress: '已复核归因'
  },
  {
    id: 'BC-yt829a03',
    title: '转人工率触发异常警报',
    batch: '专项抽检',
    metricName: '转人工率',
    metricCode: 'CS_TRANSFER_RATE',
    value: '18.2%',
    target: '目标 ≤ 10.0%',
    sampleTotal: 310,
    samplePending: 280,
    sampleExportable: 30,
    owner: 'AI运营人员',
    updateTime: '2026/09/12 09:12:00',
    progress: '待复核'
  },
  {
    id: 'BC-yt829a04',
    title: '话术满意度评分异常',
    batch: '日常自动评估',
    metricName: '满意度',
    metricCode: 'CS_CSAT',
    value: '82.1%',
    target: '目标 ≥ 90.0%',
    sampleTotal: 45,
    samplePending: 12,
    sampleExportable: 33,
    owner: '质量监督组',
    updateTime: '2026/09/14 16:40:22',
    progress: '已复核归因'
  },
  {
    id: 'BC-yt829a05',
    title: 'LLM拒答率偏高问题',
    batch: '全量评估',
    metricName: '拒答率',
    metricCode: 'LLM_REFUSAL_RATE',
    value: '4.3%',
    target: '目标 ≤ 1.0%',
    sampleTotal: 98,
    samplePending: 90,
    sampleExportable: 8,
    owner: '算法负责人',
    updateTime: '2026/09/15 18:30:10',
    progress: '待复核'
  },
  {
    id: 'BC-yt829a06',
    title: '语音ASR识别文本错漏字',
    batch: '日常自动评估',
    metricName: 'ASR准确率',
    metricCode: 'ASR_WORD_ACC',
    value: '89.1%',
    target: '目标 ≥ 96.0%',
    sampleTotal: 150,
    samplePending: 75,
    sampleExportable: 75,
    owner: '语音团队',
    updateTime: '2026/09/16 08:45:30',
    progress: '待复核'
  },
  {
    id: 'BC-yt829a07',
    title: '知识检索召回率不足',
    batch: '全量评估',
    metricName: '检索召回率',
    metricCode: 'RAG_RECALL_R',
    value: '79.8%',
    target: '目标 ≥ 88.0%',
    sampleTotal: 210,
    samplePending: 180,
    sampleExportable: 30,
    owner: 'RAG项目组',
    updateTime: '2026/09/18 15:20:11',
    progress: '已复核归因'
  },
  {
    id: 'BC-yt829a08',
    title: '超时未回复会话归因',
    batch: '日常自动评估',
    metricName: '平均首响应时长',
    metricCode: 'CS_FIRST_RESP',
    value: '12s',
    target: '目标 ≤ 5s',
    sampleTotal: 88,
    samplePending: 40,
    sampleExportable: 48,
    owner: '客服运营部',
    updateTime: '2026/09/20 10:10:00',
    progress: '待复核'
  }
];

export function getStoredIssues(): BadcaseIssue[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse badcase issues', e);
  }
  return DEFAULT_ISSUES;
}

export function saveStoredIssues(issues: BadcaseIssue[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    window.dispatchEvent(new Event('badcase_issues_updated'));
  } catch (e) {
    console.error('Failed to save badcase issues', e);
  }
}

export function useBadcaseIssues() {
  const [issues, setIssues] = useState<BadcaseIssue[]>(getStoredIssues);

  useEffect(() => {
    const handleUpdate = () => {
      setIssues(getStoredIssues());
    };
    window.addEventListener('badcase_issues_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('badcase_issues_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addIssue = (newIssue: Omit<BadcaseIssue, 'id' | 'updateTime' | 'progress'> & { id?: string }) => {
    const current = getStoredIssues();
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const randomId = 'BC-' + Math.random().toString(36).substring(2, 10);
    const issueToAdd: BadcaseIssue = {
      id: newIssue.id || randomId,
      title: newIssue.title,
      batch: newIssue.batch || '日常自动评估',
      metricName: newIssue.metricName,
      metricCode: newIssue.metricCode,
      value: newIssue.value,
      target: newIssue.target,
      sampleTotal: newIssue.sampleTotal || 1,
      samplePending: newIssue.samplePending || newIssue.sampleTotal || 1,
      sampleExportable: newIssue.sampleExportable || 0,
      owner: newIssue.owner || 'AI运营人员',
      updateTime: dateStr,
      progress: '待复核'
    };

    const next = [issueToAdd, ...current];
    saveStoredIssues(next);
    return issueToAdd;
  };

  const updateIssueSamples = (issueId: string, addedSampleCount: number) => {
    const current = getStoredIssues();
    const now = new Date();
    const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    let updatedIssue: BadcaseIssue | null = null;
    const next = current.map(item => {
      if (item.id === issueId) {
        updatedIssue = {
          ...item,
          sampleTotal: item.sampleTotal + addedSampleCount,
          samplePending: item.samplePending + addedSampleCount,
          updateTime: dateStr
        };
        return updatedIssue;
      }
      return item;
    });

    if (updatedIssue) {
      saveStoredIssues(next);
    }
    return updatedIssue;
  };

  return { issues, addIssue, updateIssueSamples };
}
