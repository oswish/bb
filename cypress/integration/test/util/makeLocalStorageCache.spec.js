import { makeLocalStorageCache } from '../../../../src/util/makeLocalStorageCache';

var CACHE_KEY, localCacheStorage;

CACHE_KEY = 'mt-data';

localCacheStorage = makeLocalStorageCache();

localCacheStorage.setItem(CACHE_KEY, { hello: 'world' }, 1000);

describe('makeLocalStorageCache', function() {
  it('should get cache that is not expired', function() {
    expect(localCacheStorage.getItem(CACHE_KEY).hello).to.equal('world');
  });

  it('should return `undefined` for expired cache', function() {
    setTimeout(() => {
      expect(localCacheStorage.getItem(CACHE_KEY)).to.equal(undefined);
    }, 2000);
  });
});
