export class RateLimiter {
  private tokens: Map<string, { count: number; expiresAt: number }> = new Map();

  constructor(private windowMs: number, private maxTokens: number) {}

  check(ip: string): boolean {
    const now = Date.now();
    const record = this.tokens.get(ip);

    if (!record) {
      this.tokens.set(ip, { count: 1, expiresAt: now + this.windowMs });
      return true;
    }

    if (now > record.expiresAt) {
      this.tokens.set(ip, { count: 1, expiresAt: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxTokens) {
      return false; // Rate limit exceeded
    }

    record.count += 1;
    return true;
  }
  
  reset(ip: string) {
      this.tokens.delete(ip);
  }
}

// Global instances for different routes
export const loginRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 mins
export const registerRateLimiter = new RateLimiter(60 * 60 * 1000, 10); // 10 attempts per hour
export const apiRateLimiter = new RateLimiter(60 * 1000, 60); // 60 requests per minute
