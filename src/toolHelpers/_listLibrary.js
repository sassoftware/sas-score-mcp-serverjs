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
      let response = { libraries: items };
      await deleteSession(appControl);

      return {
        content: [{ type: 'text', text: JSON.stringify(response) }],
        structuredContent: response
      };
    } catch (err) {
      console.error(JSON.stringify(err));
      if (appControl != null) {
        await deleteSession(appControl);
      }
      return { isError: true, content: [{ type: 'text', text: (typeof err === 'string') ? err :  JSON.stringify(err) }] };
    }
  }

  let source = (server === 'all') ? ['sas', 'cas'] : [server];
  let response = {};

  for (let i = 0; i < source.length; i++) {
    let liblist = await _ilistLibrary({ server: source[i], limit, start, name, _appContext });
    response[source[i]] = liblist.structuredContent;
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(response) }],
    structuredContent: response
  };
}

export default _listLibrary;