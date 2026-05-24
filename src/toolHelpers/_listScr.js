/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

async function _listScr(params) {
  let response = { scr: [] };
  return {
    content: [{ type: 'text', text: JSON.stringify(response) }],
    structuredContent: response
  }
}
export default _listScr;