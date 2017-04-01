'use strict';

var _ = require('lodash');
var fs = require('fs');
var pjoin = require('path').join;
var fmt = require('util').format;
var minimatch = require('minimatch');

function isFile(path) {
    return fs.lstatSync(path).isFile();
}

function isDir(path) {
    return fs.lstatSync(path).isDirectory();
}

function Expander(basePath) {
    return function expand(path) {
        var xp = pjoin(basePath, path);
        return {
            name: path,
            location: xp,
            type: isFile(xp) ? 'file' :
                  isDir(xp)  ? 'dir' : null
        };
    };
}

function excluded(fileName, exPatterns){
    var matched = false;
    exPatterns.forEach(function(pattern){
        if (minimatch(fileName, pattern) && matched === false) {
            matched = true;
        }
    });
    return matched;
}

function readDirp(path, excludeList) {
    var lib = {};
    var expand = new Expander(path);
    var files = fs.readdirSync(path).map(expand);

    files.forEach(function(file){
        if (excluded(file.name, excludeList) === false) {
            lib[file.name.split('.').shift()] = require(file.location);
        }
    });

    return lib;
}

function load(opts){
    opts = _.defaults(opts || {},{
        libDir: process.cwd()+'/lib',
        libKey: 'lib',
        exclude: []
    });

    if (opts.libKey in module.exports) {
        throw new Error(fmt('libKey \'%s\' already exists', opts.libKey));
    }

    module.exports[opts.libKey] = readDirp(opts.libDir, opts.exclude);
}

function loadMany(libs) {
    libs.forEach(load);
}

module.exports = {
    load: load,
    loadMany: loadMany
};