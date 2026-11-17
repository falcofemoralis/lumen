import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const { releaseBuildProperties } = createRequire(import.meta.url)('../plugins/withReleaseBuildMemory.js');
const property = (key: string, value: string) => ({ type: 'property', key, value });
const valueOf = (items: any[], key: string) => items.find(item => item.key === key)?.value;

test('release packaging raises the Expo heap default and preserves unrelated JVM flags', () => {
  const initial = [property('org.gradle.jvmargs', '-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8'),
    { type: 'comment', value: '# Local configuration' }];
  const result = releaseBuildProperties(initial);
  assert.equal(valueOf(result, 'org.gradle.jvmargs'), '-Xmx4096m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8');
  assert.equal(valueOf(result, 'org.gradle.workers.max'), '2');
  assert.equal(valueOf(initial, 'org.gradle.jvmargs'), '-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8');
  assert.deepEqual(releaseBuildProperties(result), result);
});
test('an existing larger heap and explicit worker limit survive prebuild', () => {
  const initial = [property('org.gradle.jvmargs', '-Xmx8g -Dfile.encoding=UTF-8'),
    property('org.gradle.workers.max', '1')];
  assert.deepEqual(releaseBuildProperties(initial), initial);
});
test('fresh prebuild adds bounded defaults without duplicating Gradle properties', () => {
  const result = releaseBuildProperties([]);
  assert.equal(valueOf(result, 'org.gradle.jvmargs'), '-Xmx4096m -XX:MaxMetaspaceSize=512m');
  assert.equal(valueOf(result, 'org.gradle.workers.max'), '2');
  assert.deepEqual(releaseBuildProperties(result), result);
});
