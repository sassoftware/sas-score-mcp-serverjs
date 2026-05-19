/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import _listModels from './_listModels.js';  
async function _findModel(params) {
    let r = await _listModels(params);
    console.log ("findModel result:" , r);
    return r;
}
export default _findModel;