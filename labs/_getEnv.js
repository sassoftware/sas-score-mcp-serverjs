/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

async function _deval(params) {
  

 const varName = params.name;
return { content: [{ type: 'text', text: process.env[varName]}]};
}

export default _deval;
