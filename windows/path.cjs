const path = require('node:path');
const safeSegment = segment => {
  let result = segment.replace(/[<>:"|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/, '');
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(result)) result = '_' + result;
  return result || '_';
};
const portablePath = (base, input) => {
  const root = path.resolve(base), file = path.resolve(input);
  const relative = path.relative(root, file);
  if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw new Error('Path outside granted directory');
  if (!relative) return root;
  return path.join(root, ...relative.split(path.sep).map(safeSegment));
};
module.exports = { portablePath, safeSegment };
