'use client';

import { useState, useRef } from 'react';
import { Send, Trash2, Save, Copy, ChevronDown, Zap, BarChart2, GitCompare, BookOpen, X } from 'lucide-react';
import { mockPromptTemplates } from '@/lib/mock-data';

const MODELS = [
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'gemini-2-flash', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'llama-3-1-70b', name: 'Llama 3.1 70B', provider: 'Meta' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  latency?: number;
  model?: string;
}

function ChatMessage({ msg, compareMode }: { msg: Message; compareMode?: boolean }) {
  return (
    <div className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      {msg.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-indigo-400" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
        {msg.role === 'assistant' && (msg.tokens || msg.latency) && (
          <div className="flex gap-3 mt-2 pt-2 border-t border-slate-700/50">
            {msg.tokens && <span className="text-xs text-slate-400">{msg.tokens} tokens</span>}
            {msg.latency && <span className="text-xs text-slate-400">{msg.latency}ms latency</span>}
            {msg.model && <span className="text-xs text-indigo-400">{msg.model}</span>}
          </div>
        )}
      </div>
      {msg.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs text-slate-300">U</div>
      )}
    </div>
  );
}

export default function PlaygroundPage() {
  const [model, setModel] = useState(MODELS[0]);
  const [model2, setModel2] = useState(MODELS[1]);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messages2, setMessages2] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    if (compareMode) setMessages2((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simulate response
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
    const tokens = Math.floor(Math.random() * 300) + 100;
    const latency = Math.floor(Math.random() * 1500) + 500;
    const assistantMsg: Message = {
      role: 'assistant',
      content: `This is a simulated response from ${model.name}. In a real implementation, this would call the ${model.provider} API with temperature ${temperature} and max tokens ${maxTokens}.\n\nSystem prompt: "${systemPrompt}"`,
      tokens,
      latency,
      model: model.name,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setTotalTokens((prev) => prev + tokens);

    if (compareMode) {
      await new Promise((r) => setTimeout(r, 300));
      const tokens2 = Math.floor(Math.random() * 300) + 100;
      const latency2 = Math.floor(Math.random() * 1500) + 500;
      setMessages2((prev) => [...prev, {
        role: 'assistant',
        content: `Simulated response from ${model2.name} for comparison. Temperature: ${temperature}, Max tokens: ${maxTokens}.`,
        tokens: tokens2,
        latency: latency2,
        model: model2.name,
      }]);
      setTotalTokens((prev) => prev + tokens2);
    }
    setLoading(false);
  };

  const handleClear = () => { setMessages([]); setMessages2([]); setTotalTokens(0); };

  return (
    <div className="h-screen flex bg-slate-950 text-white overflow-hidden">
      {/* Left config panel */}
      <div className="w-72 border-r border-slate-800 flex flex-col bg-slate-900 overflow-y-auto">
        <div className="p-4 border-b border-slate-800">
          <h1 className="font-bold text-white">Playground</h1>
          <p className="text-xs text-slate-400 mt-0.5">Test & iterate prompts</p>
        </div>

        <div className="p-4 space-y-4 flex-1">
          {/* Model selector */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Model</label>
            <div className="relative">
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500"
                value={model.id}
                onChange={(e) => setModel(MODELS.find(m => m.id === e.target.value) || MODELS[0])}
              >
                {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            <span className="text-xs text-slate-500 mt-1 block">{model.provider}</span>
          </div>

          {/* Compare mode model 2 */}
          {compareMode && (
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Compare Model</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-cyan-500"
                  value={model2.id}
                  onChange={(e) => setModel2(MODELS.find(m => m.id === e.target.value) || MODELS[1])}
                >
                  {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Temperature */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 flex justify-between">
              <span>Temperature</span>
              <span className="text-white">{temperature}</span>
            </label>
            <input
              type="range" min={0} max={2} step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-0.5">
              <span>Precise</span><span>Creative</span>
            </div>
          </div>

          {/* Max tokens */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 flex justify-between">
              <span>Max Tokens</span>
              <span className="text-white">{maxTokens}</span>
            </label>
            <input
              type="range" min={256} max={8192} step={256}
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* System prompt */}
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">System Prompt</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              rows={4}
              placeholder="You are a helpful assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
            />
          </div>

          {/* Token counter */}
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs text-slate-400">Session tokens</div>
              <div className="text-sm font-medium text-white">{totalTokens.toLocaleString()}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${compareMode ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'}`}
            >
              <GitCompare className="w-4 h-4" /> Compare mode {compareMode ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Template library
            </button>
            <button
              onClick={handleClear}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear conversation
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors">
              <Save className="w-4 h-4" /> Save as template
            </button>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex ${compareMode ? 'divide-x divide-slate-800' : ''}`}>
        {/* Main chat */}
        <div className="flex-1 flex flex-col">
          {compareMode && (
            <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-xs font-medium text-indigo-400">
              {model.name}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Start a conversation</h3>
                <p className="text-slate-400 text-sm max-w-sm">Type a message below or select a template from the library</p>
              </div>
            )}
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="bg-slate-800 rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-800">
            <div className="flex gap-3">
              <textarea
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
                rows={2}
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>

        {/* Compare panel */}
        {compareMode && (
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-xs font-medium text-cyan-400">
              {model2.name}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages2.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-slate-500 text-sm">Send a message to compare responses</p>
                </div>
              )}
              {messages2.map((msg, i) => <ChatMessage key={i} msg={msg} compareMode />)}
            </div>
          </div>
        )}
      </div>

      {/* Template library sidebar */}
      {showTemplates && (
        <div className="w-72 border-l border-slate-800 bg-slate-900 overflow-y-auto">
          <div className="sticky top-0 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Templates</h2>
            <button onClick={() => setShowTemplates(false)} className="p-1 hover:bg-slate-800 rounded">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="p-3 space-y-2">
            {mockPromptTemplates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => { setSystemPrompt(tmpl.systemPrompt); setInput(tmpl.userPrompt); setShowTemplates(false); }}
                className="w-full text-left bg-slate-800 hover:bg-slate-700 rounded-lg p-3 transition-colors"
              >
                <div className="text-sm font-medium text-white mb-1">{tmpl.name}</div>
                <div className="text-xs text-slate-400 line-clamp-2">{tmpl.description}</div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {tmpl.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
