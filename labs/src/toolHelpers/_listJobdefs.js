/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import restaf from '@sassoftware/restaf';


async function _listJobdefs(params) {
  let { limit, start, name, _appContext } = params;
  
  let store = restaf.initStore(_appContext.storeConfig);
  let msg = await store.logon(_appContext.logonPayload);

  try {
    let { jobDefinitions } = await store.addServices('jobDefinitions');
    let payload = {
      qs: {
        limit: (limit != null) ? limit : 10,
        start: start - 1
      }
    };

    if (name != null && name.trim().length > 0) {
      payload.qs = {
        filter: `eq(name, '${name}')`
      }
    }
    let jobDefList = await store.apiCall(jobDefinitions.links('job-definitions'), payload);
    if (jobDefList.itemsList().size === 0) {
      return { content: [{ type: 'text', text: 'No jobDefinitions found' }] };
    }

    let names = {};
    jobDefList.itemsList().map((id, n) => {
      let jname = jobDefList.items(id, 'name');
      let p = jobDefList.items(id, 'data', 'parameters');
      if (names[jname] == null) {
        names[jname] = { parameters: (p == null) ? {} : p.toJS() };
      }
    });

    let response = {jobDefinitions: Object.keys(names)};
    if (name != null) {
      response = { name: name, parameters: names[name].parameters };
    }

    return {
      content: [{ type: 'text', text: JSON.stringify(response) }],
      structuredContent: response,
      hint: (Object.keys(names).length === (limit || 10)) ? `next page start=${(start || 1) + (limit || 10)}` : undefined
    };
  } catch (err) {
    console.error('Error in _listJobdefs', err);
    return { isError: true, content: [{ type: 'text', text: `Error retrieving job definitions: ${err}` }] };

  }
}

export default _listJobdefs;