'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

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

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api('/auth/signup', { method: 'POST', body: form });
      
      // Store user in localStorage (for client-side access)
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Store user in cookie (for middleware)
      document.cookie = `user=${JSON.stringify(data.user)}; path=/; max-age=86400`; // 1 day
      
      toast.success('Account created! Welcome to IntelliAsset.');
      
      // Employees go to their dashboard
      router.push('/employee');
    } catch (e) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">IntelliAsset</span>
        </div>
        <Card className="glass p-8">
          <h2 className="text-2xl font-bold mb-1">Get started</h2>
          <p className="text-sm text-muted-foreground mb-6">Create your account (Employee role)</p>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input 
              placeholder="Full name" 
              value={form.name} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
              required 
            />
            <Input 
              type="email" 
              placeholder="Email" 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })} 
              required 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })} 
              required 
            />
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
            >
              {loading ? 'Please wait...' : 'Create account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Have an account? <Link href="/login" className="text-purple-400 hover:underline">Sign in</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}