/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import restaf from '@sassoftware/restaf';
import restaflib from '@sassoftware/restaflib';
import _submitCode from './_submitCode.js';

async function _jobSubmit(params) {
  let { name, type, scenario, query, _appContext } = params;
  console.error(`_jobSubmit called with name: ${name} type: ${type} scenario: ${JSON.stringify(scenario)}`);
  // setup
  if (name === 'program') {
    let src = `
     proc sql;
     create table work.query_results as
     ${scenario.sql};
    quit; 
    data work.RESULT;
    set work.query_results;
    run;
    ;
    `;
    let iparams = {
      output: 'RESULT',
      limit: 100,
      args: {},
      src: src,
      _appContext: _appContext
    };

    try {
      let r = await _submitCode(iparams);
      let response = {tabled: r.structuredContent.tabled};
      return {
        content: [{ type: 'text', text: JSON.stringify(response) }],
        structuredContent: response
      };
    } catch (error) {
      console.error(`Error in _jobSubmit for program: ${JSON.stringify(error)}`);
      let result = {
        tables: { Error: [{ Message: "Job failed. Please contact the owner of the job " + name }] }
      };
      return { isError: true, content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
    }

  }
  else {

    // use a job or job definition
    try {
      let store = restaf.initStore(_appContext.storeConfig);
      let msg = await store.logon(_appContext.logonPayload);
      type = (type == null) ? 'job' : type.toLowerCase();
      
      let r = (type === 'definition' || type === 'def')
        ? await restaflib.jesRun(store, name, scenario)
        : await restaflib.jobRun(store, name, scenario);

      let response = (query === true) ? { tabled: r.tables.rows } : { tables: r.tables, listing: r.listing, log: r.log };
      
      return {
        content: [{ type: 'text', text: JSON.stringify(response) }],
        structuredContent: response
      };
    }
    catch (error) {
      // Oops! Something went wrong
      console.error(`Error in _jobSubmit: ${JSON.stringify(error)}`);
      let result = {
        tables: { Error: [{ Message: "Job failed. Please contact the owner of the job " + name }] }
      };
      return { isError: true, content: [{ type: 'text', text: JSON.stringify(result) }], structuredContent: result };
    }
  }
}

export default _jobSubmit;
