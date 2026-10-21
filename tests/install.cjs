// Run from the root of the student's Expo app after installing test dependencies.
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const packagePath = path.join(root, 'package.json');
if (!fs.existsSync(packagePath)) {
  throw new Error('Kör från din Expo-apps projektrot, där package.json finns.');
}
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (!pkg.dependencies?.expo || !pkg.dependencies?.['expo-router']) {
  throw new Error('Testpaketet behöver en Expo-app med Expo Router.');
}
const workflowPath = path.join(root, '.github/workflows/todo-tests.yml');
const workflow = fs.readFileSync(path.join(__dirname, 'todo-tests.yml'), 'utf8');
if (fs.existsSync(workflowPath) && fs.readFileSync(workflowPath, 'utf8') !== workflow) {
  throw new Error('todo-tests.yml finns redan med annat innehåll. Flytta den innan installation.');
}
const script = 'jest --config tests/jest.config.cjs';
if (pkg.scripts?.['test:assignment'] && pkg.scripts['test:assignment'] !== script) {
  throw new Error('test:assignment finns redan med annat innehåll. Anpassa det manuellt.');
}
pkg.scripts = { ...pkg.scripts, 'test:assignment': script };
fs.mkdirSync(path.dirname(workflowPath), { recursive: true });
fs.writeFileSync(workflowPath, workflow);
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
console.log('Klart! Kör npm run test:assignment. Checka även in package-lock.json.');
