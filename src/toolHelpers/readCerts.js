/**
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import fs from 'fs';
function getCerts(tlsdir) {

    if (tlsdir == null || tlsdir === 'NONE') {
        return null;
    }

    console.log(`[Note] Reading certs from directory: ` + tlsdir);
    if (fs.existsSync(tlsdir) === false) {
        console.error("[Warning] Specified cert dir does not exist: " + tlsdir);
        return null;
    }

    let listOfFiles = fs.readdirSync(tlsdir);
    console.log("[Note] TLS/SSL files found: " + listOfFiles);
    let options = {};
    for(let i=0; i < listOfFiles.length; i++) {
        let fname = listOfFiles[i];
        let name = tlsdir + '/' + listOfFiles[i];
        let key = fname.split('.')[0];
        console.log('Reading TLS file: ' + name + ' as key: ' + key);
        options[key] = fs.readFileSync(name, { encoding: 'utf8' });
    }
    console.log('cert files', Object.keys(options));
    
    return options;
   
}
export default getCerts;