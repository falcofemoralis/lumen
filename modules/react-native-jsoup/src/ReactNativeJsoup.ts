import ReactNativeJsoupModule from './ReactNativeJsoupModule';

export class Element {
  id: string;
  instanceId: string;

  constructor(id: string, instanceId: string) {
    this.id = id;
    this.instanceId = instanceId;
  }

  attr(attr: string): string {
    return ReactNativeJsoupModule.elementAttr(this.instanceId, this.id, attr);
  }

  select(selector: string): Element|null {
    const elementId = ReactNativeJsoupModule.elementSelect(this.instanceId, this.id, selector);

    if (elementId === '') {
      return null;
    }

    return new Element(
      elementId,
      this.instanceId
    );
  }

  text(): string {
    return ReactNativeJsoupModule.elementText(this.instanceId, this.id);
  }
}

export class ReactNativeJsoup {
  private instanceId: string = '';

  async connect(url: string, params: string): Promise<ReactNativeJsoup> {
    const instanceId = await ReactNativeJsoupModule.connect(url, params);
    this.instanceId = instanceId;

    return this;
  }

  select(selector: string): Element[] {
    const elementIds = ReactNativeJsoupModule.select(this.instanceId, selector);

    return elementIds.map((elementId: string) => new Element(elementId, this.instanceId));
  }
}
