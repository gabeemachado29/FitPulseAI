/**
 * FitPulseAI — Gemini API Key Manager & Resilient Fallback Pool
 * 
 * Manages multiple Gemini API keys configured in environment variables,
 * handles transparent key rotation upon encountering Rate Limits (429 / RESOURCE_EXHAUSTED),
 * and enforces a resilient 30-second execution timeout.
 */

class GeminiKeyPoolManager {
  constructor() {
    this.keys = this._loadCandidateKeys();
    this.currentIndex = 0;
  }

  /**
   * Scans environment variables for all configured Gemini API keys.
   */
  _loadCandidateKeys() {
    const keys = [];

    // Helper to validate a key candidate
    const isValidKey = (k) =>
      typeof k === 'string' &&
      k.trim().length > 10 &&
      !k.includes('your_gemini') &&
      !k.includes('your_api_key');

    // 1. Primary Gemini Key
    const primaryGemini = import.meta.env.VITE_GEMINI_API_KEY;
    if (isValidKey(primaryGemini)) {
      keys.push(primaryGemini.trim());
    }

    // 2. Fallback pool keys (VITE_GEMINI_API_KEY_1, VITE_GEMINI_API_KEY_2, etc.)
    for (let i = 1; i <= 5; i++) {
      const poolKey = import.meta.env[`VITE_GEMINI_API_KEY_${i}`];
      if (isValidKey(poolKey) && !keys.includes(poolKey.trim())) {
        keys.push(poolKey.trim());
      }
    }

    // 3. Fallback to Firebase API Key if valid
    const firebaseKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (isValidKey(firebaseKey) && !keys.includes(firebaseKey.trim())) {
      keys.push(firebaseKey.trim());
    }

    return keys;
  }

  /**
   * Returns the current active API key.
   */
  getCurrentKey() {
    if (this.keys.length === 0) {
      // Reload in case env variables were populated dynamically
      this.keys = this._loadCandidateKeys();
    }
    if (this.keys.length === 0) {
      return '';
    }
    return this.keys[this.currentIndex % this.keys.length];
  }

  /**
   * Rotates to the next available API key in the pool.
   */
  rotateKey() {
    if (this.keys.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      console.warn(
        `[GeminiKeyManager] Chave de API alternada para o índice ${this.currentIndex} (Total: ${this.keys.length})`
      );
      return this.getCurrentKey();
    }
    return this.getCurrentKey();
  }

  /**
   * Checks if an error represents a rate limit, quota exhaustion or temporary server throttling.
   */
  isRateLimitError(error) {
    if (!error) return false;
    const msg = String(error?.message || error).toLowerCase();
    const status = error?.status;
    return (
      status === 429 ||
      msg.includes('429') ||
      msg.includes('resource_exhausted') ||
      msg.includes('quota') ||
      msg.includes('rate_limit') ||
      msg.includes('too many requests') ||
      msg.includes('exceeded your current quota')
    );
  }

  /**
   * Executes a Gemini API call with automatic timeout protection (30s),
   * transparent key pool rotation upon 429 errors, and retry backoff.
   *
   * @template T
   * @param {(apiKey: string) => Promise<T>} apiCallFn
   * @param {object} [options]
   * @param {number} [options.timeoutMs=30000] - Resilient timeout in milliseconds (default 30s)
   * @param {number} [options.maxKeyAttempts] - Max key rotation attempts
   * @returns {Promise<T>}
   */
  async executeWithFallback(apiCallFn, options = {}) {
    const timeoutMs = options.timeoutMs || 30000;
    const totalKeys = Math.max(1, this.keys.length);
    const maxAttempts = options.maxKeyAttempts || Math.max(3, totalKeys * 2);

    let lastError = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const apiKey = this.getCurrentKey();
      if (!apiKey) {
        throw new Error('API_KEY_MISSING');
      }

      try {
        // Wrap execution in a resilient 30-second timeout
        const result = await Promise.race([
          apiCallFn(apiKey),
          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    'TIMEOUT_ERROR: A resposta da IA excedeu o tempo limite de 30 segundos. Verifique sua conexão.'
                  )
                ),
              timeoutMs
            )
          ),
        ]);

        return result;
      } catch (err) {
        lastError = err;
        console.warn(`[GeminiKeyManager] Tentativa ${attempt + 1}/${maxAttempts} falhou:`, err.message);

        // If rate limit or quota exceeded, rotate key immediately and retry
        if (this.isRateLimitError(err)) {
          if (this.keys.length > 1) {
            this.rotateKey();
            // Short jitter before retrying next key
            await new Promise((r) => setTimeout(r, 400));
            continue;
          } else {
            // Single key with rate limit: wait briefly before retrying
            await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
            continue;
          }
        }

        // If 404 (model not found on this endpoint/version) or 503 (server overloaded), retry or pass
        if (err.message?.includes('503') || err.message?.includes('overloaded')) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }

        // For non-retryable errors (e.g. invalid input, strict safety block), rethrow immediately
        if (err.message?.includes('VALIDATION_ERROR') || err.message?.includes('SAFETY')) {
          throw err;
        }

        // For model version or generic errors, try next attempt
        if (attempt < maxAttempts - 1) {
          this.rotateKey();
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }

        throw err;
      }
    }

    throw lastError || new Error('API_KEY_EXHAUSTED');
  }
}

export const GeminiKeyManager = new GeminiKeyPoolManager();
export default GeminiKeyManager;
