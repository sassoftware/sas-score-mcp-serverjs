/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import _listJobs from './_listJobs.js';  
async function _findJob(params) {
    let r = await _listJobs(params);
    console.log ("findJob result:" , r);
    return r;
}
export default _findJob;