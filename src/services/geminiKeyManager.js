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
    // Track keys confirmed as permanently invalid (401/403)
    this._deadKeys = new Set();
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
      this.keys = this._loadCandidateKeys();
    }
    if (this.keys.length === 0) {
      return '';
    }
    return this.keys[this.currentIndex % this.keys.length];
  }

  /**
   * Rotates to the next available API key in the pool, skipping dead keys.
   */
  rotateKey() {
    if (this.keys.length <= 1) {
      return this.getCurrentKey();
    }

    const startIndex = this.currentIndex;
    for (let i = 0; i < this.keys.length; i++) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      const candidate = this.keys[this.currentIndex];
      if (!this._deadKeys.has(candidate)) {
        console.warn(
          `[GeminiKeyManager] Chave alternada para índice ${this.currentIndex} (Total: ${this.keys.length}, Mortas: ${this._deadKeys.size})`
        );
        return candidate;
      }
    }
    // All keys are dead, reset to original
    this.currentIndex = startIndex;
    return this.getCurrentKey();
  }

  /**
   * Mark a key as permanently invalid (401 Unauthorized / 403 Forbidden).
   */
  markKeyDead(key) {
    this._deadKeys.add(key);
    console.warn(`[GeminiKeyManager] Chave marcada como inválida: ${key.substring(0, 12)}...`);
  }

  /**
   * Returns true if ALL keys are dead (invalid/blocked).
   */
  allKeysDead() {
    return this._deadKeys.size >= this.keys.length;
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
   * Checks if an error represents a permanent auth failure (invalid or blocked key).
   */
  isAuthError(error) {
    if (!error) return false;
    const msg = String(error?.message || error).toLowerCase();
    return (
      msg.includes('401') ||
      msg.includes('403') ||
      msg.includes('invalid authentication') ||
      msg.includes('api key not valid') ||
      msg.includes('api_key_invalid') ||
      msg.includes('permission_denied') ||
      msg.includes('blocked') ||
      msg.includes('credentials')
    );
  }

  /**
   * Executes a Gemini API call with automatic timeout protection (30s),
   * transparent key pool rotation upon 429 errors, and retry backoff.
   * 
   * IMPORTANT: Auth errors (401/403) immediately mark the key as dead
   * and either try the next key or fail fast — no long retries.
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
    // Cap max attempts to avoid infinite spinning
    const maxAttempts = options.maxKeyAttempts || Math.min(totalKeys + 2, 4);

    if (this.keys.length === 0) {
      throw new Error('API_KEY_MISSING');
    }

    // If all keys are already known-dead, fail immediately
    if (this.allKeysDead()) {
      throw new Error('API_KEY_INVALID: Todas as chaves de API configuradas são inválidas (401/403). Configure uma chave válida do Google AI Studio em VITE_GEMINI_API_KEY no .env.');
    }

    let lastError = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const apiKey = this.getCurrentKey();
      if (!apiKey) {
        throw new Error('API_KEY_MISSING');
      }

      // Skip known-dead keys
      if (this._deadKeys.has(apiKey)) {
        const nextKey = this.rotateKey();
        if (this._deadKeys.has(nextKey) || this.allKeysDead()) {
          throw new Error('API_KEY_INVALID: Todas as chaves de API configuradas são inválidas. Configure uma chave válida do Google AI Studio em VITE_GEMINI_API_KEY no .env.');
        }
        continue;
      }

      try {
        // Wrap execution in a resilient timeout
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

        // ── AUTH ERRORS: Mark key as dead and try next or fail fast ──
        if (this.isAuthError(err)) {
          this.markKeyDead(apiKey);
          if (this.allKeysDead()) {
            throw new Error('API_KEY_INVALID: Todas as chaves de API configuradas são inválidas (401/403). Gere uma chave gratuita em https://aistudio.google.com/app/apikey e configure em VITE_GEMINI_API_KEY no .env.');
          }
          this.rotateKey();
          continue;
        }

        // ── RATE LIMIT: Rotate key or brief wait ──
        if (this.isRateLimitError(err)) {
          if (this.keys.length > 1) {
            this.rotateKey();
            await new Promise((r) => setTimeout(r, 400));
            continue;
          } else {
            await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
            continue;
          }
        }

        // ── TIMEOUT: Fail immediately, don't retry ──
        if (err.message?.includes('TIMEOUT_ERROR')) {
          throw err;
        }

        // ── VALIDATION / SAFETY: Fail immediately ──
        if (err.message?.includes('VALIDATION_ERROR') || err.message?.includes('SAFETY')) {
          throw err;
        }

        // ── 503 / overloaded: brief wait then retry once ──
        if (err.message?.includes('503') || err.message?.includes('overloaded')) {
          await new Promise((r) => setTimeout(r, 800));
          continue;
        }

        // ── Generic error: try next key if available ──
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
