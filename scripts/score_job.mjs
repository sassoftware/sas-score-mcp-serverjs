import fs from 'fs';
import jobScore from '../src/toolSet/jobScore.js';

async function main() {
  // Build minimal _appContext from environment
  const VIYA_SERVER = process.env.VIYA_SERVER || null;
  let token = process.env.TOKEN || null;
  if (!token && process.env.TOKENFILE) {
    try { token = fs.readFileSync(process.env.TOKENFILE, 'utf8').trim(); } catch (e) { /* ignore */ }
  }

  const _appContext = {
    storeConfig: { casProxy: true, options: { ns: null, proxyServer: null, httpOptions: null } },
    logonPayload: (VIYA_SERVER && token) ? { host: VIYA_SERVER, authType: 'server', token: token, tokenType: 'Bearer' } : null,
    contexts: { host: VIYA_SERVER }
  };

  const spec = jobScore(_appContext);

  const params = {
    name: 'simplejob.job',
    scenario: 'a=1,b=2',
    _appContext: _appContext
  };

  try {
    const r = await spec.handler(params);
    console.log(JSON.stringify(r, null, 2));
  } catch (err) {
    console.error('Error invoking job-score:', err);
    process.exitCode = 2;
  }
}

main();
