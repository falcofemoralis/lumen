export const normalizeNavigationOrder = (
  configuredOrder: string[],
  availableRoutes: string[],
  fallbackOrder: string[],
) => {
  const available = new Set(availableRoutes);
  const result: string[] = [];
  const seen = new Set<string>();

  const append = (route: string) => {
    if (!available.has(route) || seen.has(route)) {
      return;
    }

    seen.add(route);
    result.push(route);
  };

  configuredOrder.forEach(append);
  fallbackOrder.forEach(append);
  availableRoutes.forEach(append);

  return result;
};