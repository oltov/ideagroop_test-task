import products from '../src/assets/data-json/products.json';

/** True = 65%, False = 35% */
// eslint-disable-next-line arrow-body-style
const rejectByChance = () => {
  return Math.random() <= 0.35;
};

/** Emulate get request */
// eslint-disable-next-line consistent-return
export const getProducts = () => new Promise((resolve, reject) => {
  if (rejectByChance()) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return reject({
      // eslint-disable-next-line comma-dangle
      error: 'Server error'
    });
  }
  // eslint-disable-next-line radix
  const delay = parseInt(Math.random() * 1000);
  setTimeout(() => {
    resolve(products);
  }, delay);
});

/** Emulate delete request */
// eslint-disable-next-line consistent-return
export const deleteProducts = () => new Promise((resolve, reject) => {
  if (rejectByChance()) {
    // eslint-disable-next-line prefer-promise-reject-errors
    return reject({
      // eslint-disable-next-line comma-dangle
      error: 'Server error'
    });
  }
  // eslint-disable-next-line radix
  const delay = parseInt(Math.random() * 1000);
  setTimeout(() => {
    resolve({ message: 'deleted' });
  }, delay);
});
