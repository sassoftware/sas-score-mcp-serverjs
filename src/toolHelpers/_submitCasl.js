/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import restaf from '@sassoftware/restaf';
import restaflib from '@sassoftware/restaflib';

async function _submitCasl(params) {
  let { src, args, _appContext } = params;
  let { casSetup, caslRun } = restaflib;
  console.error(_appContext);
  let store = restaf.initStore(_appContext.storeConfig);

  let { session } = await casSetup(store, _appContext.logonPayload, null, _appContext.cas);
  if (session == null) {
    return { content: [{ type: 'text', text: 'Could not create a cas session' }] };
  }

  try {
    console.error(caslRun);
    debugger;
    let r = await caslRun(store, session, src, (args == null) ? {} : args);
    console.error(r.results);
    let response = (r.results == null) ? r : r.results; 
    await store.apiCall(session.links('delete'));
    return { content: [{ type: 'text', text: JSON.stringify(response) }], structuredContent: response };
  } catch (err) {
    console.error(err);
    if (session != null) {
      await store.apiCall(session.links('delete'));
    } 
    return { isError: true, content: [{ type: 'text', text: JSON.stringify(err) }] };
  }
}

export default _submitCasl;