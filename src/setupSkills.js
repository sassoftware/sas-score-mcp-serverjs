#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

function setupSkills(clientName,agentFolder) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    // Paths
    let destination;
    if (clientName.startsWith('.')) {
        console.error('-----------------------',process.cwd());
        destination = path.join(process.cwd(), clientName);
        clientName = clientName.slice(1);
    } else {
        destination = path.join(os.homedir(), '.' + clientName );
    }
    
    if (agentFolder) {
        destination = path.join(destination, agentFolder);
    }
    const source = path.join(__dirname, `../.skills`);
    console.error("==================================================================");
    console.error(`           Copying ${source} to ${destination}...`);

    function copyFolderSync(from, to) {
        if (!fs.existsSync(from)) return [];
        if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });;
        fs.readdirSync(from).forEach(element => {
            const fromPath = path.join(from, element);
            let  toPath = path.join(to, element);
            if (clientName === 'claude' && element === 'copilot-instructions.md') {
                toPath = path.join(to, 'CLAUDE.md');
            }
            if (fs.lstatSync(fromPath).isFile()) {
                console.error(`       📄 Copying file: ${element}`);
                fs.copyFileSync(fromPath, toPath);
            } else if (fs.lstatSync(fromPath).isDirectory()) {
                console.error(`📂 Copying folder: ${element}`);
                copyFolderSync(fromPath, toPath);
            }
        });
    }
    function listExpandedFolder(dir, indent = "") {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            console.error(indent + entry.name);

            if (entry.isDirectory()) {
                listExpandedFolder(path.join(dir, entry.name), indent + "  ");
            }
        }
    }
    try {
        copyFolderSync(source, destination);
        //listExpandedFolder(destination);
    } catch (err) {
        console.error('❌ Error copying files:', err.message);
    }
}
export default setupSkills;