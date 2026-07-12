// lib/rbac.js
// ============================================
// Role-Based Access Control Definitions
// ============================================

export const ROLES = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'Asset Manager',
  DEPARTMENT_HEAD: 'Department Head',
  EMPLOYEE: 'Employee'
};

// ============================================
// FRONTEND MENU ITEMS (by role)
// ============================================

export const MENU_ITEMS = {
  [ROLES.ADMIN]: [
    { id: 'admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'departments', label: 'Departments', icon: 'Building2' },
    { id: 'categories', label: 'Asset Categories', icon: 'Tag' },
    { id: 'people', label: 'Employee Directory', icon: 'Users' },
    { id: 'assets', label: 'Assets', icon: 'Package' },
    { id: 'allocations', label: 'Allocations', icon: 'ArrowRightLeft' },
    { id: 'transfers', label: 'Transfers', icon: 'ArrowRightLeft' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
    { id: 'audits', label: 'Audits', icon: 'ClipboardCheck' },
    { id: 'reports', label: 'Reports', icon: 'FileBarChart' },
    { id: 'activity', label: 'Activity Logs', icon: 'Activity' },
    { id: 'settings', label: 'Settings', icon: 'Settings' },
    { id: 'copilot', label: 'AI Copilot', icon: 'Sparkles', highlight: true }
  ],
  [ROLES.ASSET_MANAGER]: [
    { id: 'manager', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'assets', label: 'Assets', icon: 'Package' },
    { id: 'allocations', label: 'Allocations', icon: 'ArrowRightLeft' },
    { id: 'transfers', label: 'Transfers', icon: 'ArrowRightLeft' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
    { id: 'reports', label: 'Reports', icon: 'FileBarChart' }
  ],
  [ROLES.DEPARTMENT_HEAD]: [
    { id: 'department', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'department-assets', label: 'Department Assets', icon: 'Package' },
    { id: 'department-employees', label: 'Team Members', icon: 'Users' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'transfers', label: 'Transfers', icon: 'ArrowRightLeft' }
  ],
  [ROLES.EMPLOYEE]: [
    { id: 'employee', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'my-assets', label: 'My Assets', icon: 'Package' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'my-requests', label: 'My Requests', icon: 'FileText' }
  ]
};

// ============================================
// FRONTEND ROUTE PROTECTION (by role)
// ============================================

export const ROLE_ROUTES = {
  [ROLES.ADMIN]: [
    '/dashboard/admin', '/dashboard/departments', '/dashboard/categories', '/dashboard/people',
    '/dashboard/assets', '/dashboard/allocations', '/dashboard/transfers', '/dashboard/bookings',
    '/dashboard/maintenance', '/dashboard/audits', '/dashboard/reports', '/dashboard/activity',
    '/dashboard/settings', '/dashboard/copilot'
  ],
  [ROLES.ASSET_MANAGER]: [
    '/dashboard/manager', '/dashboard/assets', '/dashboard/allocations', '/dashboard/transfers',
    '/dashboard/bookings', '/dashboard/maintenance', '/dashboard/reports'
  ],
  [ROLES.DEPARTMENT_HEAD]: [
    '/dashboard/department', '/dashboard/department-assets', '/dashboard/department-employees',
    '/dashboard/bookings', '/dashboard/transfers'
  ],
  [ROLES.EMPLOYEE]: [
    '/dashboard/employee', '/dashboard/my-assets', '/dashboard/bookings', '/dashboard/my-requests'
  ]
};

export function hasAccess(role, route) {
  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some(r => route === r || route.startsWith(r + '/'));
}

// ============================================
// API PERMISSION MAP (keys WITHOUT leading slash)
// ============================================

export const API_PERMISSIONS = {
  'bootstrap': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]
  },
  'copilot': {
    POST: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]
  },
  'departments': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD],
    POST: [ROLES.ADMIN],
    PUT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  'categories': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    POST: [ROLES.ADMIN],
    PUT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  'users': {
    GET: [ROLES.ADMIN],
    POST: [ROLES.ADMIN],
    PUT: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN],
    PATCH: [ROLES.ADMIN]
  },
  'assets': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
    POST: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    PUT: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    DELETE: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    PATCH: [ROLES.ADMIN, ROLES.ASSET_MANAGER]
  },
  'allocations': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
    POST: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    PUT: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    DELETE: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    PATCH: [ROLES.ADMIN, ROLES.ASSET_MANAGER]
  },
  'transfers': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
    POST: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    PUT: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    PATCH: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    DELETE: [ROLES.ADMIN, ROLES.ASSET_MANAGER]
  },
  'bookings': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
    POST: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
    PUT: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
    DELETE: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]
  },
  'maintenance': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
    POST: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.EMPLOYEE],
    PUT: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    PATCH: [ROLES.ADMIN, ROLES.ASSET_MANAGER]
  },
  'audits': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER],
    POST: [ROLES.ADMIN],
    PUT: [ROLES.ADMIN],
    PATCH: [ROLES.ADMIN],
    DELETE: [ROLES.ADMIN]
  },
  'reports': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD]
  },
  'activity': {
    GET: [ROLES.ADMIN]
  },
  'notifications': {
    GET: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
    POST: [ROLES.ADMIN],
    PATCH: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE]
  },
  'settings': {
    GET: [ROLES.ADMIN],
    PUT: [ROLES.ADMIN]
  }
};

export function hasApiAccess(role, route, method) {
  const normalizedRoute = route.startsWith('/api') ? route.slice(4) : route;
  const allowedMethods = API_PERMISSIONS[normalizedRoute];
  if (!allowedMethods) {
    return role === ROLES.ADMIN;
  }
  const allowedRoles = allowedMethods[method];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function isAdmin(role) { return role === ROLES.ADMIN; }
export function isAssetManager(role) { return role === ROLES.ASSET_MANAGER; }
export function isDepartmentHead(role) { return role === ROLES.DEPARTMENT_HEAD; }
export function isEmployee(role) { return role === ROLES.EMPLOYEE; }
export function canManageAssets(role) { return [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(role); }
export function canManageUsers(role) { return role === ROLES.ADMIN; }
export function canManageDepartments(role) { return role === ROLES.ADMIN; }
export function canManageAllocations(role) { return [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(role); }
export function canApproveTransfers(role) { return [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD].includes(role); }
export function canApproveMaintenance(role) { return [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(role); }
export function canViewReports(role) { return [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD].includes(role); }
export function canManageBookings(role) { return [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE].includes(role); }