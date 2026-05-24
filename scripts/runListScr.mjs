#!/usr/bin/env node
import listScr from '../src/toolSet/listScr.js';

async function run() {
  const appContext = { brand: 'sas-score' };
  const spec = listScr(appContext);
  try {
    const res = await spec.handler({});
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error running listScr:', err);
    process.exit(1);
  }
}

run();
