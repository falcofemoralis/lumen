// Web navigation can remount or retry a screen before its first commit.
// Keep the latest transition available until the next explicit navigation.
class DesktopRouterStore {
  private transitionData = new Map<string, unknown>();

  popData(key: string) {
    return this.transitionData.get(key) ?? null;
  }

  pushData(key: string, data: unknown) {
    this.transitionData.set(key, data);
  }
}

export default new DesktopRouterStore();
