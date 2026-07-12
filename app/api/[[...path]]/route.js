import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/mongodb';
import { computeAssetHealth, enrichAssets } from '@/lib/predictive';
import { copilotAnswer } from '@/lib/copilot';
import { generateSeedData } from '@/lib/seed';

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

async function handler(request, { params }) {
  try {
    await ensureSeed();
    const db = await getDb();
    const method = request.method;
    const pathArr = (await params)?.path || [];
    const route = pathArr.join('/');
    const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? await request.json().catch(() => ({})) : {};

    if (route === 'auth/signup' && method === 'POST') {
      const { email, password, name } = body;
      if (!email || !password || !name) return json({ error: 'Missing fields' }, 400);
      const existing = await db.collection('users').findOne({ email });
      if (existing) return json({ error: 'Email already registered' }, 400);
      const user = { id: uuid(), email, password, name, role: 'Employee', departmentId: null, avatar: '\ud83d\udc64' };
      await db.collection('users').insertOne(user);
      await log('USER_SIGNUP', 'User', user.id, user.id);
      const { password: _, _id, ...safe } = user;
      return json({ user: safe });
    }
    if (route === 'auth/login' && method === 'POST') {
      const { email, password } = body;
      const user = await db.collection('users').findOne({ email, password });
      if (!user) return json({ error: 'Invalid credentials' }, 401);
      await log('USER_LOGIN', 'User', user.id, user.id);
      const { password: _, _id, ...safe } = user;
      return json({ user: safe });
    }

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

    if (route === 'assets' && method === 'POST') {
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
      await log('ASSET_CREATED', 'Asset', asset.id, body.userId);
      const { _id, ...clean } = asset;
      return json(clean);
    }
    if (route.startsWith('assets/') && method === 'PATCH') {
      const id = route.split('/')[1];
      const update = { ...body };
      delete update._id; delete update.id; delete update.prediction;
      await db.collection('assets').updateOne({ id }, { $set: update });
      await log('ASSET_UPDATED', 'Asset', id, body.userId);
      return json({ ok: true });
    }
    if (route.startsWith('assets/') && method === 'DELETE') {
      const id = route.split('/')[1];
      await db.collection('assets').deleteOne({ id });
      return json({ ok: true });
    }

    if (route === 'allocations' && method === 'POST') {
      const { assetId, userId, expectedReturnAt, notes, actorId } = body;
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
      await log('ASSET_ALLOCATED', 'Asset', assetId, actorId, { userId });
      const { _id, ...clean } = alloc;
      return json(clean);
    }
    if (route.startsWith('allocations/') && route.endsWith('/return') && method === 'POST') {
      const id = route.split('/')[1];
      const alloc = await db.collection('allocations').findOne({ id });
      if (!alloc) return json({ error: 'Not found' }, 404);
      await db.collection('allocations').updateOne({ id }, { $set: { returnedAt: new Date().toISOString(), status: 'Returned' } });
      await db.collection('assets').updateOne({ id: alloc.assetId }, { $set: { status: 'Available', currentAllocationId: null } });
      await log('ASSET_RETURNED', 'Asset', alloc.assetId, body.actorId);
      return json({ ok: true });
    }

    if (route === 'transfers' && method === 'POST') {
      const { assetId, fromUserId, toUserId, actorId } = body;
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
      await db.collection('transfers').insertOne({ id: uuid(), assetId, fromUserId, toUserId, requestedBy: actorId, status: 'Completed', requestedAt: new Date().toISOString() });
      await log('ASSET_TRANSFERRED', 'Asset', assetId, actorId, { fromUserId, toUserId });
      return json({ ok: true });
    }

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
      await log('BOOKING_CREATED', 'Booking', booking.id, userId, { assetId });
      const { _id, ...clean } = booking;
      return json(clean);
    }
    if (route.startsWith('bookings/') && method === 'DELETE') {
      const id = route.split('/')[1];
      await db.collection('bookings').updateOne({ id }, { $set: { status: 'Cancelled' } });
      return json({ ok: true });
    }

    if (route === 'maintenance' && method === 'POST') {
      const { assetId, type, description, cost, actorId } = body;
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
      await log('MAINTENANCE_SCHEDULED', 'Asset', assetId, actorId);
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
      return json({ ok: true });
    }

    if (route.startsWith('users/') && method === 'PATCH') {
      const id = route.split('/')[1];
      const update = {};
      if (body.role) update.role = body.role;
      if (body.departmentId !== undefined) update.departmentId = body.departmentId;
      await db.collection('users').updateOne({ id }, { $set: update });
      await log('ROLE_ASSIGNED', 'User', id, body.actorId, { role: body.role });
      return json({ ok: true });
    }

    if (route === 'departments' && method === 'POST') {
      const dept = { id: uuid(), name: body.name, code: body.code, headId: body.headId || null };
      await db.collection('departments').insertOne(dept);
      const { _id, ...clean } = dept;
      return json(clean);
    }

    if (route === 'categories' && method === 'POST') {
      const cat = { id: uuid(), name: body.name, icon: body.icon || '\ud83d\udce6', description: body.description || '' };
      await db.collection('categories').insertOne(cat);
      const { _id, ...clean } = cat;
      return json(clean);
    }

    if (route === 'audits' && method === 'POST') {
      const audit = { id: uuid(), name: body.name, startDate: body.startDate, endDate: body.endDate, status: body.status || 'Scheduled', findings: [] };
      await db.collection('audits').insertOne(audit);
      const { _id, ...clean } = audit;
      return json(clean);
    }

    if (route.startsWith('notifications/') && route.endsWith('/read') && method === 'POST') {
      const id = route.split('/')[1];
      await db.collection('notifications').updateOne({ id }, { $set: { read: true } });
      return json({ ok: true });
    }

    if (route === 'reset' && method === 'POST') {
      for (const c of ['assets', 'users', 'departments', 'categories', 'allocations', 'bookings', 'maintenance', 'activityLogs', 'notifications', 'audits', 'transfers']) {
        await db.collection(c).deleteMany({});
      }
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