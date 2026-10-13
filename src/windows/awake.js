export const activateKeepAwakeAsync = tag => window.lumen.awake(tag || 'default', true);
export const deactivateKeepAwake = tag => window.lumen.awake(tag || 'default', false);
