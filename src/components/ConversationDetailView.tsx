import { useState } from 'react';
import { ArrowLeft, User, Headset } from 'lucide-react';

export default function ConversationDetailView({ conversationId, onBack }: { conversationId: string, onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('意图识别');
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);

  const messages = [
    { 
      sender: '客户', 
      content: '啊。', 
      time: '2026-07-30 10:12:22', 
      isAgent: false,
      analysis: {
        filter: { model: '拦截', evaluation: '拦截' },
        rewriting: null,
        retrieval: null,
        routing: null
      }
    },
    { sender: '坐席', content: '啊。', time: '2026-07-30 10:12:22', isAgent: true },
    { 
      sender: '客户', 
      content: '公司这边的话也是。', 
      time: '2026-07-30 10:12:32', 
      isAgent: false,
      analysis: {
        filter: { model: '放行', evaluation: '放行' },
        rewriting: { type: '指代消解', evalType: '指代消解', result: '我想咨询公司业务。' },
        retrieval: { top1: '公司咨询', evaluation: '网点查询' },
        routing: { model: '业务咨询', evaluation: '业务咨询' }
      }
    },
    { 
      sender: '客户', 
      content: '你的信用卡丢失了，我的信用卡也丢了。', 
      time: '2026-07-30 10:12:35', 
      isAgent: false,
      analysis: {
        filter: { model: '放行', evaluation: '放行' },
        rewriting: { type: '语义补全', evalType: '语义补全', result: '我的信用卡丢失了，我想办理挂失。' },
        retrieval: { top1: '信用卡挂失', evaluation: '信用卡挂失' },
        routing: { model: '信用卡挂失', evaluation: '信用卡挂失' }
      }
    },
    { 
      sender: '客户', 
      content: '行。', 
      time: '2026-07-30 10:12:38', 
      isAgent: false,
      analysis: {
        filter: { model: '拦截', evaluation: '拦截' },
        rewriting: null,
        retrieval: null,
        routing: null
      }
    },
    { 
      sender: '客户', 
      content: '这这这也挂失了吗？', 
      time: '2026-07-30 10:12:42', 
      isAgent: false,
      analysis: {
        filter: { model: '放行', evaluation: '放行' },
        rewriting: { type: '多轮改写', evalType: '多轮改写', result: '确认是否已经挂失。' },
        retrieval: { top1: '挂失确认', evaluation: '挂失确认' },
        routing: { model: '挂失查询', evaluation: '挂失查询' }
      }
    },
    { sender: '坐席', content: '去公司这边的词语也是你的信用卡...', time: '2026-07-30 10:12:44', isAgent: true },
  ];

  const selectedMessage = messages[selectedMessageIndex];
  const analysis = selectedMessage.analysis;

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors cursor-pointer text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-[15px] font-bold text-gray-900 leading-tight">会话详情</h2>
            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">会话ID: {conversationId}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat History */}
        <div className="w-[380px] border-r-[2px] border-gray-200 flex flex-col bg-white">
          <div className="px-6 py-4 font-bold text-[14px] text-gray-900 border-b border-gray-50">会话记录</div>
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={`text-[10px] text-gray-300 ${m.isAgent ? 'text-right' : 'text-left'}`}>{m.time}</div>
                <div className={`flex items-start gap-3 ${m.isAgent ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${m.isAgent ? 'bg-[#2563eb] border-[#2563eb] text-white shadow-sm' : (selectedMessageIndex === i ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110' : 'bg-white border-blue-500/20 text-blue-600 shadow-sm')}`}>
                    {m.isAgent ? <Headset size={18} /> : <User size={18} />}
                  </div>
                  <div 
                    onClick={() => !m.isAgent && setSelectedMessageIndex(i)}
                    className={`relative max-w-[240px] px-4 py-2.5 rounded-xl text-[13px] leading-relaxed shadow-sm border transition-all ${m.isAgent ? 'bg-[#eef2ff] text-gray-800 border-blue-100 rounded-tr-none' : (selectedMessageIndex === i ? 'bg-blue-50 text-blue-800 border-blue-200 rounded-tl-none ring-2 ring-blue-100' : 'bg-white text-gray-700 border-gray-100 rounded-tl-none hover:border-blue-200 hover:bg-gray-50 cursor-pointer')}`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Link / Analysis */}
        <div className="flex-1 flex flex-col bg-[#f8fafc]">
          {/* Tabs */}
          <div className="px-8 flex gap-10 bg-white border-b border-gray-200">
            {['意图识别'].map(tab => (
              <button 
                key={tab}
                className={`py-4 text-[14px] font-bold transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-t-full"></div>}
              </button>
            ))}
          </div>

          {/* Analysis Content Area */}
          <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-white">
            {/* Selected Sentence Box */}
            <div className="bg-[#f0f7ff] border border-blue-100 rounded-xl p-6 flex items-start gap-5 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg border-2 border-white">
                <User size={20} />
              </div>
              <div className="space-y-1">
                <div className="text-[12px] text-gray-500 font-medium tracking-tight">当前选中的客户语句：</div>
                <div className="text-[15px] font-bold text-black">{selectedMessage.content}</div>
              </div>
            </div>

            {analysis && (
              <div className="space-y-12">
                {/* Step 1: 前置过滤 */}
                <div className="flex gap-8 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#1890ff] flex items-center justify-center text-white font-bold text-[16px] z-10 shadow-md ring-4 ring-white group-hover:scale-110 transition-transform">1</div>
                    <div className="w-[1.5px] flex-1 bg-gray-100 mt-2"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="font-bold text-[18px] text-black mb-8 flex items-center gap-2">
                      <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                      前置过滤
                    </h4>
                    <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-4">
                        <div className="text-[14px] text-gray-400 font-medium">模型结果</div>
                        <div className="inline-flex items-center px-6 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[15px] font-bold text-black shadow-sm">
                          {analysis.filter.model}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-[14px] text-gray-400 font-medium">评估模型结果</div>
                        <div className="inline-flex items-center px-6 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[15px] font-bold text-black shadow-sm">
                          {analysis.filter.evaluation}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Query改写 */}
                <div className="flex gap-8 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#1890ff] flex items-center justify-center text-white font-bold text-[16px] z-10 shadow-md ring-4 ring-white group-hover:scale-110 transition-transform">2</div>
                    <div className="w-[1.5px] flex-1 bg-gray-100 mt-2"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="font-bold text-[18px] text-black mb-8 flex items-center gap-2">
                      <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                      Query改写
                    </h4>
                    {analysis.rewriting ? (
                      <div className="grid grid-cols-3 gap-12">
                        <div className="space-y-4">
                          <div className="text-[14px] text-gray-400 font-medium">模型改写类型</div>
                          <div className="bg-gray-50 p-5 rounded-xl text-[14px] text-black border border-gray-100 font-bold shadow-sm">{analysis.rewriting.type}</div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-[14px] text-gray-400 font-medium">评估模型改写类型</div>
                          <div className="bg-gray-50 p-5 rounded-xl text-[14px] text-black border border-gray-100 font-bold shadow-sm">{analysis.rewriting.evalType}</div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-[14px] text-gray-400 font-medium">改写结果</div>
                          <div className="bg-gray-50 p-5 rounded-xl text-[14px] text-black border border-gray-100 font-bold shadow-sm leading-relaxed">{analysis.rewriting.result}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-[14px] italic">无需改写</div>
                    )}
                  </div>
                </div>

                {/* Step 3: 混合检索 */}
                <div className="flex gap-8 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#1890ff] flex items-center justify-center text-white font-bold text-[16px] z-10 shadow-md ring-4 ring-white group-hover:scale-110 transition-transform">3</div>
                    <div className="w-[1.5px] flex-1 bg-gray-100 mt-2"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="font-bold text-[18px] text-black mb-8 flex items-center gap-2">
                      <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                      混合检索
                    </h4>
                    {analysis.retrieval ? (
                      <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <div className="text-[14px] text-gray-400 font-medium">Reranker Top1意图</div>
                          <div className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[15px] text-black font-bold shadow-sm">
                            {analysis.retrieval.top1}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-[14px] text-gray-400 font-medium">评估模型识别意图</div>
                          <div className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[15px] text-black font-bold shadow-sm">
                            {analysis.retrieval.evaluation}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-[14px] italic">未触发检索</div>
                    )}
                  </div>
                </div>

                {/* Step 4: 意图路由 */}
                <div className="flex gap-8 group">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#1890ff] flex items-center justify-center text-white font-bold text-[16px] z-10 shadow-md ring-4 ring-white group-hover:scale-110 transition-transform">4</div>
                    <div className="w-[1.5px] h-10 bg-gray-50 mt-2 rounded-full"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all">
                    <h4 className="font-bold text-[18px] text-black mb-8 flex items-center gap-2">
                      <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                      意图路由
                    </h4>
                    {analysis.routing ? (
                      <div className="grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <div className="text-[14px] text-gray-400 font-medium">模型识别意图</div>
                          <div className="inline-flex items-center px-6 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[15px] text-black font-bold shadow-sm">
                            {analysis.routing.model}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-[14px] text-gray-400 font-medium">评估模型识别意图</div>
                          <div className="inline-flex items-center px-6 py-3 bg-gray-50 border border-gray-100 rounded-lg text-[15px] text-black font-bold shadow-sm">
                            {analysis.routing.evaluation}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-[14px] italic">未路由</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
