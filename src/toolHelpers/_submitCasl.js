/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import restaflib from '@sassoftware/restaflib';

async function _submitCasl(params) {
  let { src, args, _appContext } = params;

   let store = restaf.initStore(_appContext.storeConfig);
  
  let session = await restaflib.casSetup(store, _appContext.logonPayload, null, _appContext.cas);
  if (session == null) {
    return {content: [{ type: 'text', text: 'Could not create a cas session' }]};
  }

  try {
    try {
      let r = await caslRun(store, session, src, (args == null) ? {} : args, true);
      await store.apiCall( session.links( 'delete' ) );
    
      return {content: [{ type: 'text', text: JSON.stringify(r.items()) }], structuredContent: r.items() };
    } catch (err) {
      console.error(err);
      return { isError: true, content: [{ type: 'text', text: JSON.stringify(err) }] }; 
    }
  }
  catch (err) {
    console.error(err);
    await store.apiCall( session.links( 'delete' ) );
    return { isError: true, content: [{ type: 'text', text: JSON.stringify(err) }] }; 
  }
}
export default _submitCasl;