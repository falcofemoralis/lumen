import ConfigStore from 'Store/Config.store';

type WithTVProps<T> = T & object;

export function withTV<T>(
  TvComponent: React.ComponentType<T>,
  Component: React.ComponentType<T>,
  props: WithTVProps<T> = {} as WithTVProps<T>,
) {
  return ConfigStore.isTV() ? <TvComponent { ...props } /> : <Component { ...props } />;
}
