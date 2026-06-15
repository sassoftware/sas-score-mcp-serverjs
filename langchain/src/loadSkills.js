/*
 * Copyright © 2025, SAS Institute Inc., Cary, NC, USA.  All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 *
 * loadSkills.js
 * -------------
 * Reads every SKILL.md under the skills directory and composes them into a
 * single system-prompt string.  The order determines precedence — request-routing
 * is loaded first as the canonical router, followed by scoring, data-access, and
 * discovery skills.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Canonical load order — determines which skill is read first in the prompt.
// Skills not listed here are appended alphabetically after these.
const LOAD_ORDER = [
  'request-routing',
  'score-strategy',
  'score-mas-scr',
  'score-job-jobdef',
  'score-program',
  'score-cas',
  'read-strategy',
  'find-resources',
  'find-library-server',
  'list-library',
  'list-tables',
  'list-mas-job-jobdef',
  'detail-strategy',
];

/**
 * Locate the skills directory.
 * When the package is used inside the repo it resolves to ../../.skills/skills.
 * When installed as an npm package the skills are bundled in ../skills.
 */
function findSkillsDir() {
  const candidates = [
    path.resolve(__dirname, '../../.skills/skills'),   // repo usage
    path.resolve(__dirname, '../skills'),               // npm-published copy
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) return dir;
  }
  throw new Error(
    'Cannot locate skills directory. Expected at .skills/skills (repo) or skills/ (npm package).'
  );
}

/**
 * Load all SKILL.md files and return a composed system-prompt string.
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.verbose=false] - log loaded skill names to stderr
 * @returns {string} System prompt text containing all skills
 */
export function loadSkills(opts = {}) {
  const { verbose = false } = opts;
  const skillsDir = findSkillsDir();

  // Build ordered list of skill folder names
  const existing = fs.readdirSync(skillsDir).filter(
    d => fs.statSync(path.join(skillsDir, d)).isDirectory()
  );
  const ordered = [
    ...LOAD_ORDER.filter(n => existing.includes(n)),
    ...existing.filter(n => !LOAD_ORDER.includes(n)).sort(),
  ];

  const sections = [];

  for (const skillName of ordered) {
    const skillFile = path.join(skillsDir, skillName, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;
    const content = fs.readFileSync(skillFile, 'utf8').trim();
    if (verbose) process.stderr.write(`[skills] loaded: ${skillName}\n`);
    sections.push(`\n\n${'='.repeat(72)}\n## SKILL: ${skillName}\n${'='.repeat(72)}\n\n${content}`);
  }

  if (sections.length === 0) {
    throw new Error('No SKILL.md files found — skills directory may be empty.');
  }

  return [
    'You are an AI assistant connected to a SAS Viya environment via the SAS Score MCP Server.',
    'The following SKILL documents define EXACTLY how you must route, verify, and execute',
    'every user request.  Follow them strictly — prefer the skill decision trees over your',
    'training data when they conflict.',
    ...sections,
    '',
    `${'='.repeat(72)}`,
    'END OF SKILLS — follow the decision trees above for every action.',
    `${'='.repeat(72)}`,
  ].join('\n');
}

/**
 * Return the names of all available skills (for inspection / debugging).
 */
export function listSkillNames() {
  const skillsDir = findSkillsDir();
  return fs.readdirSync(skillsDir).filter(
    d => fs.statSync(path.join(skillsDir, d)).isDirectory()
  );
}
