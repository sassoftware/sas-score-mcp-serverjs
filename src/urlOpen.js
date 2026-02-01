/*
 * Copyright © 2026, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import open from 'open';

async function urlOpen(url) {
  
  console.error(`[Note]Opening URL: ${url} for user authentication`); 
  await open(url, {wait:true});
  console.error(`[Note] User has closed the informational window after authentication.`);
}
export default urlOpen;