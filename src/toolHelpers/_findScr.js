/**
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

async function _findScr(params) {
  let {url} = params;
  let config = {
    method: 'HEAD',
    url: url + '/apiMeta/api',
    headers: {
      'Accept': 'application/json'
    }
  }
  try {
    console.error('[Note] Config:', config);
    let response = await axios(config);
    console.error('[Note] Response status:', response.status);
    if (response.status !== 200) {
      return {isError: true, content: [{ type: 'text', text: `SCR model ${url} not found` }]};
    } else if (response.status === 200) {
      return { content: [{ type: 'text', text: `Model ${url} is available` }]};
    }
  }
  catch (error) {
    return {isError: true,content: [{ type: 'text', text: JSON.stringify(error) }]};  
  }
}
export default _findScr;
