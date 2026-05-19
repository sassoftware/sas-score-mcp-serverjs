/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import _listLibrary from './_listLibrary.js';  
async function _findLibrary(params) {
    return  await _listLibrary(params);
}
export default _findLibrary;