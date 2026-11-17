let current = window.lumen.googleCurrent();
let pending = null;

const signInWithFeedback = async () => {
  const overlay = document.createElement('div');
  overlay.id = 'lumen-google-signin';
  overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true');
  overlay.style.cssText = 'position:fixed;inset:36px 0 0;z-index:2147483646;background:#000c;display:flex;align-items:center;justify-content:center;padding:24px';
  const panel = document.createElement('div');
  panel.style.cssText = 'background:#171717;color:white;max-width:520px;padding:28px;border-radius:12px;font:16px Segoe UI;line-height:1.5';
  const title = document.createElement('h3'); title.textContent = 'Подключение Google Drive';
  const message = document.createElement('p'); message.setAttribute('role', 'status');
  const update = phase => {
    message.textContent = phase === 'setup'
      ? 'Для Windows нужен OAuth-клиент типа Desktop app. В открывшемся окне выберите его JSON-файл из Google Cloud. Пароль и secret вводить вручную не нужно.'
      : phase === 'browser'
        ? 'Вход открыт в системном браузере. Выберите аккаунт Google и разрешите синхронизацию, затем вернитесь в Lumen.'
        : 'Подготавливаем подключение Google Drive…';
  };
  update('starting'); panel.append(title, message); overlay.appendChild(panel); document.body.appendChild(overlay);
  const unsubscribe = window.lumen.onGooglePhase(update);
  try {
    const result = await window.lumen.googleSignIn();
    if (result.type === 'success') current = result.data;
    overlay.remove();
    return result;
  } catch (error) {
    title.textContent = 'Не удалось подключить Google Drive';
    message.setAttribute('role', 'alert');
    message.textContent = String(error.message || error).replace(/^Error invoking remote method '[^']+': Error: /, '');
    const close = document.createElement('button'); close.textContent = 'Закрыть';
    close.style.cssText = 'padding:10px 20px;background:#303030;color:white;border:1px solid #666;border-radius:6px;cursor:pointer';
    close.onclick = () => overlay.remove(); panel.appendChild(close); close.focus();
    throw error;
  } finally { unsubscribe(); }
};

export const GoogleOneTapSignIn = {
  configure() {}, checkPlayServices: async () => true, getCurrentUser: () => current,
  signIn() {
    if (pending) return pending;
    document.getElementById('lumen-google-signin')?.remove();
    pending = signInWithFeedback().finally(() => { pending = null; });
    return pending;
  },
  createAccount() { return this.signIn(); },
  getTokens: () => window.lumen.googleTokens(),
  requestScopes: () => window.lumen.googleTokens(),
  clearCachedAccessToken: () => window.lumen.googleInvalidate(),
  async signOut() { await window.lumen.googleSignOut(); current = null; }
};
export const isErrorWithCode = error => typeof error?.code === 'string';
export const statusCodes = {};
