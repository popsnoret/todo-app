# Automatiska tester för todo-appen

Testerna provar lägga till, tomma titlar, rätt detaljsida, statusändringar, två todos med samma titel, borttagning och Avbryt. De använder appens riktiga routes och delade state. Du väljer själv filnamn, komponenter och state-lösning.

## Installera i din app

1. Kopiera den här `tests`-mappen till roten av din Expo-app, bredvid `package.json`. Appen ska ligga i roten av sitt GitHub-repo.
2. Kör från appens projektrot:

```bash
npx expo install jest-expo jest @types/jest @testing-library/react-native@14.1.0 test-renderer@1.2.0 --dev
node tests/install.cjs
npm run test:assignment
```

Installationsskriptet lägger till `test:assignment` i `package.json` och kopierar workflow-filen till `.github/workflows/`. Övriga scripts behålls. Checka in dessa filer och din uppdaterade `package-lock.json`.

Testpaketet är verifierat med Expo SDK 57, React Native Testing Library 14.1 och test-renderer 1.2. Versionsvalet för renderern matchar React 19.2 i SDK 57. Se [Expos testguide](https://docs.expo.dev/develop/unit-testing/) och [Expo Router testing](https://docs.expo.dev/router/reference/testing/).

## Så hittar testerna gränssnittet

`testID` är en prop i React Native som ger testerna ett namn att söka efter. Du lägger den direkt i JSX på ett befintligt element, precis som `style` eller `onPress`. Den ändrar inte elementets synliga text eller utseende.

Exempel på var ID:n placeras i ett formulär:

```tsx
<View testID="add-screen">
  <TextInput
    testID="todo-input"
    value={title}
    onChangeText={setTitle}
  />
  <Pressable testID="save-todo" onPress={handleSave}>
    <Text>Spara</Text>
  </Pressable>
  <Pressable testID="cancel-add" onPress={handleCancel}>
    <Text>Avbryt</Text>
  </Pressable>
</View>
```

Använd dina egna variabler och funktioner; exemplet visar bara hur du lägger till `testID`. Skärmens ID sitter på en `View` som omsluter innehållet. Knappens ID sitter på det tryckbara elementet, exempelvis `Pressable`, och fältets ID sitter på `TextInput`.

Om du har en egen knappkomponent behöver den skicka `testID` vidare till sin inre `Pressable` eller motsvarande React Native-element. Det räcker inte att ta emot propen utan att använda den.

Använd namnen nedan exakt, inklusive små bokstäver och bindestreck. Själva propen skrivs `testID`, med stort **ID**.

| `testID` | Element |
| --- | --- |
| `home-screen` | Home-skärmens innehåll |
| `add-screen` | Add-skärmens innehåll |
| `detail-screen` | Detail-skärmens innehåll |
| `add-todo` | Tryckbart element som öppnar Add |
| `todo-input` | Titelns `TextInput` |
| `save-todo` | Spara-knappen |
| `cancel-add` | Avbryt-knappen |
| `todo-row` | Varje tryckbar rad i listan, samma ID på alla rader |
| `todo-title` | `Text` med titeln på Detail |
| `todo-status` | `Text` med status på varje rad och på Detail |
| `toggle-todo` | Knappen som växlar status på Detail |
| `delete-todo` | Ta bort-knappen på Detail |

### ID:n på todo-rader

Varje rad får samma `testID="todo-row"`. Testerna hämtar alla rader och använder titeln för att hitta rätt rad. Lägg `todo-status` på statusens `Text` **inne i varje rad**, och även på statusens `Text` på Detail.

`testID` är inte todons unika ID och ersätter inte listans `keyExtractor`. Todo-ID:t identifierar din data; `testID` hjälper testerna att hitta ett element i gränssnittet. Använd därför inte exempelvis `testID={item.id}` eller `testID={'todo-row-' + item.id}` för raderna.

Om ett test inte hittar ett element, kontrollera stavningen, att ID:t sitter på rätt element och att eventuella egna komponenter skickar propen vidare. Kör sedan `npm run test:assignment` igen.

Status ska visas som **Ej genomförd** eller **Genomförd**. Varje rad ska visa sin titel. En ny todo börjar som ej genomförd. Home ska vara appens `/`-route. Testerna hittar automatiskt `src/app` eller `app`; använd bara en av dem.

Tom titel ska lämna formuläret öppet, och Avbryt ska stänga det. Spara och Ta bort ska återgå till Home. Ett valfritt native `Alert` för borttagning bekräftas av testerna om bekräftelseknappen har `style: 'destructive'`.

## Vad körs automatiskt

GitHub Actions kör testerna och `tsc --noEmit` vid push, pull request och manuell start. Resultatet finns under **Actions** i ditt app-repo. De här filerna är ett testpaket för studentappar; uppgiftsrepot innehåller ingen app att köra dem mot.

Tester körs utanför route-mappen och behöver ingen emulator. AsyncStorage mockas och töms mellan testerna om biblioteket är installerat; lagring efter omstart ingår inte i dessa grundtester. Modalens presentation, gester och tangentbord behöver fortfarande provas på Android eller iOS.

Vid bedömning kör läraren originaltesterna mot den commit som eleven lämnar in. En inlämning i lärplattformen startar inte automatiskt en GitHub-körning. Testerna är stöd för bedömningen och täcker inte hela VG-uppgiften.
