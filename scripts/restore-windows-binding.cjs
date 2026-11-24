const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// npm 10 can omit this optional native package even when it is in package-lock.json.
// The local tarball is the exact Windows x64 package for the pinned oxc-parser version.
if (process.platform !== 'win32' || process.arch !== 'x64') process.exit(0);

const root = path.resolve(__dirname, '..');
const version = '0.153.0';
const installedParser = require(path.join(root, 'node_modules', 'oxc-parser', 'package.json'));
if (installedParser.version !== version) {
  throw new Error(`Expected oxc-parser ${version}, found ${installedParser.version}`);
}

const archive = path.join(root, `oxc-parser-binding-win32-x64-msvc-${version}.tgz`);
const destination = path.join(root, 'node_modules', '@oxc-parser', 'binding-win32-x64-msvc');
const nativeFile = path.join(destination, 'parser.win32-x64-msvc.node');
if (fs.existsSync(nativeFile)) process.exit(0);
if (!fs.existsSync(archive)) {
  throw new Error(`Missing ${path.basename(archive)}; the Windows Slidev binding cannot be restored`);
}

const stage = fs.mkdtempSync(path.join(root, '.binding-stage-'));
try {
  execFileSync('tar', ['-xf', archive, '-C', stage], { stdio: 'inherit' });
  const extracted = path.join(stage, 'package');
  const manifest = JSON.parse(fs.readFileSync(path.join(extracted, 'package.json'), 'utf8'));
  if (manifest.name !== '@oxc-parser/binding-win32-x64-msvc' || manifest.version !== version) {
    throw new Error('The local binding archive has an unexpected package or version');
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.rmSync(destination, { recursive: true, force: true });
  fs.renameSync(extracted, destination);
  if (!fs.existsSync(nativeFile)) throw new Error('The native binding was not restored');
  process.stdout.write('Restored the Windows x64 oxc-parser binding.\n');
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
