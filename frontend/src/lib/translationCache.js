/**
 * Translation Cache Manager
 * 
 * Implements client-side caching for translations to prevent redundant API calls.
 * Uses a Map with composite keys (text + targetLanguage).
 */

class TranslationCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Generate a cache key from text and target language
   */
  _generateKey(text, targetLanguage) {
    return `${text.trim().toLowerCase()}|${targetLanguage.toLowerCase()}`;
  }

  /**
   * Get a cached translation
   * @returns {string|null} The cached translation or null if not found
   */
  get(text, targetLanguage) {
    const key = this._generateKey(text, targetLanguage);
    const cached = this.cache.get(key);

    if (cached) {
      // Update access time for LRU tracking
      cached.lastAccessed = Date.now();
      return cached.translation;
    }

    return null;
  }

  /**
   * Set a translation in cache
   */
  set(text, targetLanguage, translation) {
    const key = this._generateKey(text, targetLanguage);

    // If cache is full, remove the least recently used item
    if (this.cache.size >= this.maxSize) {
      this._evictLRU();
    }

    this.cache.set(key, {
      translation,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
    });
  }

  /**
   * Remove the least recently used item from cache
   */
  _evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Export a singleton instance
export const translationCache = new TranslationCache(100);

export default translationCache;
