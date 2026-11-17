import { ParamListBase, RouteProp } from '@react-navigation/native';
import { ActorInterface } from 'Type/Actor.interface';

export interface ActorScreenContainerProps {
  route: RouteProp<ParamListBase, string>;
}

export interface ActorScreenComponentProps {
  isLoading: boolean;
  onNextLoad?: (isRefresh: boolean) => Promise<void>;
  isLoadError?: boolean;
  retryLoad?: () => void;
  actor: ActorInterface | null;
}
