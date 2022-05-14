import CcCvDriver from './CcCv-driver';

const COUNTER = 1000;

async function main() {
  const store = new CcCvDriver('localhost', 8888);


  await store.connect();

  for (let k = 0; k < COUNTER; k++) {
    await store.setData(`key_${k}`, `data_${k}_ooppp`);
  }

  for (let k = 0; k < COUNTER; k++) {
    const data = await store.getData(`key_${k}`);
    console.log(k, data);
  }

  for (let k = 0; k < COUNTER; k++) {
    await store.removeData(`key_${k}`);
  }
}


main();
