/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import restaf from '@sassoftware/restaf';

async function _listJobs(params) {
  let { limit, start, name, _appContext } = params;

  let store = restaf.initStore(_appContext.storeConfig);
  let msg = await store.logon(_appContext.logonPayload);


  let { jobExecution } = await store.addServices('jobExecution');
  try {
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
    console.error('payload', JSON.stringify(payload, null, 2));
    let jobList = await store.apiCall(jobExecution.links('jobs'), payload);
    if (jobList.itemsList().size === 0) {
      return { content: [{ type: 'text', text: 'No jobs found' }] };
    }

    let names = {};
    
    jobList.itemsList().map((id, n) => {
      let jname = jobList.items(id, 'data', 'jobRequest', 'name');
      
      if (names[jname] == null) {
        let value = jobList.items(id, 'data', 'jobRequest', 'jobDefinition', 'parameters');
        names[jname] = {parameters: (value == null) ? {} : value.toJS() };
      }
    });

    let response  = {jobs: Object.keys(names)};

    if (name != null) {
      response = { name: name, parameters: names[name].parameters };
    };
    return {
      content: [{ type: 'text', text: JSON.stringify(response) }],
      structuredContent: response,
      hint: (Object.keys(names).length === (limit || 10)) ? `next page start=${(start || 1) + (limit || 10)}` : undefined
    };
  } catch (err) {
    console.error('Error in _listJobs', err);
    return { isError: true, content: [{ type: 'text', text: `Error retrieving jobs: ${err}` }] };

  }
}

export default _listJobs;