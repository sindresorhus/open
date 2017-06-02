#!/usr/bin/env node

var opn = require('./')

var help = false

var args = process.argv.slice(2).filter(function(arg) {
  if (arg.match(/^(-+|\/)(h(elp)?|\?)$/))
    help = true
  else
    return !!arg
})

if (help || args.length === 0) {
  // If they didn't ask for help, then this is not a "success"
  var log = help ? console.log : console.error
  log('Usage: opn <path>]')
  process.exit(help ? 0 : 1)
} else {
  opn(args[0])
    .then(d => console.log("child process: " + d.pid))
    .catch(err => console.error("cannot open: " + args[0]))
}
