import { Testsdk } from 'testsdk';

const sdk = new Testsdk({ accessToken: process.env.TESTSDK_ACCESS_TOKEN });

(async () => {
  const result = await sdk.main.appControllerGetHello();
  console.log(result);
})();
