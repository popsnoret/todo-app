// Persistence is a VG requirement. Each basic test starts with empty storage.
const storagePackage = '@react-native-async-storage/async-storage';
try {
  require.resolve(storagePackage);
  jest.doMock(storagePackage, () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
  );
  beforeEach(async () => {
    const storage = require(storagePackage);
    await (storage.default ?? storage).clear();
  });
} catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
