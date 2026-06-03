const { HTTP_STATUS } = require('../types');

/**
 * Ensures ADMIN can only access resources owned by their store/user.
 * SUPER_ADMIN bypasses checks.
 */
function assertStoreAccess(user, resourceStoreId) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  if (!resourceStoreId) return false;
  return user.storeId === resourceStoreId;
}

function assertProductOwner(user, ownerId) {
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;
  const uid = user.userId ?? user.id;
  return ownerId === uid;
}

function forbidden(res, message = 'Access denied') {
  return res.status(HTTP_STATUS.FORBIDDEN).json({ success: false, error: message });
}

function notFound(res, message = 'Resource not found') {
  return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, error: message });
}

module.exports = {
  assertStoreAccess,
  assertProductOwner,
  forbidden,
  notFound,
};
