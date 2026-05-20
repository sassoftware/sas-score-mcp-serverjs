/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import _listMas from './_listMas.js';  
async function _findMas(params) {
    let r = await _listMas(params);
    console.log ("findMas result:" , r);
    return r;
}
export default _findMas;