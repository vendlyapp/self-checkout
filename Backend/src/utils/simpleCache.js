/**
 * Simple in-memory TTL cache — O(1) get/set, automatic eviction of expired entries.
 * Patrón reutilizable similar al userCache en authMiddleware.js
 *
 * Uso:
 * const cache = new SimpleCache(5 * 60 * 1000); // 5 min TTL
 * cache.set('key', value);
 * const val = cache.get('key'); // null si expiró
 * cache.del('key'); // invalidación manual
 */

class SimpleCache {
  constructor(ttlMs, maxSize = 500) {
    this.store = new Map();
    this.ttlMs = ttlMs;
    this.maxSize = maxSize;

    // Limpieza periódica de entries expiradas — intervalo = ttl / 2
    this.cleanupInterval = setInterval(() => this._evictExpired(), ttlMs);
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value) {
    // Evict oldest entry if at capacity (FIFO)
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  // Evict expired entries periodically
  _evictExpired() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  // Destructor — limpia el intervalo si el servidor se apaga
  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

module.exports = SimpleCache;
