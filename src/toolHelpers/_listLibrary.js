/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import restafedit from '@sassoftware/restafedit';
import deleteSession from './deleteSession.js';

async function _listLibrary(params) {

  let { server, limit, start, name, _appContext } = params;
 
  const _ilistLibrary = async (params) => {
    let { server, limit, start, name, _appContext } = params;
    let config = {
      casServerName: _appContext.cas,
      computeContext: _appContext.sas,
      source: (server === 'sas') ? 'compute' : server,
      table: null
    };
    let appControl;
    try {
      // setup request control
      appControl = await restafedit.setup(
        _appContext.logonPayload,
        config
        , null, {}, 'user', {}, {}, _appContext.storeConfig
      );

      // query parameters
      let payload = {
        qs: {
          limit: (limit != null) ? limit : 10,
          start: start - 1
        }
      };

      if (name != null) {
        payload.qs = {
          filter: `eq(name, '${name}')`
        }
      }

      let items = await restafedit.getLibraryList(appControl, payload);
      if (server === 'cas'){
        items = items.map(item => {
          if (item.toLowerCase().includes('casuser')) {
            item = 'casuser';
          }
          return item;
        })

      }
      await deleteSession(appControl);
      return items;
    } catch (err) {
      console.error(JSON.stringify(err));
      if (appControl != null) {
        await deleteSession(appControl);
      }
      return { isError: true, content: [{ type: 'text', text: (typeof err === 'string') ? err :  JSON.stringify(err) }] };
    }
  }


  let response = {};
  let liblist = await _ilistLibrary({ server: server, limit, start, name, _appContext });
  let columns = [`${server} Library`];
  let rows = liblist;
  /* sample structured response
   { viewHint: 'singlelist', columns: [`cas Library`], rows: ['Samples', "Model"], nextToolPrompt: `list tables in cas library  ` }
  */

  // Paging buttons in the view post these prompts to the chat. A name filter returns one match, so no paging.
  let pageSize = limit ?? 10;
  let paging = name != null ? undefined : {
    nextPrompt: `list the next ${pageSize} ${server} libraries`,
    previousPrompt: `list the previous ${pageSize} ${server} libraries`,
    hasPrevious: (start ?? 1) > 1,
    hasNext: Array.isArray(rows) && rows.length >= pageSize, // a short page means we hit the end
  };
  response = { columns, rows, viewHint: 'singlelist', nextToolPrompt: `list tables in ${server} library #SELECTION`, paging };
  console.error(response);
  return {
    content: [{ type: 'text', text: `Library list for ${server}` }],
    structuredContent: response
  };
}

export default _listLibrary;