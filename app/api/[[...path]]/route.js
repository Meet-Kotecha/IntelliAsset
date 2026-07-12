import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/mongodb';
import { computeAssetHealth, enrichAssets } from '@/lib/predictive';
import { copilotAnswer } from '@/lib/copilot';
import { generateSeedData } from '@/lib/seed';
import { getSession, requireAuth, requireRole } from '@/lib/auth';
import { hasApiAccess, ROLES } from '@/lib/rbac';

const json = (data, status = 200) => NextResponse.json(data, { status });

async function ensureSeed() {
  const db = await getDb();
  const count = await db.collection('assets').countDocuments();
  if (count === 0) {
    const data = generateSeedData();
    for (const [k, v] of Object.entries(data)) {
      if (v.length) await db.collection(k).insertMany(v);
    }
  }
}

async function log(action, entityType, entityId, userId, meta = {}) {
  const db = await getDb();
  await db.collection('activityLogs').insertOne({
    id: uuid(), action, entityType, entityId, userId, meta, timestamp: new Date().toISOString(),
  });
}

/**
 * Check if the current user has permission for the requested API route/method.
 * Returns true/false.
 */
function checkApiPermission(user, route, method) {
  // Public routes that don't require authentication
  const publicRoutes = ['auth/login', 'auth/signup', 'auth/logout'];
  const normalizedRoute = route.startsWith('/api') ? route.slice(4) : route;
  if (publicRoutes.includes(normalizedRoute)) return true;

  if (!user) return false;
  return hasApiAccess(user.role, normalizedRoute, method);
}

async function handler(request, { params }) {
  try {
    await ensureSeed();
    const db = await getDb();
    const method = request.method;
    const pathArr = (await params)?.path || [];
    const route = pathArr.join('/');
    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? await request.json().catch(() => ({})) : {};

    // ===== AUTHENTICATION & AUTHORIZATION =====
    // Skip auth for public routes
    const publicRoutes = ['auth/login', 'auth/signup', 'auth/logout'];
    if (!publicRoutes.includes(route)) {
      const user = getSession(request);
      if (!user) {
        return json({ error: 'Unauthorized' }, 401);
      }
      // Check role permission
      if (!hasApiAccess(user.role, route, method)) {
        return json({ error: 'Forbidden: insufficient permissions' }, 403);
      }
      // Attach user to request for downstream use
      request.user = user;
    }

    // ===== AUTH ROUTES =====
    if (route === 'auth/signup' && method === 'POST') {
      const { email, password, name } = body;
      if (!email || !password || !name) return json({ error: 'Missing fields' }, 400);
      const existing = await db.collection('users').findOne({ email });
      if (existing) return json({ error: 'Email already registered' }, 400);
      const user = { id: uuid(), email, password, name, role: 'Employee', departmentId: null, avatar: '👤' };
      await db.collection('users').insertOne(user);
      await log('USER_SIGNUP', 'User', user.id, user.id);
      const { password: _, _id, ...safe } = user;
      return json({ user: safe });
    }

if (route === 'auth/login' && method === 'POST') {
  const { email, password } = body;
  const user = await db.collection('users').findOne({ email, password });
  if (!user) return json({ error: 'Invalid credentials' }, 401);
  if (user.status !== 'Active') return json({ error: 'Account is deactivated. Contact admin.' }, 403);
  await log('USER_LOGIN', 'User', user.id, user.id);
  const { password: _, _id, ...safe } = user;
  return json({ user: safe });
}

    if (route === 'auth/logout' && method === 'POST') {
      // Clear cookie handled by client; just log
      return json({ ok: true });
    }

    // ===== BOOTSTRAP =====
    if (route === 'bootstrap' && method === 'GET') {
      const [assets, users, departments, categories, allocations, bookings, maintenance, activityLogs, notifications, audits, transfers] = await Promise.all([
        db.collection('assets').find({}).toArray(),
        db.collection('users').find({}).toArray(),
        db.collection('departments').find({}).toArray(),
        db.collection('categories').find({}).toArray(),
        db.collection('allocations').find({}).toArray(),
        db.collection('bookings').find({}).toArray(),
        db.collection('maintenance').find({}).toArray(),
        db.collection('activityLogs').find({}).sort({ timestamp: -1 }).limit(100).toArray(),
        db.collection('notifications').find({}).toArray(),
        db.collection('audits').find({}).toArray(),
        db.collection('transfers').find({}).toArray(),
      ]);
      const clean = (arr) => arr.map(({ _id, password, ...rest }) => rest);
      const enriched = enrichAssets(clean(assets), clean(maintenance));
      return json({
        assets: enriched, users: clean(users), departments: clean(departments),
        categories: clean(categories), allocations: clean(allocations),
        bookings: clean(bookings), maintenance: clean(maintenance),
        activityLogs: clean(activityLogs), notifications: clean(notifications),
        audits: clean(audits), transfers: clean(transfers),
      });
    }

    // ===== COPILOT =====
    if (route === 'copilot' && method === 'POST') {
      const { query } = body;
      const [assets, users, allocations, maintenance, bookings, departments, categories] = await Promise.all([
        db.collection('assets').find({}).toArray(),
        db.collection('users').find({}).toArray(),
        db.collection('allocations').find({}).toArray(),
        db.collection('maintenance').find({}).toArray(),
        db.collection('bookings').find({}).toArray(),
        db.collection('departments').find({}).toArray(),
        db.collection('categories').find({}).toArray(),
      ]);
      const clean = (arr) => arr.map(({ _id, password, ...rest }) => rest);
      const result = copilotAnswer(query, {
        assets: clean(assets), users: clean(users), allocations: clean(allocations),
        maintenance: clean(maintenance), bookings: clean(bookings),
        departments: clean(departments), categories: clean(categories),
      });
      return json(result);
    }

    // ===== ASSETS =====
    if (route === 'assets' && method === 'POST') {
      // Only Admin and Asset Manager can create
      const asset = {
        id: uuid(),
        code: body.code || `AST-${String(Date.now()).slice(-6)}`,
        name: body.name, categoryId: body.categoryId,
        brand: body.brand || '', model: body.model || body.name,
        serialNumber: body.serialNumber || `SN${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        purchaseDate: body.purchaseDate || new Date().toISOString(),
        purchaseCost: Number(body.purchaseCost) || 0,
        condition: body.condition || 'Excellent',
        status: 'Available', currentAllocationId: null,
        location: body.location || 'HQ Storage',
        warrantyExpiry: body.warrantyExpiry || null, imageUrl: body.imageUrl || null,
      };
      await db.collection('assets').insertOne(asset);
      await log('ASSET_CREATED', 'Asset', asset.id, request.user.id);
      const { _id, ...clean } = asset;
      return json(clean);
    }
    if (route.startsWith('assets/') && method === 'PATCH') {
      const id = route.split('/')[1];
      const update = { ...body };
      delete update._id; delete update.id; delete update.prediction;
      await db.collection('assets').updateOne({ id }, { $set: update });
      await log('ASSET_UPDATED', 'Asset', id, request.user.id);
      return json({ ok: true });
    }
    if (route.startsWith('assets/') && method === 'DELETE') {
      const id = route.split('/')[1];
      await db.collection('assets').deleteOne({ id });
      await log('ASSET_DELETED', 'Asset', id, request.user.id);
      return json({ ok: true });
    }

    // ===== ALLOCATIONS =====
    if (route === 'allocations' && method === 'POST') {
      const { assetId, userId, expectedReturnAt, notes } = body;
      const asset = await db.collection('assets').findOne({ id: assetId });
      if (!asset) return json({ error: 'Asset not found' }, 404);
      if (asset.status === 'Allocated') return json({ error: 'Asset already allocated' }, 400);
      if (['Under Maintenance', 'Lost', 'Retired', 'Disposed'].includes(asset.status)) {
        return json({ error: `Cannot allocate asset in status: ${asset.status}` }, 400);
      }
      const alloc = {
        id: uuid(), assetId, userId,
        allocatedAt: new Date().toISOString(),
        expectedReturnAt: expectedReturnAt || new Date(Date.now() + 30 * 86400000).toISOString(),
        returnedAt: null, status: 'Active', notes: notes || '',
      };
      await db.collection('allocations').insertOne(alloc);
      await db.collection('assets').updateOne({ id: assetId }, { $set: { status: 'Allocated', currentAllocationId: alloc.id } });
      await log('ASSET_ALLOCATED', 'Asset', assetId, request.user.id, { userId });
      const { _id, ...clean } = alloc;
      return json(clean);
    }
    if (route.startsWith('allocations/') && route.endsWith('/return') && method === 'POST') {
      const id = route.split('/')[1];
      const alloc = await db.collection('allocations').findOne({ id });
      if (!alloc) return json({ error: 'Not found' }, 404);
      await db.collection('allocations').updateOne({ id }, { $set: { returnedAt: new Date().toISOString(), status: 'Returned' } });
      await db.collection('assets').updateOne({ id: alloc.assetId }, { $set: { status: 'Available', currentAllocationId: null } });
      await log('ASSET_RETURNED', 'Asset', alloc.assetId, request.user.id);
      return json({ ok: true });
    }

    // ===== TRANSFERS =====
    if (route === 'transfers' && method === 'POST') {
      const { assetId, fromUserId, toUserId } = body;
      const active = await db.collection('allocations').findOne({ assetId, status: 'Active' });
      if (!active) return json({ error: 'No active allocation to transfer' }, 400);
      await db.collection('allocations').updateOne({ id: active.id }, { $set: { returnedAt: new Date().toISOString(), status: 'Transferred' } });
      const newAlloc = {
        id: uuid(), assetId, userId: toUserId,
        allocatedAt: new Date().toISOString(),
        expectedReturnAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        returnedAt: null, status: 'Active', notes: 'Transferred from previous holder',
      };
      await db.collection('allocations').insertOne(newAlloc);
      await db.collection('assets').updateOne({ id: assetId }, { $set: { currentAllocationId: newAlloc.id } });
      await db.collection('transfers').insertOne({ id: uuid(), assetId, fromUserId, toUserId, requestedBy: request.user.id, status: 'Completed', requestedAt: new Date().toISOString() });
      await log('ASSET_TRANSFERRED', 'Asset', assetId, request.user.id, { fromUserId, toUserId });
      return json({ ok: true });
    }

    // ===== BOOKINGS =====
    if (route === 'bookings' && method === 'POST') {
      const { assetId, userId, startAt, endAt, purpose } = body;
      const start = new Date(startAt), end = new Date(endAt);
      if (start >= end) return json({ error: 'End must be after start' }, 400);
      const conflicts = await db.collection('bookings').find({
        assetId, status: { $ne: 'Cancelled' },
        $or: [{ startAt: { $lt: end.toISOString() }, endAt: { $gt: start.toISOString() } }]
      }).toArray();
      if (conflicts.length) return json({ error: 'Booking conflict detected', conflicts: conflicts.map(c => ({ ...c, _id: undefined })) }, 409);
      const booking = { id: uuid(), assetId, userId, startAt: start.toISOString(), endAt: end.toISOString(), purpose, status: 'Confirmed' };
      await db.collection('bookings').insertOne(booking);
      await log('BOOKING_CREATED', 'Booking', booking.id, request.user.id, { assetId });
      const { _id, ...clean } = booking;
      return json(clean);
    }
    if (route.startsWith('bookings/') && method === 'DELETE') {
      const id = route.split('/')[1];
      await db.collection('bookings').updateOne({ id }, { $set: { status: 'Cancelled' } });
      await log('BOOKING_CANCELLED', 'Booking', id, request.user.id);
      return json({ ok: true });
    }

    // ===== MAINTENANCE =====
    if (route === 'maintenance' && method === 'POST') {
      const { assetId, type, description, cost } = body;
      const record = {
        id: uuid(), assetId, type, description, cost: Number(cost) || 0,
        performedBy: body.performedBy || 'Internal Team',
        performedAt: new Date().toISOString(),
        status: body.status || 'Scheduled',
      };
      await db.collection('maintenance').insertOne(record);
      if (record.status === 'In Progress') {
        await db.collection('assets').updateOne({ id: assetId }, { $set: { status: 'Under Maintenance' } });
      }
      await log('MAINTENANCE_SCHEDULED', 'Asset', assetId, request.user.id);
      const { _id, ...clean } = record;
      return json(clean);
    }
    if (route.startsWith('maintenance/') && method === 'PATCH') {
      const id = route.split('/')[1];
      const rec = await db.collection('maintenance').findOne({ id });
      if (!rec) return json({ error: 'Not found' }, 404);
      await db.collection('maintenance').updateOne({ id }, { $set: { status: body.status } });
      if (body.status === 'Completed') {
        await db.collection('assets').updateOne({ id: rec.assetId }, { $set: { status: 'Available' } });
      }
      await log('MAINTENANCE_UPDATED', 'Maintenance', id, request.user.id);
      return json({ ok: true });
    }

    // ===== USERS =====
    if (route.startsWith('users/') && method === 'PATCH') {
      const id = route.split('/')[1];
      const update = {};
      if (body.role) update.role = body.role;
      if (body.departmentId !== undefined) update.departmentId = body.departmentId;
      if (body.status) update.status = body.status;
      await db.collection('users').updateOne({ id }, { $set: update });
      await log('ROLE_ASSIGNED', 'User', id, request.user.id, { role: body.role });
      return json({ ok: true });
    }

    // ===== DEPARTMENTS =====
    if (route === 'departments' && method === 'POST') {
      const dept = { id: uuid(), name: body.name, code: body.code, headId: body.headId || null };
      await db.collection('departments').insertOne(dept);
      const { _id, ...clean } = dept;
      await log('DEPARTMENT_CREATED', 'Department', dept.id, request.user.id);
      return json(clean);
    }
    if (route.startsWith('departments/') && method === 'PUT') {
      const id = route.split('/')[1];
      const update = { name: body.name, code: body.code, headId: body.headId || null };
      await db.collection('departments').updateOne({ id }, { $set: update });
      await log('DEPARTMENT_UPDATED', 'Department', id, request.user.id);
      return json({ ok: true });
    }
    if (route.startsWith('departments/') && method === 'DELETE') {
      const id = route.split('/')[1];
      await db.collection('departments').deleteOne({ id });
      await log('DEPARTMENT_DELETED', 'Department', id, request.user.id);
      return json({ ok: true });
    }

    // ===== CATEGORIES =====
    if (route === 'categories' && method === 'POST') {
      const cat = { id: uuid(), name: body.name, icon: body.icon || '📦', description: body.description || '' };
      await db.collection('categories').insertOne(cat);
      const { _id, ...clean } = cat;
      await log('CATEGORY_CREATED', 'Category', cat.id, request.user.id);
      return json(clean);
    }
    if (route.startsWith('categories/') && method === 'PUT') {
      const id = route.split('/')[1];
      const update = { name: body.name, icon: body.icon, description: body.description };
      await db.collection('categories').updateOne({ id }, { $set: update });
      await log('CATEGORY_UPDATED', 'Category', id, request.user.id);
      return json({ ok: true });
    }
    if (route.startsWith('categories/') && method === 'DELETE') {
      const id = route.split('/')[1];
      await db.collection('categories').deleteOne({ id });
      await log('CATEGORY_DELETED', 'Category', id, request.user.id);
      return json({ ok: true });
    }

    // ===== AUDITS =====
    if (route === 'audits' && method === 'POST') {
      const audit = { id: uuid(), name: body.name, startDate: body.startDate, endDate: body.endDate, status: body.status || 'Scheduled', findings: [] };
      await db.collection('audits').insertOne(audit);
      const { _id, ...clean } = audit;
      await log('AUDIT_CREATED', 'Audit', audit.id, request.user.id);
      return json(clean);
    }
    if (route.startsWith('audits/') && method === 'PATCH') {
      const id = route.split('/')[1];
      const audit = await db.collection('audits').findOne({ id });
      if (!audit) return json({ error: 'Not found' }, 404);
      // Update status or findings
      const update = {};
      if (body.status) update.status = body.status;
      if (body.findings) update.findings = body.findings;
      await db.collection('audits').updateOne({ id }, { $set: update });
      await log('AUDIT_UPDATED', 'Audit', id, request.user.id);
      return json({ ok: true });
    }

    // ===== NOTIFICATIONS =====
    if (route === 'notifications' && method === 'GET') {
      const notifications = await db.collection('notifications')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return json(notifications.map(({ _id, ...rest }) => rest));
    }
    if (route === 'notifications/mark-all-read' && method === 'POST') {
      await db.collection('notifications').updateMany(
        { read: false },
        { $set: { read: true } }
      );
      await log('NOTIFICATIONS_MARKED_READ', 'Notifications', 'all', request.user.id);
      return json({ ok: true });
    }
    if (route.startsWith('notifications/') && route.endsWith('/read') && method === 'POST') {
      const id = route.split('/')[1];
      await db.collection('notifications').updateOne({ id }, { $set: { read: true } });
      return json({ ok: true });
    }

    // ===== REPORTS (dummy for now, will be implemented later) =====
    if (route === 'reports' && method === 'GET') {
      return json({ message: 'Reports endpoint - will be implemented in Module 8' });
    }

    // ===== ACTIVITY LOGS =====
    if (route === 'activity' && method === 'GET') {
      const logs = await db.collection('activityLogs')
        .find({})
        .sort({ timestamp: -1 })
        .limit(200)
        .toArray();
      return json(logs.map(({ _id, ...rest }) => rest));
    }

    // ===== RESET (dev only) =====
    if (route === 'reset' && method === 'POST') {
      // Only allow if user is admin
      const user = getSession(request);
      if (!user || user.role !== ROLES.ADMIN) {
        return json({ error: 'Forbidden' }, 403);
      }
      for (const c of ['assets', 'users', 'departments', 'categories', 'allocations', 'bookings', 'maintenance', 'activityLogs', 'notifications', 'audits', 'transfers']) {
        await db.collection(c).deleteMany({});
      }
      await log('DATABASE_RESET', 'System', 'all', request.user.id);
      return json({ ok: true, message: 'Database cleared' });
    }

    return json({ error: 'Route not found', route, method }, 404);
  } catch (e) {
    console.error('API error:', e);
    return json({ error: e.message }, 500);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;