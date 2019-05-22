#!/usr/bin/env node

const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const parser = require('../redactableMarkdownParser').create();
const recursivelyProcessAll = require('../utils/misc').recursivelyProcessAll;
const requireByPath = require('../utils/misc').requireByPath;

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);
if (helpFlag) {
  process.stdout.write("usage: sanitize [INFILE] [options]\n");
  process.stdout.write("\n");
  process.stdout.write("Reads content from file specified in -r.\n");
  process.stdout.write("Content can be plain text or JSON.\n");
  process.stdout.write("Content will be cleared if not redacted.\n");
  process.stdout.write("\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.stdout.write("\t-p, --parserPlugins PLUGINS: comma-separated list of parser plugins to include in addition to the defaults\n");
  process.stdout.write("\t-c, --compilerPlugins PLUGINS: comma-separated list of compiler plugins to include in addition to the defaults\n");
  process.exit()
}

const parserPlugins = (argv.p || argv.parserPlugins)
if (parserPlugins) {
  parser.parser.use(requireByPath(parserPlugins));
}

const compilerPlugins = (argv.c || argv.compilerPlugins)
if (compilerPlugins) {
  parser.compilerPlugins.push(...requireByPath(compilerPlugins));
}

function sanitize(data) {
  return recursivelyProcessAll(parser.sanitizeUnredacted.bind(parser), data);
}

Promise.all([
  ioUtils.readFromFileOrStdin(argv.r).then(ioUtils.parseAsSerialized),
])
  .then(sanitize)
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, argv.o));
