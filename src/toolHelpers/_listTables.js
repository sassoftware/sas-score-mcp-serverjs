/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import restafedit from '@sassoftware/restafedit';

async function _listTables(params) {
  let { server, lib, limit, start, name, _appContext} = params;
 
  let config = {
    casServerName: _appContext.cas,
    computeContext: _appContext.sas,
    source: (server === 'sas') ? 'compute' : server,
    table: null
  };
  
  try {
    let appControl = await restafedit.setup(
      _appContext.logonPayload,
      config,
      null,/* create a session */
      {},
      'user',
      _appContext.storeConfig
    );

    let payload = {
      qs: {
        limit: (typeof limit === 'number') ? limit : 10, // Use provided limit or default to 10
        start: (typeof start === 'number') ? Math.max(0, start - 1) : 0,
      }
    };

    if (name != null) {
      // Normalize to upper-case to match table name casing in CAS (e.g. COSTCHANGE)
      const nameVal = ('' + name).toUpperCase();
      payload.qs.filter = `eq(name, '${nameVal}')`;
    }

    let items = await restafedit.getTableList(lib, appControl, payload);
    let response = {tables: items};
    return {content: [{ type: 'text', text: JSON.stringify(response) }],
      structuredContent: response};
  } catch (err) {
    console.error(JSON.stringify(err));
    return {isError: true, content: [{ type: 'text', text: JSON.stringify(err) }] }
  }

};

export default _listTables;