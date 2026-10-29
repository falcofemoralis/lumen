export function createBufferedWriter(save, saveSync, delay = 50) {
  let timer, value, revision = 0, saved = 0, inFlight = false;
  const flush = async () => {
    clearTimeout(timer); timer = undefined;
    if (inFlight || saved === revision) return;
    inFlight = true;
    const current = revision;
    try {
      if (await save(value) === false) throw new Error('Storage write failed');
      saved = Math.max(saved, current);
    } catch (error) {
      console.error('[Storage] Could not persist data:', error);
    } finally {
      inFlight = false;
      if (revision > current) schedule();
    }
  };
  const schedule = () => { if (!timer) timer = setTimeout(flush, delay); };

  return {
    changed(next) { value = next; revision++; schedule(); },
    flush,
    flushSync() {
      clearTimeout(timer); timer = undefined;
      if (saved !== revision && saveSync(value) !== false) saved = revision;
    },
  };
}