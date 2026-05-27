/**
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

async function _findScr(params) {
  let {name} = params;
  let config = {
    method: 'HEAD',
    name: name + '/apiMeta/api',
    headers: {
      'Accept': 'application/json'
    }
  }
  try {
    console.error('[Note] Config:', config);
    let response = await axios(config);
    console.error('[Note] Response status:', response.status);
    if (response.status !== 200) {
      
      return {isError: true, content: [{ type: 'text', text: `SCR model ${name} not found` }]};
    } else if (response.status === 200) {
      let r = { scr: [name] };
      return { content: [{ type: 'text', text: JSON.stringify(r) }],
        structuredOutput: r

      };
    }
  }
  catch (error) {
    return {isError: true,content: [{ type: 'text', text: JSON.stringify(error) }]};  
  }
}
export default _findScr;
