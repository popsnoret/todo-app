import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTodos, type TodoCategory } from "../context/TodoContext";

const COLORS = {
  background: "#FFFFFF",
  text: "#111111",
  muted: "#444444",
  white: "#FFFFFF",
  field: "#F1F1F1",
  green: "#B3D9BD",
  brown: "#E5C7B5",
  blue: "#91D2EB",
  red: "#E9A8AA",
  purple: "#C9B1E8",
};

const categories: TodoCategory[] = ["Hemma", "Arbete", "Studier", "Personligt", "Övrigt"];

const categoryColors: Record<TodoCategory, string> = {
  Hemma: COLORS.green,
  Arbete: COLORS.brown,
  Studier: COLORS.blue,
  Personligt: COLORS.red,
  Övrigt: COLORS.purple,
};

export default function DetailScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const { todos, updateTodo, toggleTodo, deleteTodo } = useTodos();
  const todo = todos.find((item) => item.id === id);

  const [title, setTitle] = useState(todo?.title ?? "");
  const [titleError, setTitleError] = useState("");

  const [description, setDescription] = useState(todo?.description ?? "");
  const [date, setDate] = useState(todo?.date ?? "");
  const [category, setCategory] = useState<TodoCategory>(todo?.category ?? "Övrigt");

  function goBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  if (!todo) {
    return (
      <SafeAreaView
        style={styles.screen}
        testID="detail-screen"
      >
        <Text style={styles.appTitle}>Uppgiften kunde inte hittas.</Text>
        <Pressable
          style={styles.button}
          onPress={goBack}
        >
          <Text style={styles.buttonText}>Tillbaka</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  function saveChanges() {
    if (!title.trim()) {
      setTitleError("Du verkar ha glömt titel på din uppgift");
      return;
    }

    setTitleError("");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    if (!todo) return;

    updateTodo(todo.id, title.trim(), description.trim(), date, category);
    goBack();
  }

  function handleDelete() {
    if (!todo) return;

    deleteTodo(todo.id);
    goBack();
  }
  return (
    <SafeAreaView
      style={styles.screen}
      testID="detail-screen"
    >
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={goBack}
          accessibilityLabel="Tillbaka"
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <Text style={styles.appTitle}>Redigera</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Uppgift</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Uppgiftens namn"
            placeholderTextColor={COLORS.muted}
            testID="todo-title"
            accessibilityLabel="Uppgiftens namn"
          />
          {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

          <View style={styles.notesHeader}>
            <Text style={styles.label}>Anteckningar</Text>

            {description.length > 0 && (
              <Pressable
                onPress={() => setDescription("")}
                accessibilityLabel="Rensa anteckningar"
                hitSlop={8}
              >
                <Text style={styles.clearNotesText}>Rensa</Text>
              </Pressable>
            )}
          </View>

          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Beskrivning"
            placeholderTextColor={COLORS.muted}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Anteckningar"
          />

          <Text style={styles.label}>När?</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="ÅÅÅÅ-MM-DD"
            placeholderTextColor={COLORS.muted}
            accessibilityLabel="Datum"
          />

          <Text style={styles.label}>Välj kategori</Text>
          <View style={styles.categoryOptions}>
            {categories.map((item) => {
              const selected = category === item;

              return (
                <Pressable
                  key={item}
                  style={({ pressed }) => [
                    styles.categoryOption,
                    {
                      backgroundColor: selected ? categoryColors[item] : COLORS.white,
                    },
                    selected && styles.selectedCategory,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setCategory(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  testID={`category-${item}`}
                >
                  <Text style={styles.categoryOptionText}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
              onPress={saveChanges}
              testID="save-todo-button"
            >
              <Text style={styles.buttonText}>Spara ändringar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.statusButton, pressed && styles.pressed]}
              onPress={() => toggleTodo(todo.id)}
              testID="toggle-todo"
            >
              <Text style={styles.buttonText}>{todo.completed ? "Markera som ej klar" : "Markera som klar"}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              onPress={handleDelete}
              testID="delete-todo"
            >
              <Text style={styles.buttonText}>Ta bort uppgift</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 28,
    paddingTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 30,
    lineHeight: 32,
    color: "#111111",
    marginTop: -3,
  },
  appTitle: {
    fontSize: 22,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#111111",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  taskHeading: {
    fontSize: 24,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#079ED0",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#222222",
    marginBottom: 7,
    marginTop: 13,
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: "#F1F1F1",
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "monospace",
    color: "#111111",
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  clearNotesText: {
    color: "#555555",
    fontSize: 13,
    fontFamily: "monospace",
  },
  descriptionInput: {
    minHeight: 85,
    paddingTop: 12,
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  categoryOption: {
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#222222",
  },
  selectedCategory: {
    borderWidth: 1.5,
  },
  categoryOptionText: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#111111",
  },
  actions: {
    paddingTop: 8,
    gap: 8,
  },
  button: {
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: "#222222",
    backgroundColor: "#E8E8E8",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  statusButton: {
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: "#222222",
    backgroundColor: "#B3D9BD",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  deleteButton: {
    minHeight: 46,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: "#222222",
    backgroundColor: "#E9A8AA",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#111111",
  },
  pressed: {
    opacity: 0.7,
  },
  errorText: {
    color: "#D9534F",
    fontSize: 13,
    marginTop: 5,
  },
});
