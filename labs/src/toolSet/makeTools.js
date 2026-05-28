/*
 * Copyright Â© 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import listMas from './listMas.js';
import listTables from './listTables.js';
import masScore from './masScore.js';
import masDescribe from './masDescribe.js';
import findLibrary from './findLibrary.js';
import readTable from './readTable.js';
import tableDescribe from './tableDescribe.js';
import listLibraries from './listLibraries.js';

import scrDescribe from './scrDescribe.js';
import scrScore from './scrScore.js';

import devaScore from './devaScore.js';

import findTable from './findTable.js';
import findMas from './findMas.js';
import programScore from './programScore.js';
import macroScore from './macroScore.js';
import jobScore from './jobScore.js';
import listJobs from './listJobs.js';
import jobdefScore from './jobdefScore.js';
import findJob from './findJob.js';
import listJobdefs from './listJobdefs.js';
import findJobdef from './findJobdef.js';

import sasQuery from './sasQuery.js';
import setContext from './setContext.js';


function makeTools(_appContext) {
  // wrap all tools with 
  let customTools = [];

  // get the tool definitions and handler 
  let list = [
    listMas(_appContext),

    findMas(_appContext),
    masDescribe(_appContext),
    masScore(_appContext),

    scrDescribe(_appContext),
    scrScore(_appContext),

    findLibrary(_appContext),
    listLibraries(_appContext),
    findTable(_appContext),
    tableDescribe(_appContext),
    listTables(_appContext),
    readTable(_appContext),
    sasQuery(_appContext),

    programScore(_appContext),
    macroScore(_appContext),

    findJob(_appContext),
    listJobs(_appContext),
    jobScore(_appContext),
    listJobdefs(_appContext),
    findJobdef(_appContext),
    jobdefScore(_appContext),

    devaScore(_appContext),
    setContext(_appContext)
    
  ];
  let listWithCustom = list.concat(customTools);
  console.error(`\n[Note] Loaded a total of ${listWithCustom.length} tools.`);
  return listWithCustom;
}
export default makeTools;
