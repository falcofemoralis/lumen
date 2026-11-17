// Player initialization may be absent on restricted or partially rendered pages.
export const parseSeriesTranslatorId = (html: string): string | undefined =>
  html.match(/initCDNSeriesEvents\s*\(\s*\d+\s*,\s*(\d+)\s*(?:,|\))/)?.[1];
