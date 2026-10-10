/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, Plus, X } from 'lucide-react';
import { Channel } from '../types';
import { MOCK_ASSETS } from './Assets';
import { useBadcaseIssues } from '../badcaseStore';
import { metrics } from '../data';
import ValidationDetail, { TaskDetailData } from './ValidationDetail';

interface ValidationProps {
  channel: Channel;
}

export default function Validation({ channel }: ValidationProps) {
  const { issues } = useBadcaseIssues();
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TaskDetailData | null>(null);
  const [taskNameSearch, setTaskNameSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [launchDateStart, setLaunchDateStart] = useState('');
  const [launchDateEnd, setLaunchDateEnd] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    status: '',
    launchDateStart: '',
    launchDateEnd: ''
  });

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [taskList, setTaskList] = useState([
    {
      name: '补卡 / 换卡 Reranker Top1 专项回归',
      object: '模型',
      versions: 'v1.9 → v2.0',
      metrics: ['Reranker Top1 准确率'],
      launchTime: '2026-09-08 16:20',
      baseline: '2026-09-01 至 2026-09-07',
      observation: '2026-09-09 至 2026-09-15',
      status: ['待观察'],
      asset: '混合检索 · 向量检索模型',
      description: '对补卡/换卡业务高频意图进行精细化排序重打分，提升Top1相关性',
      sourceBadcase: 'BC-mutdc6sk (补卡换卡意图误拦截)',
      assignee: 'AI运营人员'
    },
    {
      name: '理财业务大模型语义意图理解调优',
      object: '微调模型',
      versions: 'v2.1 → v2.2',
      metrics: ['意图识别准确率', '语义理解召回率'],
      launchTime: '2026-09-12 10:30',
      baseline: '2026-09-05 至 2026-09-11',
      observation: '2026-09-13 至 2026-09-19',
      status: ['观察中'],
      asset: '意图路由 · 理财助手意图模型',
      description: '针对理财高净值用户多轮对话意图漂移问题微调模型权重',
      sourceBadcase: 'BC-lc8291 (理财意图泛化不足)',
      assignee: '张三 (算法工程师)'
    },
    {
      name: '信用卡分期推荐提示词精炼评测',
      object: '运行提示词',
      versions: 'v1.0 → v1.1',
      metrics: ['推荐点击转化率'],
      launchTime: '2026-08-25 14:00',
      baseline: '2026-08-18 至 2026-08-24',
      observation: '2026-08-26 至 2026-09-01',
      status: ['已结束'],
      asset: 'Query 改写 · 分期推荐提示词',
      description: '精简分期推荐 Prompt 字符数，突出核心费率优惠与还款说明',
      sourceBadcase: 'BC-xyk092 (Prompt输出长度超限)',
      assignee: '李四 (提示词专家)'
    },
    {
      name: '对话链路改写模块意图过滤优化',
      object: '微调模型',
      versions: 'v2.0 → v2.1',
      metrics: ['改写语义一致性'],
      launchTime: '2026-09-15 09:15',
      baseline: '2026-09-08 至 2026-09-14',
      observation: '2026-09-16 至 2026-09-22',
      status: ['待总结'],
      asset: 'Query 改写 · 语义重写模型',
      description: '减少改写过程中的幻觉关键词注入，保障前后会话一致性',
      sourceBadcase: 'BC-dh7721 (改写实体偏移)',
      assignee: '赵六 (评估运营)'
    },
    {
      name: '知识库向量检索 Top5 召回提升方案',
      object: '评估模型',
      versions: 'v1.5 → v1.6',
      metrics: ['Top5 召回率'],
      launchTime: '2026-09-20 18:00',
      baseline: '2026-09-13 至 2026-09-19',
      observation: '2026-09-21 至 2026-09-27',
      status: ['草稿'],
      asset: '混合检索 · 知识库检索索引',
      description: '更新向量索引分块切分窗口，优化长文档问答召回精度',
      sourceBadcase: 'BC-zs0019 (问答知识未召回)',
      assignee: '王五 (产品经理)'
    }
  ]);

  const handleSearch = () => {
    setAppliedFilters({
      name: taskNameSearch,
      status: statusFilter,
      launchDateStart,
      launchDateEnd
    });
    setCurrentPage(1);
  };

  const handleReset = () => {
    setTaskNameSearch('');
    setStatusFilter('');
    setLaunchDateStart('');
    setLaunchDateEnd('');
    setAppliedFilters({
      name: '',
      status: '',
      launchDateStart: '',
      launchDateEnd: ''
    });
    setCurrentPage(1);
  };

  const handleCardClick = (status: string) => {
    const nextStatus = statusFilter === status ? '' : status;
    setStatusFilter(nextStatus);
    setAppliedFilters(prev => ({ ...prev, status: nextStatus }));
    setCurrentPage(1);
  };

  const filteredTasks = taskList.filter(task => {
    const matchesName = !appliedFilters.name.trim() || 
      task.name.toLowerCase().includes(appliedFilters.name.toLowerCase().trim());
    const matchesStatus = !appliedFilters.status || 
      task.status.includes(appliedFilters.status);
    
    const taskDate = task.launchTime.substring(0, 10);
    const afterStart = !appliedFilters.launchDateStart || taskDate >= appliedFilters.launchDateStart;
    const beforeEnd = !appliedFilters.launchDateEnd || taskDate <= appliedFilters.launchDateEnd;
    const matchesLaunchTime = afterStart && beforeEnd;

    return matchesName && matchesStatus && matchesLaunchTime;
  });

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Form states for New Tracking Task modal matching screenshot
  const [taskForm, setTaskForm] = useState({
    name: '',
    assignee: '',
    description: '',
    changeObject: '',
    preVersion: '',
    postVersion: '',
    asset: '',
    actualTime: '',
    sourceBadcase: '',
    primaryMetric: '',
    primaryMetrics: [] as string[],
    channel: '电话客服',
    baselineStart: '',
    baselineEnd: '',
    observationStart: '',
    observationEnd: ''
  });

  if (selectedTaskForDetail) {
    return (
      <ValidationDetail 
        task={selectedTaskForDetail} 
        onBack={() => setSelectedTaskForDetail(null)} 
      />
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50 p-6">
      {/* Header & Title */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900">优化效果跟踪</h1>
        </div>
      </div>

      {/* Summary Stat Cards matching Batches.tsx style with black numbers */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div 
          onClick={() => handleCardClick('草稿')}
          className={`bg-white rounded-lg border p-5 transition-all hover:shadow-xs cursor-pointer ${statusFilter === '草稿' ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-gray-200'}`}
        >
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>草稿</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 font-mono tracking-tight">
              {taskList.filter(t => t.status.includes('草稿')).length}
            </span>
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('待观察')}
          className={`bg-white rounded-lg border p-5 transition-all hover:shadow-xs cursor-pointer ${statusFilter === '待观察' ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-gray-200'}`}
        >
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>待观察</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 font-mono tracking-tight">
              {taskList.filter(t => t.status.includes('待观察')).length}
            </span>
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('观察中')}
          className={`bg-white rounded-lg border p-5 transition-all hover:shadow-xs cursor-pointer ${statusFilter === '观察中' ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-gray-200'}`}
        >
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>观察中</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 font-mono tracking-tight">
              {taskList.filter(t => t.status.includes('观察中')).length}
            </span>
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('待总结')}
          className={`bg-white rounded-lg border p-5 transition-all hover:shadow-xs cursor-pointer ${statusFilter === '待总结' ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-gray-200'}`}
        >
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>待总结</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 font-mono tracking-tight">
              {taskList.filter(t => t.status.includes('待总结')).length}
            </span>
          </div>
        </div>

        <div 
          onClick={() => handleCardClick('已结束')}
          className={`bg-white rounded-lg border p-5 transition-all hover:shadow-xs cursor-pointer ${statusFilter === '已结束' ? 'border-blue-500 ring-2 ring-blue-100 shadow-xs' : 'border-gray-200'}`}
        >
          <div className="text-[13px] text-gray-500 font-medium mb-2 flex items-center justify-between">
            <span>已结束</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[28px] font-bold text-gray-900 font-mono tracking-tight">
              {taskList.filter(t => t.status.includes('已结束')).length}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Toolbar matching Assets.tsx style */}
      <div className="bg-white rounded-sm border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-black whitespace-nowrap">任务名称</span>
              <input 
                type="text" 
                placeholder="请输入任务名称"
                className="w-64 px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                value={taskNameSearch}
                onChange={(e) => setTaskNameSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-black whitespace-nowrap">状态</span>
              <div className="relative">
                <select 
                  className="w-48 px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer appearance-none pr-8"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setAppliedFilters(prev => ({ ...prev, status: e.target.value }));
                    setCurrentPage(1);
                  }}
                >
                  <option value="">全部状态</option>
                  <option value="草稿">草稿</option>
                  <option value="待观察">待观察</option>
                  <option value="观察中">观察中</option>
                  <option value="待总结">待总结</option>
                  <option value="已结束">已结束</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-black whitespace-nowrap">上线时间</span>
              <input 
                type="date" 
                className="w-36 px-2.5 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                value={launchDateStart}
                onChange={(e) => setLaunchDateStart(e.target.value)}
              />
              <span className="text-gray-400 text-sm">至</span>
              <input 
                type="date" 
                className="w-36 px-2.5 py-1.5 border border-gray-300 rounded-sm text-sm focus:outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                value={launchDateEnd}
                onChange={(e) => setLaunchDateEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSearch}
              className="px-5 py-1.5 bg-[#2563eb] text-white rounded-sm text-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              查询
            </button>
            <button 
              onClick={handleReset}
              className="px-5 py-1.5 bg-white border border-[#2563eb] text-[#2563eb] rounded-sm text-sm hover:bg-blue-50 transition-colors cursor-pointer"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Task List Table matching Assets.tsx style with action button above */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-medium text-gray-900">跟踪任务列表</h2>
        <button 
          onClick={() => setIsNewTaskModalOpen(true)}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-sm text-sm hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus size={15} />
          新建跟踪任务
        </button>
      </div>

      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#D6E2FF] border-b border-gray-200">
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white last:border-r-0">任务名称</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white last:border-r-0">优化对象 / 版本</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white last:border-r-0">核心指标</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white last:border-r-0">上线时间</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center border-r border-white last:border-r-0">状态</th>
              <th className="px-4 py-3 text-sm font-semibold text-black text-center last:border-r-0">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedTasks.length > 0 ? (
              paginatedTasks.map((task, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-black text-center">{task.name}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-black">{task.object} · {task.versions}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-sm text-black">{task.metrics.join('、')}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="text-xs text-black text-nowrap font-mono">{task.launchTime}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {task.status.filter(s => s !== '未接入').map((s, i) => (
                        <span key={i} className={`px-2.5 py-0.5 text-xs rounded font-medium ${
                          s === '待观察' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          s === '观察中' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          s === '待总结' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          s === '草稿' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => setSelectedTaskForDetail(task)}
                      className="text-[#2563eb] hover:text-blue-800 text-sm font-medium cursor-pointer"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                  暂无匹配的跟踪任务
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination matching Assets.tsx style */}
      <div className="mt-4 bg-[#f4f5f7] py-2 px-4 flex justify-end items-center text-[13px] text-gray-600 rounded-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="mr-1">共 {filteredTasks.length} 条</span>
          
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
                {[10, 20, 50].map(val => (
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

          <button 
            className={`w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${currentPage > 1 ? 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer' : 'bg-[#e8e8e8] text-gray-300 cursor-not-allowed'}`}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          >
            <ChevronLeft size={14} />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-[28px] h-[28px] rounded font-medium text-[13px] cursor-pointer transition-colors ${currentPage === page ? 'bg-[#2563eb] text-white shadow-2xs' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {page}
            </button>
          ))}

          <button 
            className={`w-[28px] h-[28px] rounded flex items-center justify-center transition-colors ${currentPage < totalPages ? 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer' : 'bg-[#e8e8e8] text-gray-300 cursor-not-allowed'}`}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* New Tracking Task Modal (Full screen overlay matching user screenshot) */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-[100] p-6 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[1320px] max-h-[92vh] flex flex-col overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="px-8 py-5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
              <h2 className="text-lg font-bold text-gray-900">新建跟踪任务</h2>
              <button 
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6 text-xs text-gray-700 bg-gray-50/40">
              {/* Section 1: 优化背景 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900">优化背景</h3>
                  <span className="text-gray-400 text-xs">版本只记录实际变更背景，不推断生产执行版本。</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">任务名称</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white"
                      placeholder=""
                      value={taskForm.name}
                      onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">负责人</label>
                    <div className="relative">
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer pr-8"
                        value={taskForm.assignee}
                        onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                      >
                        <option value="">请选择负责人</option>
                        <option value="AI运营人员">AI运营人员</option>
                        <option value="张三 (算法工程师)">张三 (算法工程师)</option>
                        <option value="李四 (提示词专家)">李四 (提示词专家)</option>
                        <option value="王五 (产品经理)">王五 (产品经理)</option>
                        <option value="赵六 (评估运营)">赵六 (评估运营)</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-medium text-gray-700">优化说明</label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white resize-y"
                    placeholder="改了什么，期望改善什么"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">变更对象</label>
                    <div className="relative">
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer pr-8"
                        value={taskForm.changeObject}
                        onChange={(e) => setTaskForm({ ...taskForm, changeObject: e.target.value })}
                      >
                        <option value="">请选择变更对象</option>
                        <option value="模型">模型</option>
                        <option value="提示词">提示词</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">关联资产 (可选)</label>
                    <div className="relative">
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer pr-8"
                        value={taskForm.asset}
                        onChange={(e) => {
                          const assetVal = e.target.value;
                          const foundAsset = MOCK_ASSETS.find(a => `${a.stageName} · ${a.name}` === assetVal);
                          setTaskForm(prev => ({
                            ...prev,
                            asset: assetVal,
                            changeObject: prev.changeObject || (foundAsset?.type.includes('模型') ? '模型' : '提示词'),
                            preVersion: '',
                            postVersion: ''
                          }));
                        }}
                      >
                        <option value="">请选择关联资产</option>
                        {MOCK_ASSETS.map(a => (
                          <option key={a.id} value={`${a.stageName} · ${a.name}`}>
                            {a.stageName} · {a.name} ({a.type})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">调整前版本</label>
                    <div className="relative">
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer pr-8"
                        value={taskForm.preVersion}
                        onChange={(e) => setTaskForm({ ...taskForm, preVersion: e.target.value })}
                      >
                        <option value="">请选择调整前版本</option>
                        {((MOCK_ASSETS.find(a => `${a.stageName} · ${a.name}` === taskForm.asset)?.versionHistory) || [
                          { version: '3', description: '主干版本更新' },
                          { version: '2', description: '规则逻辑调优' },
                          { version: '1', description: '基础初始规则' }
                        ]).map(v => (
                          <option key={v.version} value={v.version}>
                            v{v.version} {v.description ? `- ${v.description}` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">调整后版本</label>
                    <div className="relative">
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer pr-8"
                        value={taskForm.postVersion}
                        onChange={(e) => setTaskForm({ ...taskForm, postVersion: e.target.value })}
                      >
                        <option value="">请选择调整后版本</option>
                        {((MOCK_ASSETS.find(a => `${a.stageName} · ${a.name}` === taskForm.asset)?.versionHistory) || [
                          { version: '3', description: '主干版本更新' },
                          { version: '2', description: '规则逻辑调优' },
                          { version: '1', description: '基础初始规则' }
                        ]).map(v => (
                          <option key={v.version} value={v.version}>
                            v{v.version} {v.description ? `- ${v.description}` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">实际上线时间 (北京时间)</label>
                    <input 
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white text-gray-700"
                      value={taskForm.actualTime}
                      onChange={(e) => setTaskForm({ ...taskForm, actualTime: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: 跟踪对象与指标 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900">跟踪对象与指标</h3>
                  <span className="text-gray-400 text-xs">Badcase 仅用于追溯；指标来自正式指标目录，可独立选择。</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left Card: 来源 Badcase */}
                  <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/60 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-800">来源 Badcase (可选)</span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold text-[11px]">
                        {taskForm.sourceBadcase ? '1' : '0'}
                      </span>
                    </div>
                    <div className="relative">
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer pr-8 font-medium text-gray-800"
                        value={taskForm.sourceBadcase}
                        onChange={(e) => {
                          const badcaseVal = e.target.value;
                          const foundIssue = issues.find(i => `${i.id} (${i.title})` === badcaseVal);
                          const targetMetric = foundIssue?.metricName;
                          setTaskForm(prev => ({
                            ...prev,
                            sourceBadcase: badcaseVal,
                            primaryMetrics: targetMetric && !prev.primaryMetrics.includes(targetMetric)
                              ? [...prev.primaryMetrics, targetMetric]
                              : prev.primaryMetrics
                          }));
                        }}
                      >
                        <option value="">请选择来源 Badcase</option>
                        {issues.map(issue => (
                          <option key={issue.id} value={`${issue.id} (${issue.title})`}>
                            {issue.id} ({issue.title})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Right Card: 主关注指标 */}
                  <div className="border border-emerald-300 rounded-lg p-5 bg-emerald-50/20 space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                      <span className="font-semibold text-gray-800">主关注指标</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        {taskForm.primaryMetrics.length}
                      </span>
                    </div>
                    <div className="relative">
                      <select 
                        className="w-full px-3 py-2 border border-emerald-200 rounded text-xs outline-none focus:border-emerald-500 bg-white appearance-none cursor-pointer pr-8 font-medium text-gray-800"
                        value=""
                        onChange={(e) => {
                          if (e.target.value && !taskForm.primaryMetrics.includes(e.target.value)) {
                            setTaskForm({ ...taskForm, primaryMetrics: [...taskForm.primaryMetrics, e.target.value] });
                          }
                        }}
                      >
                        <option value="">请选择关注指标 (支持多选)</option>
                        {[
                          '误拦截率',
                          '漏拦截率',
                          '模型与 Judge 操作集合一致率',
                          'Query 代理准确率',
                          'Top5 召回率',
                          'Reranker Top1 准确率',
                          '意图识别准确率',
                          '语义理解召回率',
                          '全过程平均耗时',
                          '推荐点击转化率',
                          '改写语义一致性',
                          '拒答准确率',
                          ...metrics.map(m => m.name)
                        ].filter((v, i, a) => a.indexOf(v) === i).map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                    
                    {/* Selected Metrics Tags */}
                    <div className="flex flex-wrap gap-2 pt-2 min-h-[30px]">
                      {taskForm.primaryMetrics.map(metric => (
                        <span key={metric} className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-[11px] flex items-center gap-1 font-medium">
                          {metric}
                          <X size={12} className="cursor-pointer hover:text-emerald-900" onClick={() => setTaskForm({ ...taskForm, primaryMetrics: taskForm.primaryMetrics.filter(m => m !== metric) })} />
                        </span>
                      ))}
                      {taskForm.primaryMetrics.length === 0 && (
                        <span className="text-gray-400 text-[11px] pt-1">请从上方下拉框选择至少一个主关注指标</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: 前后观察范围与可比性 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900">前后观察范围与可比性</h3>
                  <span className="text-gray-400 text-xs">两期使用同一业务范围的全部可评样本；上线当天不计入比较。</span>
                </div>

                <div>
                  <button type="button" className="px-3 py-1.5 border border-gray-300 rounded bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer shadow-2xs">
                    按上线时间建议前后各7天
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">业务渠道</label>
                    <div className="relative">
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white appearance-none cursor-pointer pr-8"
                        value={taskForm.channel}
                        onChange={(e) => setTaskForm({ ...taskForm, channel: e.target.value })}
                      >
                        <option value="电话客服">电话客服</option>
                        <option value="在线客服">在线客服</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">基准期开始</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white text-gray-700"
                      value={taskForm.baselineStart}
                      onChange={(e) => setTaskForm({ ...taskForm, baselineStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">基准期结束</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white text-gray-700"
                      value={taskForm.baselineEnd}
                      onChange={(e) => setTaskForm({ ...taskForm, baselineEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">观察期开始</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white text-gray-700"
                      value={taskForm.observationStart}
                      onChange={(e) => setTaskForm({ ...taskForm, observationStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block font-medium text-gray-700">观察期结束</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 bg-white text-gray-700"
                      value={taskForm.observationEnd}
                      onChange={(e) => setTaskForm({ ...taskForm, observationEnd: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 bg-white border-t border-gray-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="px-5 py-2 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (taskForm.name.trim()) {
                    const chosenMetrics = taskForm.primaryMetrics.length > 0 
                      ? taskForm.primaryMetrics 
                      : (taskForm.primaryMetric ? [taskForm.primaryMetric] : ['误拦截率']);
                    setTaskList(prev => [
                      {
                        name: taskForm.name,
                        object: taskForm.changeObject || (taskForm.asset?.includes('模型') ? '模型' : '提示词'),
                        versions: taskForm.preVersion && taskForm.postVersion ? `${taskForm.preVersion} → ${taskForm.postVersion}` : (taskForm.preVersion || 'v1.0'),
                        metrics: chosenMetrics,
                        launchTime: taskForm.actualTime ? taskForm.actualTime.replace('T', ' ') : '待定',
                        baseline: taskForm.baselineStart && taskForm.baselineEnd ? `${taskForm.baselineStart} 至 ${taskForm.baselineEnd}` : '2026-10-04 至 2026-10-04',
                        observation: taskForm.observationStart && taskForm.observationEnd ? `${taskForm.observationStart} 至 ${taskForm.observationEnd}` : '2026-10-30 至 2026-10-30',
                        status: ['草稿'],
                        asset: taskForm.asset || '未关联',
                        description: taskForm.description || '',
                        sourceBadcase: taskForm.sourceBadcase || '',
                        assignee: taskForm.assignee || 'AI运营人员',
                        channel: taskForm.channel || '电话客服'
                      },
                      ...prev
                    ]);
                  }
                  setIsNewTaskModalOpen(false);
                }}
                className="px-5 py-2 border border-gray-300 rounded text-xs text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              >
                保存草稿
              </button>
              <button
                type="button"
                onClick={() => {
                  if (taskForm.actualTime && taskForm.baselineStart && taskForm.baselineEnd) {
                    const launchDate = new Date(taskForm.actualTime);
                    const baselineStartDate = new Date(taskForm.baselineStart);
                    const baselineEndDate = new Date(taskForm.baselineEnd);
                    
                    if (baselineStartDate >= launchDate || baselineEndDate >= launchDate) {
                      alert('基准期开始和结束的时间必须早于上线时间');
                      return;
                    }
                  }
                  if (taskForm.name.trim()) {
                    const chosenMetrics = taskForm.primaryMetrics.length > 0 
                      ? taskForm.primaryMetrics 
                      : (taskForm.primaryMetric ? [taskForm.primaryMetric] : ['误拦截率']);
                    setTaskList(prev => [
                      {
                        name: taskForm.name,
                        object: taskForm.changeObject || (taskForm.asset?.includes('模型') ? '模型' : '提示词'),
                        versions: taskForm.preVersion && taskForm.postVersion ? `${taskForm.preVersion} → ${taskForm.postVersion}` : (taskForm.preVersion || 'v1.0'),
                        metrics: chosenMetrics,
                        launchTime: taskForm.actualTime ? taskForm.actualTime.replace('T', ' ') : new Date().toISOString().replace('T', ' ').substring(0, 16),
                        baseline: taskForm.baselineStart && taskForm.baselineEnd ? `${taskForm.baselineStart} 至 ${taskForm.baselineEnd}` : '2026-10-04 至 2026-10-04',
                        observation: taskForm.observationStart && taskForm.observationEnd ? `${taskForm.observationStart} 至 ${taskForm.observationEnd}` : '2026-10-30 至 2026-10-30',
                        status: ['待观察'],
                        asset: taskForm.asset || '未关联',
                        description: taskForm.description || '',
                        sourceBadcase: taskForm.sourceBadcase || '',
                        assignee: taskForm.assignee || 'AI运营人员',
                        channel: taskForm.channel || '电话客服'
                      },
                      ...prev
                    ]);
                  }
                  setIsNewTaskModalOpen(false);
                }}
                className="px-5 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors cursor-pointer"
              >
                保存并开始跟踪
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
