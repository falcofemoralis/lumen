import { NativeModule, requireNativeModule } from 'expo';

declare class ReactNativeJsoupModule extends NativeModule {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  connect(url: string, params: string): Promise<string>;
  select(instanceId: string, selector: string): string[];
  elementAttr(instanceId: string, elementId: string, attr: string): string;
  elementSelect(instanceId: string, elementId: string, selector: string): string;
  elementText(instanceId: string, elementId: string): string;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ReactNativeJsoupModule>('ReactNativeJsoup');
