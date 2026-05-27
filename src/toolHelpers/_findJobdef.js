/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import _listJobdefs from './_listJobdefs.js';  
async function _findJobdef(params) {
    params.tool = 'find';
    return  await _listJobdefs(params);
}
export default _findJobdef;