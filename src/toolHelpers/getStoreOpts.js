/**
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

function getStoreOpts(_appContext) {
  
  let opts = _appContext.contexts.viyaCert;
  let storeOpts = {
    casProxy: true,
    httpOptions: { ...opts, rejectUnauthorized: true }
  }
  return storeOpts;
}
export default getStoreOpts;