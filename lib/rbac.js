export const ROLES = {
  ADMIN: 'Admin',
  ASSET_MANAGER: 'Asset Manager',
  DEPARTMENT_HEAD: 'Department Head',
  EMPLOYEE: 'Employee'
};

export const MENU_ITEMS = {
  [ROLES.ADMIN]: [
    { id: 'admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'departments', label: 'Departments', icon: 'Building2' },
    { id: 'categories', label: 'Asset Categories', icon: 'Tag' },
    { id: 'people', label: 'Employee Directory', icon: 'Users' },
    { id: 'assets', label: 'Assets', icon: 'Package' },
    { id: 'allocations', label: 'Allocations', icon: 'ArrowRightLeft' },
    { id: 'bookings', label: 'Bookings', icon: 'Calendar' },
    { id: 'maintenance', label: 'Maintenance', icon: 'Wrench' },
    { id: 'audits', label: 'Audits', icon: 'ClipboardCheck' },
    { id: 'reports', label: 'Reports', icon: 'FileBarChart' },
    { id: 'activity', label: 'Activity Logs', icon: 'Activity' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ],
  [ROLES.ASSET_MANAGER]: [
    { id: 'manager', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'assets', label: 'Assets', icon: 'Package' },
    { id: 'allocations', label: 'Allocations', icon: 'ArrowRightLeft' },
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

export const ROLE_ROUTES = {
  [ROLES.ADMIN]: ['/dashboard/admin', '/departments', '/categories', '/people', '/assets', '/allocations', '/bookings', '/maintenance', '/audits', '/reports', '/activity', '/settings'],
  [ROLES.ASSET_MANAGER]: ['/dashboard/manager', '/assets', '/allocations', '/bookings', '/maintenance', '/reports'],
  [ROLES.DEPARTMENT_HEAD]: ['/dashboard/department', '/department-assets', '/department-employees', '/bookings', '/transfers'],
  [ROLES.EMPLOYEE]: ['/dashboard/employee', '/my-assets', '/bookings', '/my-requests']
};

export function hasAccess(role, route) {
  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some(r => route === r || route.startsWith(r + '/'));
}

export function isAdmin(role) { return role === ROLES.ADMIN; }
export function isAssetManager(role) { return role === ROLES.ASSET_MANAGER; }
export function isDepartmentHead(role) { return role === ROLES.DEPARTMENT_HEAD; }
export function isEmployee(role) { return role === ROLES.EMPLOYEE; }
export function canManageAssets(role) { return [ROLES.ADMIN, ROLES.ASSET_MANAGER].includes(role); }
export function canManageUsers(role) { return role === ROLES.ADMIN; }
export function canManageDepartments(role) { return role === ROLES.ADMIN; }