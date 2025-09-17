export const hash = (key, seed = 1) => {
  let h1;
  let h1b;
  let k1;
  let i;

  const remainder = key.length & 3;
  const bytes = key.length - remainder;
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  h1 = seed;
  i = 0;

  while (i < bytes) {
    k1 = (key.charCodeAt(i) & 0xff)
      | ((key.charCodeAt(++i) & 0xff) << 8)
      | ((key.charCodeAt(++i) & 0xff) << 16)
      | ((key.charCodeAt(++i) & 0xff) << 24);

    ++i;

    k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
    k1 = (k1 << 15) | (k1 >>> 17);
    k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

    h1 ^= k1;
    h1 = (h1 << 13) | (h1 >>> 19);
    h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
    h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
  }

  k1 = 0;

  switch (remainder) {
    case 3:
      k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      k1 ^= key.charCodeAt(i) & 0xff;
      k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16))
        & 0xffffffff;
      k1 = (k1 << 15) | (k1 >>> 17);
      k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16))
        & 0xffffffff;
      h1 ^= k1;
  }

  h1 ^= key.length;

  h1 ^= h1 >>> 16;
  h1 = ((h1 & 0xffff) * 0x85ebca6b
    + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16))
    & 0xffffffff;
  h1 ^= h1 >>> 13;
  h1 = ((h1 & 0xffff) * 0xc2b2ae35
    + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))
    & 0xffffffff;
  h1 ^= h1 >>> 16;

  return h1 >>> 0;
};

export const simpleHash = (key) => {
  let h = key;
  h = ((h << 5) - h) + 0x9e3779b9;
  h = h ^ (h >>> 16);
  h = h * 0x85ebca6b;
  h = h ^ (h >>> 13);
  h = h * 0xc2b2ae35;
  h = h ^ (h >>> 16);

  return (h >>> 0).toString(16).padStart(8, '0').substring(0, 5);
};