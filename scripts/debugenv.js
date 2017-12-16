#!/usr/bin/node
const fs = require('fs-extra');
const { execFileSync } = require('child_process');
const { join } = require('path');

const pkgName = require('../package.json').name; 
const nodeRedUserDir = join(process.cwd(), '.node-red');
const lockFilename = join(nodeRedUserDir, '.debugenv-lock');
const nodeRedUserDirModules = join(nodeRedUserDir, 'node_modules');

if (!fs.existsSync(join(nodeRedUserDirModules, pkgName)) &&
    !fs.existsSync(lockFilename)) {
    fs.ensureDirSync(nodeRedUserDirModules);
    lck = fs.openSync(lockFilename, 'w');

    try {
        execFileSync('npm', ['link'], {
            stdio: ['inherit', 'inherit', 'inherit']
        });

        execFileSync('npm', ['link', pkgName], {
            cwd: nodeRedUserDir,
            stdio: ['inherit', 'inherit', 'inherit']
        })
    } finally {
        fs.closeSync(lck);
        fs.unlinkSync(lockFilename);
    }
}
