import { ArrowLeft, X } from 'lucide-react';

export default function ConversationDetail({ conversationId, onBack }: { conversationId: string, onBack: () => void }) {
  const messages = [
    { sender: '客户', content: '我的信用卡丢失了，我的信用卡也丢了。', time: '10:12:22' },
    { sender: '坐席', content: '什么？', time: '10:12:25' },
    { sender: '坐席', content: '您是说您两张卡都丢了吗？', time: '10:12:28' },
    { sender: '客户', content: '嗯，是的。', time: '10:12:30' },
    { sender: '坐席', content: '公司这边的话也是。', time: '10:12:32' },
    { sender: '客户', content: '行。', time: '10:12:38' },
    { sender: '客户', content: '这这这也是挂失了吗？', time: '10:12:42' },
  ];

  const steps = [
    { id: 1, title: '前置过滤', result: '通过' },
    { id: 2, title: 'Query改写', origin: '我的信用卡丢失了，我的信用卡也丢了。', result: '我的信用卡丢失了，我想办理挂失业务。' },
    { id: 3, title: '混合检索', intents: ['信用卡挂失', '账户查询'] },
    { id: 4, title: '意图路由', intent: '信用卡挂失' }
  ];

  return (
    <div className="min-h-full bg-gray-50/50 p-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <button onClick={onBack} className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1">
          <ArrowLeft size={16} /> 返回列表
        </button>
        <div className="h-6 w-px bg-gray-200" />
        <div>
          <h3 className="text-[16px] font-bold text-gray-900">会话详情</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">会话ID: {conversationId}</p>
        </div>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-140px)]">
        {/* Left: Chat History */}
        <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30 overflow-hidden">
          <div className="p-4 border-b border-gray-100 font-bold text-[14px]">会话记录</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.sender === '客户' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold ${m.sender === '客户' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                  {m.sender[0]}
                </div>
                <div className={`max-w-[80%] p-3 rounded-2xl text-[14px] ${m.sender === '客户' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
                  {m.content}
                  <div className={`text-[10px] mt-1 ${m.sender === '客户' ? 'text-blue-200' : 'text-gray-400'}`}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Analysis Steps */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-gray-100 px-6">
            {['意图识别', '情绪识别', '知识推荐'].map((tab, i) => (
              <button 
                key={tab}
                className={`py-4 px-4 text-[14px] font-medium border-b-2 ${i === 0 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/20">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="text-[12px] text-gray-400 mb-1">当前选中的客户语句：</div>
              <div className="text-[14px] font-medium">我的信用卡丢失了，我的信用卡也丢了。</div>
            </div>
            
            {steps.map((step, i) => (
              <div key={step.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[14px] shrink-0">{step.id}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-[14px] mb-4">{step.title}</h4>
                  {step.result && !step.origin && <div className="text-[12px] text-gray-400">处理结果<div className="bg-gray-50 px-3 py-1.5 rounded mt-1 w-fit">{step.result}</div></div>}
                  {step.origin && (
                    <div className="grid grid-cols-2 gap-8 text-[12px]">
                      <div><div className="text-gray-400 mb-1">原内容</div><div className="bg-gray-50 p-3 rounded">{step.origin}</div></div>
                      <div><div className="text-gray-400 mb-1">改写结果</div><div className="bg-gray-50 p-3 rounded">{step.result}</div></div>
                    </div>
                  )}
                  {step.intents && (
                    <div>
                      <div className="text-gray-400 mb-1 text-[12px]">匹配到的意图</div>
                      <div className="flex gap-2">
                        {step.intents.map(int => <div key={int} className="bg-gray-50 px-3 py-1.5 rounded">{int}</div>)}
                      </div>
                    </div>
                  )}
                  {step.intent && (
                    <div>
                      <div className="text-gray-400 mb-1 text-[12px]">识别出的意图</div>
                      <div className="bg-gray-50 px-3 py-1.5 rounded w-fit">{step.intent}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
