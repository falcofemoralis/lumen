/* eslint-disable max-len */
const v = {
  enc2: 'h',
  bk0: '$$#!!@#!@##',
  bk1: '^^^!@##!!##',
  bk2: '####^!!##!@@',
  bk3: '@@@@@!##!^^^',
  bk4: '$$!!@$$@^!@#$$@',
  file3_separator: '//_//',
};

export const decodeUrl = (y) => {
  y = y.replace(/(\r\n|\n|\r)/gm, '');

  if (y.indexOf(`#${v.enc2}`) === 0) {
    y = decode(y);
  }

  return y;
};

const exist = (x) => x != null && typeof (x) !== 'undefined' && x !== 'undefined';

const decode = (x) => {
  function b1(str) {
    const res = btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      (match, p1) => String.fromCharCode(`0x${p1}`)));

    return res;
  }

  function b2(str) {
    const res = decodeURIComponent(atob(str).split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join(''));

    return res;
  }

  let a;
  a = x.substr(2);
  for (let i = 4; i > -1; i--) {
    if (exist(v[`bk${i}`])) {
      if (v[`bk${i}`] !== '') {
        a = a.replace(v.file3_separator + b1(v[`bk${i}`]), '');
      }
    }
  }
  try {
    a = b2(a);
  } catch (e) {
    a = '';
  }

  return a;
};
