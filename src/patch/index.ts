import { applyPatch } from 'Util/Patch';

import { UpdateAutomaticCDN } from './UpdateAutomaticCDN';

export const applyPatches = () => {
  const patches = [
    UpdateAutomaticCDN,
  ];

  for (const patch of patches) {
    applyPatch(patch);
  }
};