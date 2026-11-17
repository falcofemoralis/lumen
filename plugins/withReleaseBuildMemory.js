'use strict';

const { withGradleProperties } = require('@expo/config-plugins');

const HEAP_MB = 4096;
const defaultArgs = `-Xmx${HEAP_MB}m -XX:MaxMetaspaceSize=512m`;

function releaseBuildProperties(properties) {
  let hasHeap = false, hasWorkers = false;
  const result = properties.map(item => {
    if (item.type !== 'property') return item;
    if (item.key === 'org.gradle.workers.max') hasWorkers = true;
    if (item.key !== 'org.gradle.jvmargs') return item;
    hasHeap = true;
    const value = item.value || '';
    const heap = value.match(/(?:^|\s)-Xmx(\d+)([kmg])(?=\s|$)/i);
    const sizeMb = heap ? Number(heap[1]) * ({ k: 1 / 1024, m: 1, g: 1024 }[heap[2].toLowerCase()]) : 0;
    if (sizeMb >= HEAP_MB) return item;

    return { ...item, value: heap ? value.replace(/-Xmx\d+[kmg]/i, `-Xmx${HEAP_MB}m`)
      : `${value} -Xmx${HEAP_MB}m`.trim() };
  });
  // APK splits compress all native engines in parallel; Expo's 2 GiB default is insufficient.
  if (!hasHeap) result.push({ type: 'property', key: 'org.gradle.jvmargs', value: defaultArgs });
  if (!hasWorkers) result.push({ type: 'property', key: 'org.gradle.workers.max', value: '2' });

  return result;
}

module.exports = config => withGradleProperties(config, mod => ({
  ...mod, modResults: releaseBuildProperties(mod.modResults),
}));
module.exports.releaseBuildProperties = releaseBuildProperties;
