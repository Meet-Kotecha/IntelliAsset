import { v4 as uuid } from 'uuid';

export function generateSeedData() {
  const now = Date.now();
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

  const departments = [
    { id: uuid(), name: 'Engineering', code: 'ENG', headId: null },
    { id: uuid(), name: 'Design', code: 'DES', headId: null },
    { id: uuid(), name: 'Operations', code: 'OPS', headId: null },
    { id: uuid(), name: 'Sales', code: 'SAL', headId: null },
    { id: uuid(), name: 'Finance', code: 'FIN', headId: null },
  ];

  const users = [
    { id: uuid(), email: 'admin@intelliasset.io', password: 'admin123', name: 'Alex Chen', role: 'Admin', departmentId: departments[0].id, avatar: '🧑\u200d💼' },
    { id: uuid(), email: 'manager@intelliasset.io', password: 'manager123', name: 'Priya Sharma', role: 'Asset Manager', departmentId: departments[2].id, avatar: '👩\u200d💼' },
    { id: uuid(), email: 'lead@intelliasset.io', password: 'lead123', name: 'Marcus Johnson', role: 'Department Head', departmentId: departments[0].id, avatar: '👨\u200d💻' },
    { id: uuid(), email: 'sarah@intelliasset.io', password: 'emp123', name: 'Sarah Williams', role: 'Employee', departmentId: departments[1].id, avatar: '👩\u200d🎨' },
    { id: uuid(), email: 'david@intelliasset.io', password: 'emp123', name: 'David Kim', role: 'Employee', departmentId: departments[0].id, avatar: '🧑\u200d💻' },
    { id: uuid(), email: 'lisa@intelliasset.io', password: 'emp123', name: 'Lisa Rodriguez', role: 'Employee', departmentId: departments[3].id, avatar: '👩\u200d💼' },
    { id: uuid(), email: 'james@intelliasset.io', password: 'emp123', name: 'James Wilson', role: 'Employee', departmentId: departments[4].id, avatar: '🧔' },
  ];
  departments[0].headId = users[2].id;

  const categories = [
    { id: uuid(), name: 'Laptops', icon: '💻', description: 'Portable computers' },
    { id: uuid(), name: 'Monitors', icon: '🖥️', description: 'Display units' },
    { id: uuid(), name: 'Meeting Rooms', icon: '🏢', description: 'Bookable spaces' },
    { id: uuid(), name: 'Vehicles', icon: '🚗', description: 'Company vehicles' },
    { id: uuid(), name: 'Peripherals', icon: '⌨️', description: 'Keyboards, mice, headsets' },
    { id: uuid(), name: 'Cameras', icon: '📷', description: 'Photography equipment' },
    { id: uuid(), name: 'Projectors', icon: '📽️', description: 'AV equipment' },
  ];

  const assets = [];
  const assetTemplates = [
    { name: 'MacBook Pro 16" M3 Max', brand: 'Apple', cat: 0, cost: 3499, cond: 'Excellent', age: 90 },
    { name: 'MacBook Pro 14" M2', brand: 'Apple', cat: 0, cost: 1999, cond: 'Good', age: 540 },
    { name: 'Dell XPS 15', brand: 'Dell', cat: 0, cost: 1799, cond: 'Fair', age: 900 },
    { name: 'ThinkPad X1 Carbon Gen 11', brand: 'Lenovo', cat: 0, cost: 1899, cond: 'Good', age: 300 },
    { name: 'MacBook Air M2', brand: 'Apple', cat: 0, cost: 1299, cond: 'Excellent', age: 60 },
    { name: 'ThinkPad T480', brand: 'Lenovo', cat: 0, cost: 999, cond: 'Poor', age: 1900 },
    { name: 'HP EliteBook 840', brand: 'HP', cat: 0, cost: 1499, cond: 'Fair', age: 1200 },
    { name: 'LG UltraFine 5K', brand: 'LG', cat: 1, cost: 1299, cond: 'Excellent', age: 180 },
    { name: 'Dell U2723QE 27"', brand: 'Dell', cat: 1, cost: 649, cond: 'Good', age: 420 },
    { name: 'Samsung Odyssey G9', brand: 'Samsung', cat: 1, cost: 1499, cond: 'Excellent', age: 120 },
    { name: 'BenQ PD3220U', brand: 'BenQ', cat: 1, cost: 1149, cond: 'Fair', age: 1100 },
    { name: 'Aurora Meeting Room', brand: 'HQ Floor 3', cat: 2, cost: 25000, cond: 'Excellent', age: 800 },
    { name: 'Nebula Conference Room', brand: 'HQ Floor 5', cat: 2, cost: 40000, cond: 'Good', age: 800 },
    { name: 'Focus Pod A', brand: 'HQ Floor 2', cat: 2, cost: 8000, cond: 'Excellent', age: 400 },
    { name: 'Tesla Model 3 (Fleet)', brand: 'Tesla', cat: 3, cost: 42000, cond: 'Good', age: 700 },
    { name: 'Toyota Camry Hybrid', brand: 'Toyota', cat: 3, cost: 32000, cond: 'Fair', age: 1600 },
    { name: 'Ford Transit Van', brand: 'Ford', cat: 3, cost: 45000, cond: 'Poor', age: 2200 },
    { name: 'Logitech MX Master 3S', brand: 'Logitech', cat: 4, cost: 99, cond: 'Excellent', age: 150 },
    { name: 'Keychron Q1 Pro', brand: 'Keychron', cat: 4, cost: 219, cond: 'Good', age: 300 },
    { name: 'Sony WH-1000XM5', brand: 'Sony', cat: 4, cost: 399, cond: 'Excellent', age: 100 },
    { name: 'Bose QC45', brand: 'Bose', cat: 4, cost: 329, cond: 'Fair', age: 900 },
    { name: 'Canon EOS R5', brand: 'Canon', cat: 5, cost: 3899, cond: 'Excellent', age: 200 },
    { name: 'Sony A7 IV', brand: 'Sony', cat: 5, cost: 2499, cond: 'Good', age: 500 },
    { name: 'DJI Mavic 3 Pro', brand: 'DJI', cat: 5, cost: 2199, cond: 'Fair', age: 800 },
    { name: 'Epson Pro L2050U', brand: 'Epson', cat: 6, cost: 5499, cond: 'Good', age: 600 },
    { name: 'BenQ TK850i 4K', brand: 'BenQ', cat: 6, cost: 1699, cond: 'Fair', age: 1300 },
    { name: 'iPad Pro 12.9 M2', brand: 'Apple', cat: 0, cost: 1099, cond: 'Excellent', age: 200 },
    { name: 'Surface Studio Laptop', brand: 'Microsoft', cat: 0, cost: 2399, cond: 'Good', age: 400 },
    { name: 'ASUS ProArt Display', brand: 'ASUS', cat: 1, cost: 899, cond: 'Excellent', age: 90 },
    { name: 'Logitech Brio 4K', brand: 'Logitech', cat: 5, cost: 199, cond: 'Good', age: 300 },
  ];

  assetTemplates.forEach((t, i) => {
    assets.push({
      id: uuid(),
      code: `AST-${String(1000 + i).padStart(4, '0')}`,
      name: t.name,
      categoryId: categories[t.cat].id,
      brand: t.brand,
      model: t.name,
      serialNumber: `SN${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
      purchaseDate: daysAgo(t.age),
      purchaseCost: t.cost,
      condition: t.cond,
      status: 'Available',
      currentAllocationId: null,
      location: t.cat === 2 ? t.brand : 'HQ Storage',
      warrantyExpiry: daysAgo(t.age - 1095),
      imageUrl: null,
    });
  });

  // Allocations — allocate ~50% of assets
  const allocations = [];
  const employeeUsers = users.filter(u => u.role !== 'Admin');
  assets.forEach((asset, i) => {
    if (i % 2 === 0 && asset.name && !asset.name.includes('Room') && !asset.name.includes('Pod')) {
      const user = employeeUsers[i % employeeUsers.length];
      const allocDaysAgo = 30 + (i % 60);
      const expectedIn = 30 + (i % 90);
      const overdue = i % 7 === 0; // some overdue
      const alloc = {
        id: uuid(),
        assetId: asset.id,
        userId: user.id,
        allocatedAt: daysAgo(allocDaysAgo),
        expectedReturnAt: daysAgo(overdue ? -(-5 - (i % 20)) : -(expectedIn)),
        returnedAt: null,
        status: 'Active',
        notes: 'Standard allocation',
      };
      // Fix logic: overdue means expectedReturn in past
      if (overdue) {
        alloc.expectedReturnAt = daysAgo(5 + (i % 20));
      } else {
        alloc.expectedReturnAt = new Date(now + (30 + i) * 86400000).toISOString();
      }
      allocations.push(alloc);
      asset.status = 'Allocated';
      asset.currentAllocationId = alloc.id;
    }
  });

  // Maintenance records
  const maintenance = [];
  assets.forEach((asset, i) => {
    const ageDays = (now - new Date(asset.purchaseDate).getTime()) / 86400000;
    const numRepairs = asset.condition === 'Poor' ? 4 : asset.condition === 'Fair' ? 2 : asset.condition === 'Good' ? 1 : 0;
    for (let r = 0; r < numRepairs; r++) {
      maintenance.push({
        id: uuid(),
        assetId: asset.id,
        type: ['Preventive', 'Corrective', 'Inspection'][r % 3],
        description: ['Screen replacement', 'Battery replacement', 'General service', 'Software update', 'Hardware repair'][r % 5],
        cost: 100 + Math.floor(Math.random() * 500),
        performedBy: 'TechCare Services',
        performedAt: daysAgo(Math.max(30, ageDays - (r + 1) * 90)),
        status: 'Completed',
      });
    }
  });

  // Set a few assets to Under Maintenance
  const maintenanceAssets = assets.filter(a => a.condition === 'Poor').slice(0, 2);
  maintenanceAssets.forEach(a => {
    a.status = 'Under Maintenance';
    maintenance.push({
      id: uuid(),
      assetId: a.id,
      type: 'Corrective',
      description: 'Currently undergoing repair',
      cost: 350,
      performedBy: 'TechCare Services',
      performedAt: daysAgo(2),
      status: 'In Progress',
    });
  });

  // Bookings for meeting rooms
  const bookings = [];
  const rooms = assets.filter(a => a.name.includes('Room') || a.name.includes('Pod'));
  rooms.forEach((room, i) => {
    for (let j = 0; j < 3; j++) {
      const startOffset = -2 + j * 2;
      const start = new Date(now + startOffset * 86400000 + (9 + i) * 3600000);
      const end = new Date(start.getTime() + 2 * 3600000);
      bookings.push({
        id: uuid(),
        assetId: room.id,
        userId: employeeUsers[j % employeeUsers.length].id,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        purpose: ['Product Sync', 'Design Review', 'Sales Pipeline', 'All-Hands', 'Interview'][j % 5],
        status: startOffset < 0 ? 'Completed' : 'Confirmed',
      });
    }
  });

  // Activity logs
  const activityLogs = [];
  const actions = ['ASSET_CREATED', 'ASSET_ALLOCATED', 'MAINTENANCE_SCHEDULED', 'ASSET_RETURNED', 'USER_LOGIN', 'BOOKING_CREATED', 'ROLE_ASSIGNED'];
  for (let i = 0; i < 40; i++) {
    activityLogs.push({
      id: uuid(),
      userId: users[i % users.length].id,
      action: actions[i % actions.length],
      entityType: 'Asset',
      entityId: assets[i % assets.length].id,
      meta: { note: `Automated log entry #${i}` },
      timestamp: daysAgo(Math.floor(i / 2)),
    });
  }

  const notifications = [
    { id: uuid(), userId: users[0].id, title: 'Critical Risk Alert', message: 'Ford Transit Van requires immediate inspection', type: 'critical', read: false, createdAt: daysAgo(1) },
    { id: uuid(), userId: users[0].id, title: 'Overdue Returns', message: '3 assets past their expected return date', type: 'warning', read: false, createdAt: daysAgo(0) },
    { id: uuid(), userId: users[0].id, title: 'New Booking', message: 'Aurora Meeting Room booked for tomorrow', type: 'info', read: true, createdAt: daysAgo(2) },
  ];

  const audits = [
    { id: uuid(), name: 'Q2 2025 Full Inventory Audit', startDate: daysAgo(15), endDate: daysAgo(1), status: 'Completed', findings: [{ note: '2 assets not found at expected location', severity: 'warning' }, { note: 'All laptops verified', severity: 'info' }] },
    { id: uuid(), name: 'Q3 2025 Spot Check', startDate: daysAgo(-5), endDate: daysAgo(-15), status: 'Scheduled', findings: [] },
  ];

  const transfers = [];

  return { departments, users, categories, assets, allocations, maintenance, bookings, activityLogs, notifications, audits, transfers };
}
