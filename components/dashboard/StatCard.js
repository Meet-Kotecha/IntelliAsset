'use client';
import { motion } from 'framer-motion';
import { 
  Boxes, DollarSign, ShieldCheck, AlertTriangle, Package, Users, 
  Clock, Calendar, CheckCircle, TrendingUp, Wrench, ArrowRightLeft 
} from 'lucide-react';

const iconMap = {
  'Boxes': Boxes,
  'DollarSign': DollarSign,
  'ShieldCheck': ShieldCheck,
  'AlertTriangle': AlertTriangle,
  'Package': Package,
  'Users': Users,
  'Clock': Clock,
  'Calendar': Calendar,
  'CheckCircle': CheckCircle,
  'TrendingUp': TrendingUp,
  'Wrench': Wrench,
  'ArrowRightLeft': ArrowRightLeft,
};

const colors = {
  purple: 'from-purple-500 to-purple-600',
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600'
};

export function StatCard({ icon, label, value, change, color = 'purple', suffix = '' }) {
  const Icon = iconMap[icon] || Boxes;
  const gradient = colors[color] || colors.purple;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="glass rounded-xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 cursor-default"
    >
      <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-gradient-to-br from-purple-500/0 to-purple-500/5 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        {change && <div className="text-xs text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />{change}</div>}
      </div>
      <div className="text-2xl font-bold relative z-10">{value}{suffix}</div>
      <div className="text-xs text-muted-foreground mt-1 relative z-10">{label}</div>
    </motion.div>
  );
}