/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Channel = 'all' | 'phone' | 'online';
export type View = 'overview' | 'analysis' | 'badcase' | 'batches' | 'assets' | 'validation';

export interface Metric {
  id: string;
  code: string;
  name: string;
  n?: string;
  d?: string;
  target?: number | string;
  dir?: 'gt' | 'lt';
  inclusive?: boolean;
  source: string;
  definition: string;
  unit?: string;
  trend?: number[];
  provided?: boolean;
  stage?: string;
  hint?: string;
}

export interface Stage {
  id: string;
  name: string;
  icon: string;
  color?: string;
  caption: string;
  version: string;
  latency: number;
  goal: number | null;
  aux: [string, string][];
}

export interface BatchData {
  sessions: number;
  total: number;
  correct: number;
  manualN: number;
  manual: number;
  judge: number;
  latency: number;
  biz: number;
  block: number;
  nonbiz: number;
  missed: number;
  rewriteN: number;
  operations: number;
  query: number;
  recall: number;
  hit: number;
  directN: number;
  direct: number;
  llmN: number;
  llm: number;
  rejectN: number;
  reject: number;
  randomGoal: number;
  targeted: number;
  targetedGoal: number;
}
