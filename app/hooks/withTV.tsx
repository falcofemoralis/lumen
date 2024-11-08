import AppStore from 'Store/App.store';

type WithTVProps<T> = T & {};

export function withTV<T>(
  TvComponent: React.ComponentType<T>,
  Component: React.ComponentType<T>,
  props: WithTVProps<T> = {} as WithTVProps<T>
) {
  return AppStore.isTV ? <TvComponent {...props} /> : <Component {...props} />;
}
