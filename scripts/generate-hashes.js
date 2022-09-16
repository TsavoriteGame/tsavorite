

const { gitDescribeSync } = require('git-describe');
const fs = require('fs');

let gitRev = 'UNCOMMITTED';
try {
  gitRev = gitDescribeSync({
    dirtyMark: false,
    dirtySemver: false
  });
} catch(e) {
  console.error('No git HEAD; default gitRev set.');
}

const allVars = {
  version: gitRev
};

const content = `/* eslint-disable */
export const BUILDVARS = ${JSON.stringify(allVars, null, 2)};`;

fs.writeFileSync(`${__dirname}/../src/environments/_vars.ts`, content, 'utf8');
