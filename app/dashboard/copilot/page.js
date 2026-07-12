'use client';
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Bot, Send, User as UserIcon, Sparkles, Clock, AlertTriangle, Package, ArrowUpRight } from 'lucide-react';

const api = async (path, opts = {}) => {
  const res = await fetch(`/api${path}`, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export default function CopilotPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (user) {
      setMessages([{
        role: 'assistant',
        content: `Hi ${user.name?.split(' ')[0]}! I'm your AI Asset Copilot. Ask me anything about your fleet — I can find idle assets, spot overdue returns, explain risk, and recommend actions.`
      }]);
    }
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = text || input;
    if (!q.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api('/copilot', {
        method: 'POST',
        body: { query: q }
      });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.answer,
        cards: res.cards || [],
        intent: res.intent
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${e.message}`
      }]);
    }
    setLoading(false);
  };

  const renderMd = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <div key={i}>
          {parts.map((p, j) =>
            p.startsWith('**') ? (
              <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{p}</span>
            )
          )}
        </div>
      );
    });
  };

  const suggestions = [
    'Show all high-risk assets',
    'What returns are overdue?',
    'Find idle assets',
    'Recommend next actions',
    'Why is Ford Transit Van high risk?',
    'Show maintenance history for MacBook Pro',
    'Who has the Tesla Model 3?',
    'How many assets total?'
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            AI Asset Copilot
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Beta</Badge>
          </h2>
          <p className="text-xs text-muted-foreground">Natural language interface to your asset intelligence</p>
        </div>
      </div>

      <Card className="glass flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-blue-500/20' : 'bg-gradient-to-br from-purple-500 to-blue-500'}`}>
                {m.role === 'user' ? <UserIcon className="w-4 h-4 text-blue-300" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`flex-1 max-w-2xl ${m.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block text-left rounded-xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/20 shadow-lg shadow-purple-500/5' : 'bg-white/5 border border-white/10'}`}>
                  {renderMd(m.content)}
                </div>
                {m.cards && m.cards.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {m.cards.slice(0, 5).map((c, idx) => {
                      if (c.type === 'asset') {
                        const a = c.asset;
                        const health = a.prediction?.health || 0;
                        const color = health >= 75 ? '#10b981' : health >= 55 ? '#f59e0b' : health >= 35 ? '#f97316' : '#ef4444';
                        return (
                          <div key={idx} className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">{a.categoryIcon || '📦'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">{a.name}</div>
                              <div className="text-xs text-muted-foreground">{a.code} • {a.status}</div>
                            </div>
                            <Badge className={`${a.prediction?.risk === 'Low' ? 'bg-emerald-500/20 text-emerald-300' : a.prediction?.risk === 'Medium' ? 'bg-amber-500/20 text-amber-300' : a.prediction?.risk === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'} border-0`}>
                              {a.prediction?.risk || 'N/A'}
                            </Badge>
                            <div className="relative flex items-center justify-center" style={{ width: 36, height: 36 }}>
                              <svg width={36} height={36} className="-rotate-90">
                                <circle cx={18} cy={18} r={14} stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
                                <circle cx={18} cy={18} r={14} stroke={color} strokeWidth="3" fill="none" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * (1 - health / 100)} strokeLinecap="round" />
                              </svg>
                              <div className="absolute text-[9px] font-bold" style={{ color }}>{health}</div>
                            </div>
                          </div>
                        );
                      }
                      if (c.type === 'overdue') {
                        return (
                          <div key={idx} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-red-400" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">{c.asset?.name}</div>
                              <div className="text-xs text-muted-foreground">Held by {c.user?.name} • {c.days} days overdue</div>
                            </div>
                            <Badge className="bg-red-500/20 text-red-300 border-0">Overdue</Badge>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-4 py-3 rounded-xl border border-white/10">
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="px-6 pb-3">
            <p className="text-xs text-muted-foreground mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="border-t border-border/50 p-4 flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about assets, risks, allocations..."
            className="flex-1 bg-black/20 border-white/10"
          />
          <Button type="submit" disabled={loading || !input.trim()} className="bg-gradient-to-r from-purple-500 to-blue-500">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}