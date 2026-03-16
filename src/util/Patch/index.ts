import { storage } from 'Util/Storage';

export interface PatchInterface {
  name: string;
  apply: () => void;
}

export const applyPatch = (patch: PatchInterface) => {
  const appliedPatches: string[] = storage.getPatchStorage().getMMKVInstance().getAllKeys();

  if (appliedPatches.includes(patch.name)) {
    return;
  }

  try {
    patch.apply();

    storage.getPatchStorage().save(patch.name, true);
  } catch (error) {
    console.error(`Failed to apply patch ${patch.name}:`, error);
  }
};