/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, RotateCcw, Edit2, X, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { metrics as initialMetrics } from '../data';
import { Metric } from '../types';

interface EditModalProps {
  metric: Metric;
  onSave: (id: string, updates: Partial<Metric>) => void;
  onClose: () => void;
}

function EditModal({ metric, onSave, onClose }: EditModalProps) {
  const [target, setTarget] = useState(metric.target?.toString() || '');
  const [dir, setDir] = useState(metric.dir || 'gt');
  const [inclusive, setInclusive] = useState(metric.inclusive ?? true);

  const handleSave = () => {
    onSave(metric.id, {
      target: isNaN(parseFloat(target)) ? target : parseFloat(target),
      dir: dir as 'gt' | 'lt',
      inclusive
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-2xl w-full max-w-[560px] overflow-hidden border border-gray-100">
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="text-lg font-medium text-black">编辑</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-10">
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-24 text-sm text-black font-medium shrink-0">指标名称</div>
              <div className="flex-1 px-3 py-2 bg-[#f8f9fb] border border-gray-200 rounded-sm text-sm text-gray-400 cursor-not-allowed">
                {metric.name}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 text-sm text-black font-medium shrink-0">指标编码</div>
              <div className="flex-1 px-3 py-2 bg-[#f8f9fb] border border-gray-200 rounded-sm text-sm text-gray-400 font-mono cursor-not-allowed">
                {metric.code}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 text-sm text-black font-medium shrink-0">关联环节</div>
              <div className="flex-1 px-3 py-2 bg-[#f8f9fb] border border-gray-200 rounded-sm text-sm text-gray-400 cursor-not-allowed">
                {metric.stageName || '通用'}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-24 text-sm text-black font-medium shrink-0">目标配置</div>
              <div className="flex-1 flex items-center gap-3">
                <select 
                  className="w-36 px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  value={`${dir}${inclusive ? 'e' : ''}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'gt') { setDir('gt'); setInclusive(false); }
                    else if (val === 'gte') { setDir('gt'); setInclusive(true); }
                    else if (val === 'lt') { setDir('lt'); setInclusive(false); }
                    else if (val === 'lte') { setDir('lt'); setInclusive(true); }
                  }}
                >
                  <option value="gte">大于等于 (≥)</option>
                  <option value="gt">大于 (&gt;)</option>
                  <option value="lte">小于等于 (≤)</option>
                  <option value="lt">小于 (&lt;)</option>
                </select>
                <div className="relative flex-1">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 pr-10 transition-colors"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="请输入数值"
                  />
                  <span className="absolute right-3 top-2 text-gray-400 text-sm">
                    {metric.unit || '%'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="w-24 pt-2 text-sm text-black font-medium shrink-0">指标定义</div>
              <div className="flex-1 px-3 py-2 bg-[#f8f9fb] border border-gray-200 rounded-sm text-xs text-gray-400 leading-relaxed cursor-not-allowed">
                {metric.definition}
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-white border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-2 text-sm font-medium text-black bg-white border border-gray-300 rounded-sm hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2 text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ConfigMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>(
    initialMetrics.filter(m => m.stage !== undefined)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [jumpPage, setJumpPage] = useState('1');

  const filteredMetrics = metrics.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = !stageFilter || m.stageName === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Reset to first page when filtering
  const [prevFilter, setPrevFilter] = useState({ search: '', stage: '' });
  if (prevFilter.search !== searchTerm || prevFilter.stage !== stageFilter) {
    setCurrentPage(1);
    setPrevFilter({ search: searchTerm, stage: stageFilter });
  }

  const totalItems = filteredMetrics.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedMetrics = filteredMetrics.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stages = Array.from(new Set(metrics.map(m => m.stageName).filter(Boolean))) as string[];

  const handleEdit = (metric: Metric) => {
    setEditingMetric(metric);
  };

  const handleSave = (id: string, updates: Partial<Metric>) => {
    setMetrics(prev => prev.map(m => 
      m.id === id ? { ...m, ...updates } : m
    ));
    setEditingMetric(null);
  };

  const handleReset = () => {
    setSearchTerm('');
  };

  const getOperatorDisplay = (metric: Metric) => {
    if (metric.dir === 'gt') return metric.inclusive ? '≥' : '>';
    if (metric.dir === 'lt') return metric.inclusive ? '≤' : '<';
    return '≥';
  };

  return (
    <div className="min-h-full bg-gray-50/50 p-6">
      <div className="mb-6">
        <h1 className="text-lg font-medium text-gray-900">核心指标配置</h1>
      </div>

      <div className="bg-white rounded-sm border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-black">指标名称</span>
              <input
                type="text"
                placeholder="请输入指标名称"
                className="w-64 px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-black">关联环节</span>
              <select
                className="w-48 px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">全部</option>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-5 py-1.5 bg-[#2563eb] text-white rounded-sm text-sm hover:bg-blue-700 transition-colors">
              查询
            </button>
            <button 
              onClick={() => {
                setSearchTerm('');
                setStageFilter('');
              }}
              className="px-5 py-1.5 bg-white border border-[#2563eb] text-[#2563eb] rounded-sm text-sm hover:bg-blue-50 transition-colors"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#D6E2FF] border-b border-gray-200">
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white">关联环节</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white">指标名称</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white">指标口径</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white">目标值</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white">更新人</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white">更新时间</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center last:border-r-0">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedMetrics.map((metric) => (
              <tr key={metric.id} className="hover:bg-[#f6f9fe]/70 transition-all group">
                <td className="px-4 py-4 text-center text-sm text-black">
                  {metric.stageName || '通用'}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-black text-center">{metric.name}</div>
                  <div className="text-xs text-black mt-1 font-mono text-center">{metric.code}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-xs text-black leading-relaxed max-w-xs mx-auto line-clamp-2" title={metric.definition}>
                    {metric.definition}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="text-sm font-semibold text-black flex items-center justify-center gap-1">
                    <span className="text-black font-normal">{getOperatorDisplay(metric)}</span>
                    {metric.target}{metric.unit || '%'}
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="text-sm text-black">system_admin</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="text-xs text-black text-nowrap font-mono">2026-09-08 14:30:21</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleEdit(metric)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                  >
                    编辑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredMetrics.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            <div className="mb-2 flex justify-center">
              <Search size={32} className="text-gray-200" />
            </div>
            <div className="text-sm">暂无匹配的指标数据</div>
          </div>
        )}
      </div>

      <div className="mt-4 bg-[#f4f5f7] py-2 px-4 flex justify-end items-center text-[13px] text-gray-600 rounded-sm border border-gray-100">
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
              <div className="absolute bottom-full left-0 mb-1 w-full bg-white border border-gray-200 rounded shadow-xl z-[100] py-1">
                {[5, 10, 20, 50].map(val => (
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

      {editingMetric && (
        <EditModal
          metric={editingMetric}
          onSave={handleSave}
          onClose={() => setEditingMetric(null)}
        />
      )}
    </div>
  );
}

