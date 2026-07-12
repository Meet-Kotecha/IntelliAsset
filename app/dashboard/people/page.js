'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';

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

export default function PeoplePage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  const fetchData = async () => {
    try {
      const [usersData, deptsData] = await Promise.all([
        api('/users'),
        api('/departments')
      ]);
      setUsers(usersData);
      setDepartments(deptsData);
    } catch (e) {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api(`/users/${userId}`, { method: 'PATCH', body: { role: newRole } });
      toast.success('Role updated');
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    if (!confirm(`Set this user to ${newStatus}?`)) return;
    try {
      await api(`/users/${userId}`, { method: 'PATCH', body: { status: newStatus } });
      toast.success(`User ${newStatus}`);
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesDept = deptFilter === 'all' || u.departmentId === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading...</div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Employee Directory</h2>
        <p className="text-sm text-muted-foreground">Manage employees, roles, and status</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name or email" 
            className="pl-9 bg-black/20 border-white/10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40 bg-black/20 border-white/10"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Asset Manager">Asset Manager</SelectItem>
            <SelectItem value="Department Head">Department Head</SelectItem>
            <SelectItem value="Employee">Employee</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-40 bg-black/20 border-white/10"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="glass p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((u) => {
              const dept = departments.find(d => d.id === u.departmentId);
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{dept?.name || '—'}</TableCell>
                  <TableCell>
                    <Select value={u.role} onValueChange={(v) => handleRoleChange(u.id, v)}>
                      <SelectTrigger className="w-36 bg-black/20 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Asset Manager">Asset Manager</SelectItem>
                        <SelectItem value="Department Head">Department Head</SelectItem>
                        {u.role === 'Admin' && <SelectItem value="Admin">Admin</SelectItem>}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge className={u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                      {u.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleStatusToggle(u.id, u.status || 'Active')}
                      className={u.status === 'Active' ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}
                    >
                      {u.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}