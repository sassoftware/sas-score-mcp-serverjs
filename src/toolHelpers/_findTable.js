/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import _listTables from './_listTables.js';
async function _findTable(params) {
  return await _listTables(params);
}
export default _findTable;