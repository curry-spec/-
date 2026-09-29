/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { ChevronRight, Info, Search, Filter, ArrowUpRight, ClipboardPlus, Check } from 'lucide-react';
import { Channel, Metric, BatchData } from '../types';
import { metrics, stages, baseData, channelNames } from '../data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalysisProps {
  channel: Channel;
  date: string;
}

export default function Analysis({ channel, date }: AnalysisProps) {
  const [selectedMetricId, setSelectedMetricId] = useState('hit');
  const [dimension, setDimension] = useState('intent');
  const [search, setSearch] = useState('');
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const selectedMetric = useMemo(() => 
    metrics.find(m => m.id === selectedMetricId) || metrics[0]
  , [selectedMetricId]);

  const currentData = useMemo(() => {
    const day = Number(date.slice(-2)) - 2;
    const chData = channel === 'all' 
      ? { 
          total: baseData.phone.total + baseData.online.total,
          rewriteN: baseData.phone.rewriteN + baseData.online.rewriteN,
          correct: baseData.phone.correct + baseData.online.correct,
          hit: baseData.phone.hit + baseData.online.hit,
          recall: baseData.phone.recall + baseData.online.recall,
          latency: (baseData.phone.latency * baseData.phone.total + baseData.online.latency * baseData.online.total) / (baseData.phone.total + baseData.online.total)
        }
      : baseData[channel];
    
    return chData;
  }, [channel, date]);

  const value = useMemo(() => {
    const m = selectedMetric;
    if (m.id === 'latency') return currentData.latency;
    if (!m.n || !m.d) return 0;
    return ((currentData[m.n as keyof typeof currentData] as number) / (currentData[m.d as keyof typeof currentData] as number)) * 100;
  }, [selectedMetric, currentData]);

  const chartData = useMemo(() => {
    const baseVal = typeof selectedMetric.target === 'number' ? selectedMetric.target : 90;
    return [
      { name: '09-02', value: baseVal + 2 },
      { name: '09-03', value: baseVal - 1 },
      { name: '09-04', value: baseVal + 1 },
      { name: '09-05', value: baseVal - 2 },
      { name: '09-06', value: baseVal },
      { name: '09-07', value: baseVal - 3 },
      { name: '09-08', value: baseVal - 1 },
    ];
  }, [selectedMetric]);

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

  return (
    <div className="page">
      <div className="analysis-tools">
        <div className="filter-group">
          <label htmlFor="analysisSource">评估任务</label>
          <select id="analysisSource">
            <option value="daily">日常自动评估</option>
            <option value="special">专项 · 补卡 / 换卡混淆回归</option>
          </select>
        </div>
        <span className="scope-badge badge blue ml-auto">AI 全量评估 · 人工抽检</span>
      </div>

      <div className="analysis-layout">
        <aside className="metric-rail">
          <div className="rail-header">
            <strong>分析指标</strong>
            <span className="badge neutral">12</span>
          </div>
          <div className="rail-scroll">
            {stages.map(s => (
              <div key={s.id} className="rail-group">
                <div className="rail-group-label">{s.name}</div>
                {metrics.filter(m => m.stage === s.id).map(m => {
                  const mVal = m.id === 'latency' ? currentData.latency : (m.n && m.d) ? ((currentData[m.n as keyof typeof currentData] as number) / (currentData[m.d as keyof typeof currentData] as number)) * 100 : 0;
                  const isBad = typeof m.target === 'number' && (m.dir === 'lt' ? mVal >= m.target : mVal <= m.target);
                  return (
                    <button
                      key={m.id}
                      className={`rail-metric ${selectedMetricId === m.id ? 'selected' : ''}`}
                      onClick={() => setSelectedMetricId(m.id)}
                    >
                      <span className="rail-metric-name">
                        {m.name}
                        {isBad && <span className="tiny-dot ml-1"></span>}
                      </span>
                      <span className="rail-metric-bottom">
                        <b className={isBad ? 'red-text' : ''}>{mVal.toFixed(2)}%</b>
                        <small>{isBad ? '未达标' : '达标'}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        <div className="analysis-main">
          <div className="flow-heading">
            <span className="step-number">01</span>
            <strong>指标结果</strong>
            <span className="flow-context">
              {stages.find(s => s.id === selectedMetric.stage)?.name} <ChevronRight size={12} /> {selectedMetric.name}
            </span>
          </div>

          <div className="analysis-title">
            <div>
              <div className="section-title">
                <h2>{selectedMetric.name}</h2>
                <span className={`badge ${typeof selectedMetric.target === 'number' && (selectedMetric.dir === 'lt' ? value >= selectedMetric.target : value <= selectedMetric.target) ? 'red' : 'green'}`}>
                  {typeof selectedMetric.target === 'number' && (selectedMetric.dir === 'lt' ? value >= selectedMetric.target : value <= selectedMetric.target) ? '未达标' : '已达标'}
                </span>
              </div>
              <div className="subtitle">{selectedMetric.code} · {stages.find(s => s.id === selectedMetric.stage)?.version}</div>
            </div>
            <div className="analysis-title-right">
              <button className="button small">
                <Info size={14} />
                口径
              </button>
            </div>
          </div>

          <div className="quality-strip mt-4">
            <span>可评 {currentData[selectedMetric.d as keyof typeof currentData]?.toLocaleString() || currentData.total.toLocaleString()} / {currentData[selectedMetric.d as keyof typeof currentData]?.toLocaleString() || currentData.total.toLocaleString()}</span>
            <button className="text-button ml-auto">
              查看评估依据 <ChevronRight size={12} />
            </button>
          </div>

          <div className="analysis-stats mt-4">
            <div className="analysis-stat">
              <label>当前{selectedMetric.name}</label>
              <b className="red-text">{value.toFixed(2)}%</b>
              <p>目标 {selectedMetric.dir === 'gt' ? '≥' : '≤'} {selectedMetric.target}%</p>
            </div>
            <div className="analysis-stat">
              <label>较前一日</label>
              <b className="red-text">-0.75pp</b>
              <p>基线 93.00%</p>
            </div>
            <div className="analysis-stat error-total">
              <label>未通过 / 可评样本</label>
              <b>{totalErrors.toLocaleString()} / {currentData[selectedMetric.d as keyof typeof currentData]?.toLocaleString() || currentData.total.toLocaleString()} 条</b>
              <p>AI全量质检</p>
            </div>
          </div>

          <section className="analysis-section mt-4 bg-white border border-gray-200 p-4 rounded-lg">
             <div className="section-head mb-4">
               <div className="section-title">
                 <h2 className="text-sm font-bold">指标趋势</h2>
               </div>
             </div>
             <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f5" />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#8a94a6'}} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#8a94a6'}} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '4px' }} />
                    <Line type="monotone" dataKey="value" stroke="var(--blue)" strokeWidth={2} dot={{ r: 3, fill: 'var(--blue)', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </section>

          <section className="analysis-section distribution-section mt-8">
            <div className="flow-heading">
              <span className="step-number">02</span>
              <strong>错误样本分布</strong>
              <span className="flow-context">{selectedMetric.name}未通过 · {totalErrors.toLocaleString()} 条</span>
            </div>
            <div className="analysis-split">
              <div>
                <div className="section-head">
                  <div className="section-title">
                    <h2 className="text-sm font-bold">意图分类</h2>
                    <small className="text-gray-400">Excel明细字段</small>
                  </div>
                  <select className="text-xs border-gray-200 rounded" value={dimension} onChange={(e) => setDimension(e.target.value)}>
                    <option value="intent">评估模型预测意图名称</option>
                    <option value="channel">业务渠道</option>
                  </select>
                </div>
                <div className="table-wrap">
                  <table className="breakdown-table">
                    <thead>
                      <tr>
                        <th>意图</th>
                        <th>错误数</th>
                        <th>占比</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdownData.map((r, i) => (
                        <tr key={i} className={selectedSlice === r.label ? 'bg-blue-50/50' : ''}>
                          <td>
                            <button 
                              className="breakdown-label text-blue-600 hover:underline" 
                              onClick={() => setSelectedSlice(selectedSlice === r.label ? null : r.label)}
                            >
                              {r.label}
                            </button>
                          </td>
                          <td><strong>{r.count}</strong></td>
                          <td className="ratio-cell">
                            {(r.count / totalErrors * 100).toFixed(1)}%
                            <span className="mini-bar mt-1">
                              <span style={{ width: `${r.count / totalErrors * 100}%` }}></span>
                            </span>
                          </td>
                          <td>
                            <button 
                              className="icon-button" 
                              onClick={() => setSelectedSlice(selectedSlice === r.label ? null : r.label)}
                            >
                              {selectedSlice === r.label ? <Check size={14}/> : <Filter size={14}/>}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="distribution-next">
                <div className="section-head">
                  <div className="section-title">
                    <h2 className="text-sm font-bold">错误类型</h2>
                    <small className="text-gray-400">指标编码</small>
                  </div>
                </div>
                <div className="group-scope bg-blue-50/50 p-2 text-[11px] text-blue-800 border-t border-blue-100 flex justify-between">
                   <span>{selectedSlice || '全部错误样本'}</span>
                   <b>{selectedSlice ? breakdownData.find(d => d.label === selectedSlice)?.count : totalErrors} 条</b>
                </div>
                <div className="error-buckets">
                   {errorBuckets.map(g => (
                     <button 
                        key={g.id} 
                        className={`error-bucket ${selectedGroup === g.id ? 'selected' : ''}`}
                        onClick={() => setSelectedGroup(selectedGroup === g.id ? null : g.id)}
                      >
                        <span className="bucket-index">
                          {selectedGroup === g.id ? <Check size={12}/> : g.id}
                        </span>
                        <span>
                          <strong>{g.label}</strong>
                          <small>{g.code}</small>
                        </span>
                        <span><b>{g.count}</b> <small>{(g.count / totalErrors * 100).toFixed(1)}%</small></span>
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </section>

          <section className="analysis-section mt-8">
            <div className="flow-heading">
              <span className="step-number">03</span>
              <strong>对应错误样本</strong>
              <button className="text-button ml-auto">
                <ClipboardPlus size={14} />
                将当前范围加入 Badcase
              </button>
            </div>
            
            <div className="scope-trail bg-blue-50/50 border-l-4 border-blue-400 p-3 mb-4 text-[11px]">
               <span className="text-gray-400">当前错误范围</span>
               <span className="mx-2 text-gray-300">/</span>
               <span>{selectedMetric.name}未通过 <b>{totalErrors} 条</b></span>
               {selectedSlice && (
                 <>
                   <span className="mx-2 text-gray-300">/</span>
                   <span>{selectedSlice} <b>{breakdownData.find(d => d.label === selectedSlice)?.count} 条</b></span>
                 </>
               )}
               <button className="ml-auto text-blue-600" onClick={() => {setSelectedSlice(null); setSelectedGroup(null);}}>重置范围</button>
            </div>

            <div className="sample-toolbar mt-4 flex gap-4">
              <div className="search-box flex-1 max-w-sm">
                <Search size={14} className="text-gray-400" />
                <input 
                  type="search" 
                  placeholder="搜索表达、意图或样本ID"
                  className="w-full border-0 focus:ring-0 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="text-xs border-gray-200 rounded px-2">
                <option>全部复核状态</option>
                <option>待复核</option>
                <option>已确认错误</option>
              </select>
            </div>
            <div className="table-wrap mt-2">
              <table className="sample-table">
                <thead>
                  <tr>
                    <th style={{ width: '28px' }}><input type="checkbox" /></th>
                    <th style={{ width: '35%' }}>客户表达 / 样本</th>
                    <th>参考结果 / 实际结果</th>
                    <th>错误类型</th>
                    <th>复核状态</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><input type="checkbox" /></td>
                    <td className="query-cell font-medium">
                      我的信用卡找不到了，不用挂失，直接补办新卡。
                      <span className="subline block font-normal text-gray-400">D08-HIT-P-0001 · 电话客服</span>
                      <span className="subline block font-normal text-gray-400">信用卡补卡 · 单轮完整表达</span>
                    </td>
                    <td>
                      信用卡补卡
                      <span className="subline block red-text">信用卡换卡</span>
                    </td>
                    <td>正确意图未进入融合候选</td>
                    <td><span className="badge amber">待复核</span></td>
                    <td><button className="text-button text-blue-600">查看链路 <ArrowUpRight size={12}/></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="sample-footer mt-4 flex justify-between items-center text-xs text-gray-500">
               <span>已选 0 条 <button className="button small ml-2" disabled>建立问题单</button></span>
               <div className="flex gap-2 items-center">
                  <span>1-1 / 1 条 · 第 1/1 页</span>
                  <button className="icon-button" disabled><ChevronRight className="rotate-180" size={14}/></button>
                  <button className="icon-button" disabled><ChevronRight size={14}/></button>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
