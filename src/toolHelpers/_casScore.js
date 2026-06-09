/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import restaflib from '@sassoftware/restaflib';
import restaf from '@sassoftware/restaf';
async function _casScore(params) {
  let { model, name, scenario, _appContext } = params;
  let { casSetup, caslScore } = restaflib;

  let store = restaf.initStore(_appContext.storeConfig);
  let { session } = await casSetup(store, _appContext.logonPayload, null, _appContext.cas);
  if (session == null) {
    return { content: [{ type: 'text', text: 'Could not create a cas session' }] };
  }

  try {
    let args = {
      name: name,
      modelName: model,
      scenario: scenario
    }
    let output = await caslScore(store, session, args);
    let results = output.casResults;
    return { content: [{ type: 'text', text: JSON.stringify(results) }], structuredContent: results };
  } catch (err) {
    console.log(err);
    return { isError: true, content: [{ type: 'text', text: JSON.stringify(err) }] };
  }
}
export default _casScore;