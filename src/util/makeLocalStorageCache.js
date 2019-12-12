/**
 * Wraps browser storage to add caching w/ expiration;
 * Supports localStorage, sessionStorage, & in memory object (fallback)
 */

exports.makeLocalStorageCache = storage => {
  const store = storage || {}; // fallback to simple object

  return {
    getItem: key => {
      const now = new Date();
      const nowTime = now.getTime();
      const dataString = (store.getItem && store.getItem(key)) || store[key]; // fallback to simple object

      let data = (dataString && JSON.parse(dataString)) || {};

      if (nowTime > data.expires) {
        (store.removeItem && store.removeItem(key)) || delete store[key]; // fallback to simple object
        data = (store.getItem && store.getItem(key)) || store[key]; // fallback to simple object
        data = data && JSON.parse(data);
      }

      return data && data.cache;
    },
    setItem: (key, cache, ttl) => {
      const now = new Date();
      const nowTime = now.getTime();
      const minutes = 60;
      const defaultExpiration = nowTime + minutes * 60 * 1000;
      const expiration = nowTime + ttl || defaultExpiration;
      const cacheObj = {
        cache,
        expires: now.setTime(expiration)
      };
      const cacheObjStringified = JSON.stringify(cacheObj);

      if (store.setItem) {
        store.setItem(key, cacheObjStringified);
      } else {
        store[key] = cacheObjStringified; // fallback to simple object
      }
    }
  };
};
