import fs from 'node:fs';
import path from 'node:path';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import {
  act,
  renderRouter,
  screen,
  waitFor,
  within,
  userEvent,
} from 'expo-router/testing-library';

const appRoot = path.resolve(__dirname, '..');
const routeDirs = ['src/app', 'app'].filter(dir =>
  fs.existsSync(path.join(appRoot, dir)),
);
if (routeDirs.length !== 1) {
  throw new Error('Testerna behöver en route-mapp: src/app eller app.');
}

let user;
let navigation;

beforeEach(async () => {
  jest.useFakeTimers();
  user = userEvent.setup();
  // Accept an optional native delete-confirmation dialog.
  jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => {
    const confirm = buttons?.find(button => button.style === 'destructive');
    confirm?.onPress?.();
  });
  // Load the student's actual routes, including their root layout and providers.
  navigation = renderRouter(path.join(appRoot, routeDirs[0]), { initialUrl: '/' });
  await navigation;
  await screen.findByTestId('home-screen');
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

function home() {
  expect(navigation.getPathname()).toBe('/');
  return within(screen.getByTestId('home-screen'));
}

function rows(title) {
  return home().queryAllByTestId('todo-row').filter(row =>
    within(row).queryByText(title, { exact: true }),
  );
}

async function press(id) {
  await user.press(await screen.findByTestId(id));
}

async function add(title) {
  await press('add-todo');
  const form = within(await screen.findByTestId('add-screen'));
  await user.type(form.getByTestId('todo-input'), title);
  await user.press(form.getByTestId('save-todo'));
  await screen.findByTestId('home-screen');
  await waitFor(() => expect(rows(title)).toHaveLength(1));
}

async function open(title, index = 0) {
  await user.press(rows(title)[index]);
  const detail = within(await screen.findByTestId('detail-screen'));
  expect(detail.getByTestId('todo-title')).toHaveTextContent(title);
  return detail;
}

async function backToHome() {
  expect(router.canGoBack()).toBe(true);
  await act(async () => router.back());
  await screen.findByTestId('home-screen');
}

test('En sparad todo syns på Home efter att Add stängts', async () => {
  await add('Test: handla mjölk');
  expect(rows('Test: handla mjölk')).toHaveLength(1);
  expect(navigation.getPathname()).toBe('/');
  expect(screen.queryByTestId('add-screen')).toBeNull();
});

test.each(['', '   '])('Titeln %p skapar ingen todo', async title => {
  const countBefore = home().queryAllByTestId('todo-row').length;
  await press('add-todo');
  const form = within(await screen.findByTestId('add-screen'));
  if (title) await user.type(form.getByTestId('todo-input'), title);
  await user.press(form.getByTestId('save-todo'));
  expect(screen.getByTestId('add-screen')).toBeVisible();
  await user.press(form.getByTestId('cancel-add'));
  await screen.findByTestId('home-screen');
  expect(home().queryAllByTestId('todo-row')).toHaveLength(countBefore);
});

test('Varje rad öppnar rätt todo', async () => {
  await add('Test: första todon');
  await add('Test: andra todon');
  await open('Test: andra todon');
  await backToHome();
  await open('Test: första todon');
});

test('Status kan ändras åt båda hållen och uppdateras på Home', async () => {
  const title = 'Test: ändra status';
  await add(title);
  const detail = await open(title);
  expect(detail.getByTestId('todo-status')).toHaveTextContent(/^Ej genomförd$/);
  await user.press(detail.getByTestId('toggle-todo'));
  await waitFor(() =>
    expect(detail.getByTestId('todo-status')).toHaveTextContent(/^Genomförd$/),
  );
  await backToHome();
  expect(within(rows(title)[0]).getByTestId('todo-status'))
    .toHaveTextContent(/^Genomförd$/);
  const reopened = await open(title);
  await user.press(reopened.getByTestId('toggle-todo'));
  await waitFor(() =>
    expect(reopened.getByTestId('todo-status')).toHaveTextContent(/^Ej genomförd$/),
  );
  await backToHome();
  expect(within(rows(title)[0]).getByTestId('todo-status'))
    .toHaveTextContent(/^Ej genomförd$/);
});

test('Två todos med samma titel kan ändras var för sig', async () => {
  const title = 'Test: samma titel';
  await add(title);
  await press('add-todo');
  const form = within(await screen.findByTestId('add-screen'));
  await user.type(form.getByTestId('todo-input'), title);
  await user.press(form.getByTestId('save-todo'));
  await screen.findByTestId('home-screen');
  await waitFor(() => expect(rows(title)).toHaveLength(2));
  const detail = await open(title, 1);
  await user.press(detail.getByTestId('toggle-todo'));
  await backToHome();
  // Row order is free, including SectionList grouping by completion status.
  expect(rows(title).filter(row =>
    within(row).queryByText('Genomförd', { exact: true }),
  )).toHaveLength(1);
  expect(rows(title).filter(row =>
    within(row).queryByText('Ej genomförd', { exact: true }),
  )).toHaveLength(1);
});

test('Borttagning tar bort vald todo och behåller andra', async () => {
  await add('Test: behåll denna');
  await add('Test: ta bort denna');
  const detail = await open('Test: ta bort denna');
  await user.press(detail.getByTestId('delete-todo'));
  await screen.findByTestId('home-screen');
  await waitFor(() => expect(rows('Test: ta bort denna')).toHaveLength(0));
  expect(rows('Test: behåll denna')).toHaveLength(1);
  expect(navigation.getPathname()).toBe('/');
});

test('Avbryt stänger Add utan att ändra listan', async () => {
  await add('Test: finns redan');
  const countBefore = home().queryAllByTestId('todo-row').length;
  await press('add-todo');
  const form = within(await screen.findByTestId('add-screen'));
  await user.type(form.getByTestId('todo-input'), 'Test: ska inte sparas');
  await user.press(form.getByTestId('cancel-add'));
  await screen.findByTestId('home-screen');
  expect(rows('Test: ska inte sparas')).toHaveLength(0);
  expect(rows('Test: finns redan')).toHaveLength(1);
  expect(home().queryAllByTestId('todo-row')).toHaveLength(countBefore);
  expect(screen.queryByTestId('add-screen')).toBeNull();
});
