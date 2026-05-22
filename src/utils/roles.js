export function isStaffRole(role) {
  return role === 'admin' || role === 'staff';
}

export function isAdminRole(role) {
  return role === 'admin';
}

export function roleLabel(role) {
  if (role === 'admin') return 'Administrator';
  if (role === 'staff') return 'Staff';
  return 'Customer';
}
