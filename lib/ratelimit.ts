const store: Record<string, { count: number; reset: number }> =
  (globalThis as any).__rl_store || ((globalThis as any).__rl_store = {});

export function rateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const e = store[key];
  if (!e || now > e.reset) {
    store[key] = { count: 1, reset: now + windowMs };
    return true;
  }
  e.count += 1;
  return e.count <= max;
}
