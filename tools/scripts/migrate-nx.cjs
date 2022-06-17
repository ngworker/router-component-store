const child_process = require('child_process');
const fs = require('fs');

function formatFiles() {
  runCommand('yarn nx format');
}

function getNxVersion(packageConfiguration) {
  return packageConfiguration.devDependencies['@nrwl/workspace'] ?? '';
}

function installPackages() {
  runCommand('yarn install --no-interactive');
}

function setNxVersion(version, packageConfiguration) {
  packageConfiguration.devDependencies['@nrwl/workspace'] = version;
}

function runCommand(command) {
  console.log(`> ${command}`);
  child_process.execSync(command, {
    stdio: 'inherit',
  });
}

function runMigrations() {
  const migrationsFilename = 'migrations.json';
  const migrationsAvailable = fs.existsSync(migrationsFilename);

  if (!migrationsAvailable) {
    console.log('No migrations available.');

    return;
  }

  console.log('Migrations available:');
  console.log(fs.readFileSync(migrationsFilename, 'utf8'));

  runCommand(`yarn nx migrate --run-migrations=${migrationsFilename}`);
  fs.unlinkSync(migrationsFilename);
}

function updatePackageJson() {
  const packageJsonFilename = 'package.json';

  const packageJson = JSON.parse(fs.readFileSync(packageJsonFilename, 'utf8'));
  const toNxVersion = getNxVersion(packageJson);

  const baseBranch = 'origin/main';
  const baseBranchPackageJson = JSON.parse(
    child_process
      .execSync(`git cat-file -p ${baseBranch}:${packageJsonFilename}`)
      .toString()
      .trim()
  );
  const fromNxVersion = getNxVersion(baseBranchPackageJson);

  setNxVersion(fromNxVersion, packageJson);
  fs.writeFileSync(packageJsonFilename, JSON.stringify(packageJson, null, 2));
  installPackages();

  runCommand(
    `yarn nx migrate @nrwl/workspace@${toNxVersion} --from=@nrwl/workspace@${fromNxVersion}`
  );
}

updatePackageJson();
installPackages();
runMigrations();
formatFiles();
