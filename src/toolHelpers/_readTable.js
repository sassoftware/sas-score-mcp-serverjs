/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import restafedit from '@sassoftware/restafedit';
import deleteSession from './deleteSession.js';

async function _readTable(params) {
  let { table, lib, start, limit, server, format, where, _appContext } = params;
 

  if (table.includes('.')) {
    let parts = table.split('.');
    lib = parts[0];
    table = parts[1];
  }
  let itable = { name: table };
  if (server === 'cas') {
    itable.caslib = lib;
  } else {
    itable.libref = lib;
  }
  let config = {
    casServerName: _appContext.cas,
    computeContext: _appContext.sas,
    source: (server === 'sas') ? 'compute' : server,
    casServer: _appContext.cas,
    table: itable,

    initialFetch: {
      qs: {
        start: (start == null) ? 0 : start - 1, // Adjust for 0-based index
        limit: limit,
        format: format || false,
        where: where || ''
      }
    }
  };

  let appControl = {};
  try {
    appControl = await restafedit.setup(
      _appContext.logonPayload,
      config,
      null,/* create a sessiion */
      {},
      'user',
      _appContext.storeConfig
    );
 
    await restafedit.scrollTable('first', appControl);
  
    let outdata = appControl.state.data.map((d) => {
      delete d._rowIndex;
      delete d._modified;
      delete d._index_;
      return d;
    });
    let tabled = { tabled: outdata };
    let t = (limit === 1) ? JSON.stringify(outdata[0]) : JSON.stringify(tabled);
    return { content: [{ type: 'text', text: t }], structuredContent: tabled };

  } catch (err) {
    await deleteSession(appControl);
    return { isError: true, content: [{ type: 'text', text: JSON.stringify(err) }],
     };
  }
}
export default _readTable;