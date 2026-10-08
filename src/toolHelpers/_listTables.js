/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import restafedit from '@sassoftware/restafedit';
import deleteSession from './deleteSession.js';

async function _listTables(params) {
  let { server, lib, limit, start, name, _appContext} = params;
 
  let config = {
    casServerName: _appContext.cas,
    computeContext: _appContext.sas,
    source: (server === 'sas') ? 'compute' : server,
    table: null
  };
  
  let appControl;
  try {
    appControl = await restafedit.setup(
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
    await deleteSession(appControl);
    appControl = null;
    // Paging buttons in the view post these prompts to the chat. A name filter returns one match, so no paging.
    let pageSize = payload.qs.limit;
    let where = `in ${server ? server + ' ' : ''}library ${lib}`;
    let paging = name != null ? undefined : {
      nextPrompt: `list the next ${pageSize} tables ${where}`,
      previousPrompt: `list the previous ${pageSize} tables ${where}`,
      hasPrevious: payload.qs.start > 0,
      hasNext: Array.isArray(items) && items.length >= pageSize, // a short page means we hit the end
    };
    let response = {viewHint: 'singlelist', columns: [`${lib} Tables`], rows: items,
                       nextToolPrompt: `read ${lib}.#SELECTION `,
                       paging
                     };
    return {content: [{ type: 'text', text: `List of tables in library ${lib} ` }],
      structuredContent: response};
  } catch (err) {
    console.error(JSON.stringify(err));
    if (appControl != null) {
      await deleteSession(appControl);
    }
    return {isError: true, content: [{ type: 'text', text: (typeof err === 'string') ? err : JSON.stringify(err) }] }
  }

};

export default _listTables;