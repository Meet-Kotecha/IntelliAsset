'use client';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Calendar, List, Plus, RefreshCw, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { format } from 'date-fns';

// ===== Localizer for react-big-calendar =====
const localizer = momentLocalizer(moment);

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

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    assetId: '',
    startAt: '',
    endAt: '',
    purpose: '',
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, assetsData, usersData] = await Promise.all([
        api('/bookings'),
        api('/assets'),
        api('/users')
      ]);
      setBookings(bookingsData);
      // Only resources that are bookable (meeting rooms, vehicles, etc.)
      const bookableAssets = assetsData.filter(a => 
        a.status !== 'Retired' && a.status !== 'Disposed' && a.status !== 'Lost'
      );
      setResources(bookableAssets);
      setUsers(usersData);
    } catch (e) {
      toast.error('Failed to load booking data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createBooking = async (e) => {
    e.preventDefault();
    try {
      await api('/bookings', {
        method: 'POST',
        body: {
          assetId: form.assetId,
          userId: user?.id,
          startAt: form.startAt,
          endAt: form.endAt,
          purpose: form.purpose || 'General booking',
        },
      });
      toast.success('Booking confirmed!');
      setDialogOpen(false);
      setForm({ assetId: '', startAt: '', endAt: '', purpose: '' });
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await api(`/bookings/${bookingId}`, { method: 'DELETE' });
      toast.success('Booking cancelled');
      fetchData();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // ===== Calendar Events =====
  const events = useMemo(() => {
    return bookings
      .filter(b => b.status !== 'Cancelled')
      .map(b => {
        const resource = resources.find(r => r.id === b.assetId);
        const booker = users.find(u => u.id === b.userId);
        return {
          id: b.id,
          title: `${resource?.name || 'Unknown'} - ${booker?.name || 'Unknown'}`,
          start: new Date(b.startAt),
          end: new Date(b.endAt),
          resource: b,
          status: b.status,
        };
      });
  }, [bookings, resources, users]);

  // ===== Event Style =====
  const eventStyleGetter = (event) => {
    const isConfirmed = event.status === 'Confirmed';
    const isCompleted = event.status === 'Completed';
    let backgroundColor = '#7c3aed'; // purple (confirmed)
    if (isCompleted) backgroundColor = '#10b981'; // green (completed)
    if (event.status === 'Cancelled') backgroundColor = '#6b7280'; // gray (cancelled)
    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        padding: '2px 6px',
        fontSize: '0.7rem',
        opacity: isConfirmed ? 1 : 0.7,
      }
    };
  };

  // ===== Handle Slot Selection =====
  const handleSelectSlot = ({ start, end }) => {
    if (!user) return;
    const startStr = start.toISOString();
    const endStr = end.toISOString();
    setForm({
      assetId: resources[0]?.id || '',
      startAt: startStr.slice(0, 16),
      endAt: endStr.slice(0, 16),
      purpose: '',
    });
    setDialogOpen(true);
  };

  // ===== Status Badge =====
  const getStatusBadge = (status) => {
    const styles = {
      'Confirmed': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Cancelled': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    };
    return styles[status] || styles['Confirmed'];
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-muted-foreground animate-pulse">Loading bookings...</div></div>;
  }

  const isBookable = (resource) => {
    // Check if resource is already booked at the selected time
    // This is handled by the API, but we can also check here
    return resource.status === 'Available' || resource.status === 'Allocated';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Resource Bookings</h2>
          <p className="text-sm text-muted-foreground">
            {bookings.filter(b => b.status === 'Confirmed').length} active bookings
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg overflow-hidden border border-border/50">
            <button
              onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-sm transition-colors ${view === 'calendar' ? 'bg-purple-500/20 text-purple-400' : 'bg-transparent text-muted-foreground hover:bg-white/5'}`}
            >
              <Calendar className="w-4 h-4 inline mr-1" /> Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 text-sm transition-colors ${view === 'list' ? 'bg-purple-500/20 text-purple-400' : 'bg-transparent text-muted-foreground hover:bg-white/5'}`}
            >
              <List className="w-4 h-4 inline mr-1" /> List
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
            <Plus className="w-4 h-4 mr-2" /> Book Resource
          </Button>
        </div>
      </div>

      {/* View Content */}
      {view === 'calendar' ? (
        <Card className="glass p-4">
          <div style={{ height: 600 }}>
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              selectable={!!user}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day']}
              defaultView="week"
              tooltipAccessor={(event) => `${event.title}\n${moment(event.start).format('LLL')} - ${moment(event.end).format('LLL')}`}
              onSelectEvent={(event) => {
                if (event.status !== 'Cancelled' && user?.role !== 'Employee') {
                  cancelBooking(event.id);
                }
              }}
            />
          </div>
        </Card>
      ) : (
        <Card className="glass p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Resource</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Booked By</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Purpose</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Start</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">End</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings
                  .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
                  .map(b => {
                    const resource = resources.find(r => r.id === b.assetId);
                    const booker = users.find(u => u.id === b.userId);
                    const isActive = b.status === 'Confirmed' && new Date(b.endAt) > new Date();
                    return (
                      <tr key={b.id} className="border-b border-border/30 hover:bg-white/5">
                        <td className="p-3">
                          <div className="font-medium">{resource?.name || 'Unknown'}</div>
                          <div className="text-xs text-muted-foreground">{resource?.code || 'N/A'}</div>
                        </td>
                        <td className="p-3">{booker?.name || 'Unknown'}</td>
                        <td className="p-3">{b.purpose || '—'}</td>
                        <td className="p-3">{format(new Date(b.startAt), 'PPp')}</td>
                        <td className="p-3">{format(new Date(b.endAt), 'PPp')}</td>
                        <td className="p-3">
                          <Badge className={getStatusBadge(b.status)}>
                            {b.status}
                          </Badge>
                          {isActive && <span className="ml-2 text-xs text-emerald-400">● Active</span>}
                        </td>
                        <td className="p-3 text-right">
                          {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelBooking(b.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* ===== Create Booking Dialog ===== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass max-w-md">
          <DialogHeader>
            <DialogTitle>Book a Resource</DialogTitle>
          </DialogHeader>
          <form onSubmit={createBooking} className="space-y-4">
            <div>
              <Label>Resource</Label>
              <Select value={form.assetId} onValueChange={v => setForm({...form, assetId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map(r => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start</Label>
                <Input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={e => setForm({...form, startAt: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>End</Label>
                <Input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={e => setForm({...form, endAt: e.target.value})}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Purpose</Label>
              <Input
                value={form.purpose}
                onChange={e => setForm({...form, purpose: e.target.value})}
                placeholder="Meeting, team sync, etc."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-500 to-blue-500">
                Confirm Booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}