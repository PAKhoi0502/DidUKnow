const ROLE_ADMIN = 'admin'
const ROLE_EDITOR = 'editor'

export function normalizeRoleName(roleName) {
  if (typeof roleName !== 'string') {
    return ''
  }

  return roleName.trim().toLowerCase()
}

export function resolveUserRoleName(user) {
  const directRoleName = normalizeRoleName(user?.role_name)
  if (directRoleName) {
    return directRoleName
  }

  const nestedRoleName = normalizeRoleName(user?.role?.name)
  if (nestedRoleName) {
    return nestedRoleName
  }

  return ''
}

export function hasAnyRole(user, allowedRoles = []) {
  const currentRole = resolveUserRoleName(user)
  if (!currentRole) {
    return false
  }

  return allowedRoles.some((role) => normalizeRoleName(role) === currentRole)
}

export function isAdmin(user) {
  return hasAnyRole(user, [ROLE_ADMIN])
}

export function isAdminOrEditor(user) {
  return hasAnyRole(user, [ROLE_ADMIN, ROLE_EDITOR])
}
