const parseArgs = require('minimist');

const ioUtils = require('../utils/io');
const parser = require('../cdoFlavoredParser');

const argv = parseArgs(process.argv.slice(2));

const helpFlag = (argv.h || argv.help);

if (helpFlag) {
  process.stdout.write("usage: render [INFILE] [options]\n");
  process.stdout.write("\n");
  process.stdout.write("Reads content from INFILE if specified, STDIN otherwise.\n");
  process.stdout.write("Content can be plain text or JSON.\n");
  process.stdout.write("Content will be rendered as HTML. If the content is JSON, all string values (including those several levels deep) will be rendered.\n");
  process.stdout.write("\n");
  process.stdout.write("options:\n");
  process.stdout.write("\t-h, --help: print this help message\n");
  process.stdout.write("\t-o OUTFILE: output to OUTFILE rather than stdout\n");
  process.exit()
}

ioUtils.readFromFileOrStdin(argv._[0])
  .then(ioUtils.parseAsSerialized)
  .then(render)
  .then(ioUtils.formatAsSerialized)
  .then(ioUtils.writeToFileOrStdout.bind(ioUtils, argv.o));

function render(data) {
  if (typeof data === "string") {
    if (data) {
      return parser.sourceToHtml(data);
    }
  } else if (typeof data === "object") {
    return Object.keys(data).reduce((prev, key) => {
      const value = data[key];
      prev[key] = render(value);
      return prev;
    }, {});
  } else {
    throw Error('cannot process content of type ' + typeof data);
  }
}
