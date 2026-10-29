import { SourceBlockedError } from './Request/sourceFailure';
type Task = { key: string; background: boolean; group?: string; execute: (signal: AbortSignal) => Promise<unknown>; resolve: (value: unknown) => void; reject: (error: unknown) => void };
/** Read-only Rezka traffic. Playback and account mutations do not use this queue. */
export class RezkaReadQueue {
  private tasks: Task[] = [];
  private pending = new Map<string, Promise<unknown>>();
  private draining = false;
  private lastStarted = 0;
  private blockedUntil = 0;
  private blockedError: unknown;
  constructor(private interval = 1500, private timeout = 25000, private canTimeout = () => true, private now = () => Date.now(), private hardTimeout = Math.max(timeout, 4 * 60_000)) {}
  run<T>(key: string, execute: (signal: AbortSignal) => Promise<T>, background = false, group?: string): Promise<T> {
    if (this.now() < this.blockedUntil) return Promise.reject(this.blockedError);
    const existing = this.pending.get(key);
    if (existing) {
      if (!background) { const task = this.tasks.find((item) => item.key === key); if (task) task.background = false; }
      return existing as Promise<T>;
    }
    if (group) {
      for (let index = this.tasks.length - 1; index >= 0; index--) {
        const task = this.tasks[index];
        if (task.group === group) {
          this.tasks.splice(index, 1);
          this.pending.delete(task.key);
          task.reject(new Error('Устаревший запрос подсказок отменён.'));
        }
      }
    }
    const promise = new Promise<T>((resolve, reject) => { this.tasks.push({ key, execute, background, group, resolve, reject } as Task); });
    this.pending.set(key, promise);
    void this.drain();
    return promise;
  }
  private async drain() {
    if (this.draining) return;
    this.draining = true;
    try {
      while (this.tasks.length) {
        const delay = Math.max(0, this.interval - (this.now() - this.lastStarted));
        if (delay) await new Promise<void>((resolve) => setTimeout(resolve, delay));
        const foreground = this.tasks.findIndex((task) => !task.background);
        const task = this.tasks.splice(foreground < 0 ? 0 : foreground, 1)[0];
        if (this.now() < this.blockedUntil) { this.pending.delete(task.key); task.reject(this.blockedError); continue; }
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        let deferred = false;
        const deadlineStartedAt = Date.now();
        const deadline = new Promise<never>((_, reject) => {
          const check = () => {
            const remaining = this.hardTimeout - (Date.now() - deadlineStartedAt);
            if (remaining <= 0) { controller.abort(); reject(new Error('HDRezka не ответила вовремя.')); }
            else if (!this.canTimeout()) { deferred = true; timer = setTimeout(check, Math.min(1000, remaining)); }
            else if (deferred) { deferred = false; timer = setTimeout(check, this.timeout); }
            else { controller.abort(); reject(new Error('HDRezka не ответила вовремя.')); }
          };
          timer = setTimeout(check, this.timeout);
        });
        this.lastStarted = this.now();
        try { task.resolve(await Promise.race([task.execute(controller.signal), deadline])); }
        catch (error) {
          if (error instanceof SourceBlockedError) {
            this.blockedUntil = this.now() + 5 * 60_000;
            error.retryAt = this.blockedUntil;
            this.blockedError = error;
            for (const waiting of this.tasks.splice(0)) { this.pending.delete(waiting.key); waiting.reject(error); }
          }
          task.reject(error);
        } finally { if (timer !== undefined) clearTimeout(timer); this.pending.delete(task.key); }
      }
    } finally { this.draining = false; }
  }
}