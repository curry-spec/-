/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Metric, Stage, BatchData } from './types';

export const channelNames: Record<string, string> = {
  all: '全部渠道',
  phone: '电话客服',
  online: '在线客服'
};

export const baseData: Record<'phone' | 'online', BatchData> = {
  phone: {
    sessions: 4800,
    total: 20000,
    correct: 18750,
    manualN: 240,
    manual: 231,
    judge: 142,
    latency: 820,
    biz: 8000,
    block: 640,
    nonbiz: 4000,
    missed: 900,
    rewriteN: 8260,
    operations: 7960,
    query: 8000,
    recall: 8000,
    hit: 7600,
    directN: 6800,
    direct: 6260,
    llmN: 1260,
    llm: 1220,
    rejectN: 200,
    reject: 170,
    randomGoal: 250,
    targeted: 50,
    targetedGoal: 120
  },
  online: {
    sessions: 3200,
    total: 15000,
    correct: 14700,
    manualN: 90,
    manual: 88,
    judge: 86,
    latency: 580,
    biz: 6000,
    block: 180,
    nonbiz: 2000,
    missed: 400,
    rewriteN: 6220,
    operations: 6090,
    query: 6080,
    recall: 6110,
    hit: 6060,
    directN: 5000,
    direct: 4900,
    llmN: 1070,
    llm: 1055,
    rejectN: 150,
    reject: 145,
    randomGoal: 150,
    targeted: 30,
    targetedGoal: 80
  }
};

export const dailyTrends = [
  { date: '09-02', '全过程准确率': 93.1, '误拦截率': 4.1, '漏拦截率': 21.0, '模型与 Judge 操作集合一致率': 97.0, '模型-Judge 端到端代理准确率': 97.2, 'RRF 前K命中率': 97.4, 'Reranker Top1 准确率': 94.3, 'Reranker 直出意图准确率': 94.6, '意图识别准确率': 97.6, '拒识命中率': 90.0, '全过程人工标注准确率': 96.2, '评估模型准确率': 94.5 },
  { date: '09-03', '全过程准确率': 92.8, '误拦截率': 4.3, '漏拦截率': 21.2, '模型与 Judge 操作集合一致率': 97.1, '模型-Judge 端到端代理准确率': 97.3, 'RRF 前K命中率': 97.5, 'Reranker Top1 准确率': 94.4, 'Reranker 直出意图准确率': 94.5, '意图识别准确率': 97.7, '拒识命中率': 90.1, '全过程人工标注准确率': 95.8, '评估模型准确率': 94.2 },
  { date: '09-04', '全过程准确率': 93.4, '误拦截率': 4.5, '漏拦截率': 21.5, '模型与 Judge 操作集合一致率': 97.0, '模型-Judge 端到端代理准确率': 97.1, 'RRF 前K命中率': 97.3, 'Reranker Top1 准确率': 94.2, 'Reranker 直出意图准确率': 94.7, '意图识别准确率': 97.5, '拒识命中率': 89.9, '全过程人工标注准确率': 96.5, '评估模型准确率': 94.8 },
  { date: '09-05', '全过程准确率': 93.7, '误拦截率': 4.8, '漏拦截率': 21.8, '模型与 Judge 操作集合一致率': 97.2, '模型-Judge 端到端代理准确率': 97.4, 'RRF 前K命中率': 97.6, 'Reranker Top1 准确率': 94.5, 'Reranker 直出意图准确率': 94.8, '意图识别准确率': 97.8, '拒识命中率': 90.2, '全过程人工标注准确率': 96.1, '评估模型准确率': 94.1 },
  { date: '09-06', '全过程准确率': 93.9, '误拦截率': 4.9, '漏拦截率': 21.6, '模型与 Judge 操作集合一致率': 97.3, '模型-Judge 端到端代理准确率': 97.5, 'RRF 前K命中率': 97.7, 'Reranker Top1 准确率': 94.6, 'Reranker 直出意图准确率': 94.9, '意图识别准确率': 97.9, '拒识命中率': 90.3, '全过程人工标注准确率': 95.9, '评估模型准确率': 94.6 },
  { date: '09-07', '全过程准确率': 93.5, '误拦截率': 4.7, '漏拦截率': 21.4, '模型与 Judge 操作集合一致率': 97.1, '模型-Judge 端到端代理准确率': 97.3, 'RRF 前K命中率': 97.5, 'Reranker Top1 准确率': 94.4, 'Reranker 直出意图准确率': 94.7, '意图识别准确率': 97.7, '拒识命中率': 90.1, '全过程人工标注准确率': 96.3, '评估模型准确率': 95.0 },
  { date: '09-08', '全过程准确率': 92.95, '误拦截率': 5.8, '漏拦截率': 22.0, '模型与 Judge 操作集合一致率': 97.0, '模型-Judge 端到端代理准确率': 97.2, 'RRF 前K命中率': 97.4, 'Reranker Top1 准确率': 94.3, 'Reranker 直出意图准确率': 94.6, '意图识别准确率': 97.6, '拒识命中率': 90.0, '全过程人工标注准确率': 96.25, '评估模型准确率': 94.5 }
];

export const metrics: Metric[] = [
  {
    id: 'e2e',
    code: 'E2E-ACC',
    name: '全过程准确率',
    n: 'correct',
    d: 'total',
    target: 90,
    dir: 'gt',
    inclusive: true,
    source: '意图识别指标清单 Excel',
    definition: '从检索直出到模型路由后的最终识别意图，与评估模型预测意图一致的比例。',
    trend: [94.0, 93.6, 94.1, 93.8, 93.7, 93.0, 92.25]
  },
  {
    id: 'manual',
    code: '编码待提供',
    name: '全过程人工标注准确率',
    n: 'manual',
    d: 'manualN',
    target: 95,
    dir: 'gt',
    source: '意图识别指标清单 Excel',
    definition: '人工标注基准下的意图识别准确率',
    trend: [96.25, 95.8, 96.5, 96.1, 95.9, 96.3, 96.25]
  },
  {
    id: 'judge',
    code: '编码待提供',
    name: '评估模型准确率',
    n: 'judge',
    d: 'manualN',
    target: 90,
    dir: 'gt',
    source: '评估系统内部 API',
    definition: '基于评估模型生成的意图与人工标注意图的匹配程度，反映自动化评估的可靠性。',
    trend: [94.5, 94.2, 94.8, 94.1, 94.6, 95.0, 94.5]
  },
  {
    id: 'latency',
    code: 'E2E-RT-AVG',
    name: '全过程平均耗时',
    source: 'Excel · 指标汇总',
    unit: 'ms',
    target: 1000,
    dir: 'lt',
    inclusive: true,
    definition: '单条消息从意图预处理、意图处理到意图相关逻辑处理完成的总耗时平均值。',
    trend: [700, 712, 696, 724, 733, 710, 724]
  },
  {
    id: 'block',
    stage: 'filter',
    code: 'TG-FBR',
    name: '误拦截率',
    n: 'block',
    d: 'biz',
    target: 0.5,
    dir: 'lt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: '应进入 Plus 却被 TurnGate 预测拦截的比例。',
    hint: '按混淆矩阵标签和错误归因核查 FN 样本。'
  },
  {
    id: 'missed',
    stage: 'filter',
    code: 'TG-MBR',
    name: '漏拦截率',
    n: 'missed',
    d: 'nonbiz',
    target: 25,
    dir: 'lt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: '应拦截却进入 Plus 的比例。',
    hint: '按混淆矩阵标签和预测原因码核查 FP 样本。'
  },
  {
    id: 'operations',
    stage: 'rewrite',
    code: 'QR-OP-SET-MATCH',
    name: '模型与 Judge 操作集合一致率',
    n: 'operations',
    d: 'rewriteN',
    target: 90,
    dir: 'gt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: '模型输出 operations 与 Judge 判定操作集合完全一致的比例。',
    hint: '分别检查修正、指代、补全、增量四类操作的漏报与多报。'
  },
  {
    id: 'query',
    stage: 'rewrite',
    code: 'QR-E2E-PROXY-ACC',
    name: '模型-Judge 端到端代理准确率',
    n: 'query',
    d: 'rewriteN',
    target: 85,
    dir: 'gt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: '格式合法、文本质量通过且模型与 Judge 操作集合一致的样本比例。',
    hint: '同时检查格式合法、文本质量和操作集合一致性。'
  },
  {
    id: 'recall',
    stage: 'retrieval',
    code: 'HJ_RRF_HIT_AT_K',
    name: 'RRF 前K命中率',
    n: 'recall',
    d: 'rewriteN',
    target: 95,
    dir: 'gt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: '标准意图出现在 RRF 融合后前 K 个候选中的比例，K 由评估配置提供。',
    hint: '对照 sparse、vector、RRF 三路结果，定位标准意图首次丢失的位置。'
  },
  {
    id: 'hit',
    stage: 'retrieval',
    code: 'HJ_RERANK_TOP1_ACC',
    name: 'Reranker Top1 准确率',
    n: 'hit',
    d: 'rewriteN',
    target: 93,
    dir: 'gt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: 'Reranker Top1 与标准意图一致的比例，分母为成功执行样本。',
    hint: '区分标准意图未进入候选、精排降级和精排未纠正。'
  },
  {
    id: 'direct',
    stage: 'retrieval',
    code: 'HJ_DIRECT_RETURN_ACC',
    name: 'Reranker 直出意图准确率',
    n: 'direct',
    d: 'directN',
    target: 93,
    dir: 'gt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: '实际直出样本中，直出意图与标准意图一致的比例。',
    hint: '核查直出阈值、processType=direct_return 和实际选中候选。'
  },
  {
    id: 'llm',
    stage: 'llm',
    code: 'LLM-INTENT-ACC',
    name: '意图识别准确率',
    n: 'llm',
    d: 'llmN',
    target: 95,
    dir: 'gt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: '最终意图路由输出中，模型判定意图与标准标注意图一致的比例。',
    hint: '对照模型混淆矩阵，分析分类错配、语篇错配和未知标签样本。'
  },
  {
    id: 'reject',
    stage: 'llm',
    code: 'LLM-REJECT-ACC',
    name: '拒识命中率',
    n: 'reject',
    d: 'rejectN',
    target: 90,
    dir: 'gt',
    inclusive: true,
    source: 'Excel · 核心指标',
    definition: '应该拒识的超纲或无意义请求中，模型正确识别并执行拒识操作的比例。',
    hint: '分析漏拒识（进入业务知识库导致幻觉）与误拒识（正常意图被阻断）样本。'
  }
];

export const stages: Stage[] = [
  {
    id: 'filter',
    name: '前置过滤',
    icon: 'filter',
    caption: 'TurnGate · 拦截 / 放行',
    version: 'Excel 未提供版本',
    latency: 12,
    goal: 50,
    aux: [
      ['TG-ACC', '门控决策准确率'],
      ['TG-RECALL', '业务放行召回率'],
      ['TG-FBR', '误拦截率'],
      ['TG-SAFE', '安全拦截率'],
      ['TG-TYPE', '轮次类型准确率'],
      ['TG-LOWCONF', '低置信回退率'],
      ['TG-RT-MAX', '最长响应耗时'],
      ['TG-RT-MIN', '最短响应耗时'],
      ['TG-RT-AVG', '平均响应耗时']
    ]
  },
  {
    id: 'rewrite',
    name: 'Query 改写',
    icon: 'text-cursor-input',
    caption: 'Query Rewrite · 操作执行',
    version: 'Excel 未提供版本',
    latency: 420,
    goal: 500,
    aux: [
      ['QR-E2E-PROXY-ACC', '端到端代理准确率'],
      ['QR-OP-SET-MATCH', '操作集合一致率'],
      ['QR-SF-PASS', '语义忠实通过率'],
      ['QR-EG-PASS', '事实有据通过率'],
      ['QR-SI-PASS', '槽位完整通过率'],
      ['QR-JUDGE-COVERAGE', 'Judge 覆盖率'],
      ['QR-RT-MIN', '最短响应耗时'],
      ['QR-RT-AVG', '平均响应耗时'],
      ['QR-RT-MAX', '最长响应耗时']
    ]
  },
  {
    id: 'retrieval',
    name: '混合检索',
    icon: 'search',
    caption: 'Sparse + Dense → RRF → Reranker',
    version: 'Excel 未提供版本',
    latency: 208,
    goal: 200,
    aux: [
      ['HJ_SPARSE_HIT_AT_K', 'Sparse 前K命中率'],
      ['HJ_VECTOR_HIT_AT_K', '向量前K命中率'],
      ['HJ_RRF_HIT_AT_K', 'RRF 前K命中率'],
      ['HJ_RERANK_TOP1_ACC', 'Reranker Top1准确率'],
      ['HJ_DIRECT_RETURN_ACC', '直出意图准确率'],
      ['HJ_DIRECT_RETURN_RATE', '直出率'],
      ['HJ_RERANK_HIT_AT_K', 'Reranker 前K命中率'],
      ['HJ_ZERO_CANDIDATE_RATE', '零候选率'],
      ['HJ_TOTAL_LATENCY', '总链路耗时'],
      ['HJ_EMBEDDING_LATENCY', 'Embedding 耗时'],
      ['HJ_SPARSE_LATENCY', 'Sparse 耗时'],
      ['HJ_VECTOR_LATENCY', '向量检索耗时'],
      ['HJ_RERANK_LATENCY', 'Reranker 耗时']
    ]
  },
  {
    id: 'llm',
    name: '意图路由',
    icon: 'brain-circuit',
    caption: '意图识别 · 路由结果',
    version: 'Excel 未提供版本',
    latency: 460,
    goal: null,
    aux: [
      ['LLM-FORMAT', '格式合法率'],
      ['LLM-SCORE', '评估模型评分'],
      ['LLM-CONF', '预测置信度'],
      ['LLM-RT', '响应耗时']
    ]
  }
];
