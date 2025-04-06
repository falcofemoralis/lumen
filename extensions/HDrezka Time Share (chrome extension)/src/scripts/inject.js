const injectScript = (filePath, tag) => {
    const node = document.getElementsByTagName(tag)[0];
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', filePath);
    script.setAttribute('id', 'inject');
    node.appendChild(script);
}
injectScript(chrome.runtime.getURL('/src/web_app.js'), 'body');
