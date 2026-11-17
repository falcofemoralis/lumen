import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getCloudSyncSettingId, getCloudSyncSettingFromId } from '../src/config/cloudSync';
import { mergeCloudSyncState } from '../src/util/CloudSync/merge';
import type { CloudSyncState } from '../src/util/CloudSync/types';
test('Display density, navigation, device paths and hardware settings stay on each installation', () => {
  for (const key of ['numberOfColumnsMobile','numberOfColumnsTV','homeTabOrder','hiddenHomeTabs','tabPosition','tvTabPosition','homeDisplayMode','bookmarksDisplayMode','mobileNavigationOrder','tvNavigationOrder','recentTabsInterface','downloadsPath','playerSavedBrightness','playerBufferTimeSetting'] as const) {
    assert.equal(getCloudSyncSettingId(key),null,key);
    for(const prefix of ['', 'mobile:', 'atv:']) assert.equal(getCloudSyncSettingFromId(prefix+key)?.scope,'local',prefix+key);
  }
  assert.equal(getCloudSyncSettingId('showRatings'),'showRatings');
});
test('Old cloud UI settings are removed from merged uploads without changing shared content or rating preferences', () => {
  const state=(values:Record<string,unknown>,deviceId:string):CloudSyncState=>({schemaVersion:1,revision:1,updatedAt:1,deviceId,bookmarks:{categories:{},memberships:{}},history:{},playerTime:{},scheduleMarks:{},comments:{},settings:{values,metadata:Object.fromEntries(Object.keys(values).map(key=>[key,{updatedAt:1,deviceId}]))}});
  const local=state({'mobile:numberOfColumnsMobile':3,showRatings:true},'phone');
  const remote=state({'atv:numberOfColumnsTV':12,homeTabOrder:['Anime'],downloadsPath:'D:\\Downloads'},'pc');
  const merged=mergeCloudSyncState(local,remote);
  assert.deepEqual(merged.settings.values,{showRatings:true});
  assert.deepEqual(Object.keys(merged.settings.metadata),['showRatings']);
  assert.equal(local.settings.values['mobile:numberOfColumnsMobile'],3);
});