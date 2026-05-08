#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Paths
let client = (process.env.CLIENTNAME == null) ? '.github' : `.${process.env.CLIENTNAME.toLowerCase()}`;
const source = path.join(__dirname, `../.github`);
const destination = path.join(process.cwd(), client);
// const destination = path.join(os.homedir(), client)
console.error(`📁 Copying ${source} to ${destination}...`);
function copyFolderSync(from, to) {
    if (!fs.existsSync(from)) return;
    if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
    console.error(`📁 Copying folder: ${from} to ${to}`);
    fs.readdirSync(from).forEach(element => {
        const fromPath = path.join(from, element);
        const toPath = path.join(to, element);
        if (fs.lstatSync(fromPath).isFile()) {
            fs.copyFileSync(fromPath, toPath);
        } else if (fs.lstatSync(fromPath).isDirectory()) {
            copyFolderSync(fromPath, toPath);
        }
    });
}

try {
    copyFolderSync(source, destination);
    console.error(`✅ Success: ${destination} folder is now in your project root.`);
} catch (err) {
    console.error('❌ Error copying files:', err.message);
}
process.exit(0);
