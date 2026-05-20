/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import listMas from './listMas.js';


import masScore from './masScore.js';
import masInfo from './masInfo.js';
import findMas from './findMas.js';

import findLibrary from './findLibrary.js';
import listLibraries from './listLibraries.js';

import listTables from './listTables.js';
import findTable from './findTable.js';
import tableInfo from './tableInfo.js';
import readTable from './readTable.js';

import scrInfo from './scrInfo.js';
import scrScore from './scrScore.js';

import devaScore from './devaScore.js';



import runProgram from './runProgram.js';
import runMacro from './runMacro.js';
import runJob from './runJob.js';
import listJobs from './listJobs.js';
import runJobdef from './runJobdef.js';
import findJob from './findJob.js';
import listJobdefs from './listJobdefs.js';
import findJobdef from './findJobdef.js';
import jobInfo from './jobInfo.js';
import jobdefInfo from './jobdefInfo.js';

import sasQuery from './sasQuery.js';
import setContext from './setContext.js';


function makeTools(_appContext) {
  // wrap all tools with 
  let customTools = [];

  // get the tool definitions and handler 
  let list = [
    listMas(_appContext),
    
    findMas(_appContext),
    masInfo(_appContext),
    masScore(_appContext),

    scrInfo(_appContext),
    scrScore(_appContext),

    findLibrary(_appContext),
    listLibraries(_appContext),
    findTable(_appContext),
    tableInfo(_appContext),
    listTables(_appContext),
    readTable(_appContext),
    sasQuery(_appContext),

    runProgram(_appContext),
    runMacro(_appContext),

    findJob(_appContext),
    listJobs(_appContext),
    runJob(_appContext),
    listJobdefs(_appContext),
    findJobdef(_appContext),
    jobdefInfo(_appContext),
    runJobdef(_appContext),

    devaScore(_appContext),
    setContext(_appContext)
    
  ];
  let listWithCustom = list.concat(customTools);
  console.error(`\n[Note] Loaded a total of ${listWithCustom.length} tools.`);
  return listWithCustom;
}
export default makeTools;