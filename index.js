// git-tag

var fs = require('fs')
var exec = require('child_process').exec
var semver = require('semver')


module.exports = function(options) {
  options = options || {}

  if (!options.hasOwnProperty('semverSort')) {
    options.semverSort = true;
  }

  var get = function(cb) {
    var cmd = 'git tag -l'
    if (!options.localOnly) {
      cmd = 'git pull origin --tags; ' + cmd
    }
    exec(cmd, function(err, res){
      if (err) console.warn('WARN: ' + err)
      if (err || !res.length) return cb(err, [])
      res = res.replace(/^\s+|\s+$/g,'').split(/\n/)
      
      if (options.semverSort) {
        res = res.sort(semver.compare)
      }
      else {
        res = res.sort()
      }

      cb(err, err ? [] : res)
    })
  }

  var create = function(name, msg, cb) {
    msg = typeof msg === 'string' ? msg : ''
    var cmd = 'git tag -a ' + name + ' -m "' + msg + '"'
    if (!options.localOnly) {
      cmd += '; git push origin --tags'
    }
    exec(cmd, function(err){
      if (err) console.warn('WARN: ' + err)
      cb(err, name)
    })
  }

  var remove = function(name, cb) {
    var cmd = 'git tag -d ' + name
    if (!options.localOnly) {
      cmd += '; git push origin :refs/tags/' + name
    }
    exec(cmd, function(err){
      if (err) console.warn('WARN: ' + err)
      cb(err, name)
    })
  }

  var diff = function(name, cb) {
    var cmd = 'git diff ' + name
    exec(cmd, function(err, res) {
      if (err) console.warn('WARN: ' + err)
      console.log("diffs:", res);
      cb(err, res);
    })
  }

  var changedSince = function(name, cb) {
    diff(name, function(err, res) {
      if (err) {
        cb(err, null);
      }
      else {
        cb(null, !!res);
      }
    });
  }

  var Tag = {
    create: create,
    remove: remove,
    diff: diff,
    changedSince: changedSince,
    all: get,
    latest: function(cb) {
      get(function(err, res){
        cb(err, res.pop())
      })
    }
  }
  return Tag
}