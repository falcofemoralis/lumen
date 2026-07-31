import type { LucideProps } from 'lucide-react-native';
import { createElement, forwardRef } from 'react';
import * as NativeSvg from 'react-native-svg';

/**
 * Local port of lucide's `createLucideIcon`.
 *
 * The factory is only reachable through the package barrel, and importing that
 * barrel pulls all ~1750 icon modules into the bundle -- the exact cost the
 * per-icon `lucide-react-native/icons/*` imports elsewhere exist to avoid.
 * Kept behaviourally identical to the upstream `Icon` component, minus the
 * `LucideContext` lookup (the app never mounts a provider, so every value came
 * from the defaults below anyway).
 */

const DEFAULT_ATTRIBUTES = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

const CHILD_DEFAULT_ATTRIBUTES = {
  fill: DEFAULT_ATTRIBUTES.fill,
  stroke: DEFAULT_ATTRIBUTES.stroke,
  strokeWidth: DEFAULT_ATTRIBUTES.strokeWidth,
  strokeLinecap: DEFAULT_ATTRIBUTES.strokeLinecap,
  strokeLinejoin: DEFAULT_ATTRIBUTES.strokeLinejoin,
} as const;

export type IconNode = [tag: string, attrs: Record<string, unknown>][];

export const createLucideIcon = (iconName: string, iconNode: IconNode) => {
  const Component = forwardRef<NativeSvg.Svg, LucideProps>(({
    color,
    size,
    strokeWidth,
    absoluteStrokeWidth,
    children,
    ...rest
  }, ref) => {
    const resolvedSize = size ?? DEFAULT_ATTRIBUTES.width;
    const calculatedStrokeWidth = absoluteStrokeWidth
      ? (Number(strokeWidth ?? DEFAULT_ATTRIBUTES.strokeWidth) * 24) / Number(resolvedSize)
      : strokeWidth ?? DEFAULT_ATTRIBUTES.strokeWidth;

    const customAttrs = {
      stroke: color ?? DEFAULT_ATTRIBUTES.stroke,
      strokeWidth: calculatedStrokeWidth,
      ...rest,
    };

    return createElement(
      NativeSvg.Svg,
      {
        ref,
        ...DEFAULT_ATTRIBUTES,
        width: resolvedSize,
        height: resolvedSize,
        ...customAttrs,
      },
      [
        ...iconNode.map(([tag, attrs]) => {
          const upperCasedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

          return createElement(
            NativeSvg[upperCasedTag as keyof typeof NativeSvg] as never,
            { ...CHILD_DEFAULT_ATTRIBUTES, ...customAttrs, ...attrs }
          );
        }),
        ...(Array.isArray(children) ? children : [children]),
      ]
    );
  });

  Component.displayName = iconName;

  return Component;
};

export default createLucideIcon;
