/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import restaflib  from '@sassoftware/restaflib';
import restaf from '@sassoftware/restaf';

async function _masDescribe(params) {
 // setup
  let {model, _appContext} = params;
  let { masSetup, masDescribe } = restaflib;
  let store = restaf.initStore(_appContext.storeConfig);
 
  try {
    let masControl = await masSetup(store, [model], _appContext.logonPayload);
    let describe = await masDescribe(masControl, model, null,true);
    let response = {decription: describe};
    return { content: [{ type: 'text', text: JSON.stringify(response) }],
      structuredContent: response
     };
  } catch (err) {
    console.error(err);
    return { isError: true, content: [{ type: 'text', text: JSON.stringify(err) }] };
  }
}

export default _masDescribe;