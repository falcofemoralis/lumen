import { useMemo } from 'react';
import { uniqueId } from 'Util/Math';

export const useUniqueId = ({ prefix }: { prefix?: string } = {}) =>
  useMemo(() => uniqueId(prefix), [prefix]);
