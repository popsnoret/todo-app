import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTodos, type TodoCategory } from "../context/TodoContext";

const COLORS = {
  background: "#D5E5E5",
  text: "#111111",
  muted: "#45504F",
  white: "#FFFFFF",
  green: "#B3D9BD",
  brown: "#cfad99",
  blue: "#91D2EB",
  red: "#F3ACAE",
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
  const [description, setDescription] = useState(todo?.description ?? "");
  const [date, setDate] = useState(todo?.date ?? "");
  const [category, setCategory] = useState<TodoCategory>(todo?.category ?? "Övrigt");

  if (!todo) {
    return (
      <SafeAreaView
        style={styles.screen}
        testID="detail-screen"
      >
        <Text style={styles.heading}>Uppgiften kunde inte hittas.</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Tillbaka</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  function saveChanges() {
    if (!title.trim()) {
      Alert.alert("Titel saknas", "Skriv ett namn på uppgiften.");
      return;
    }

    updateTodo(todo.id, title.trim(), description, date, category);
    router.back();
  }

  function handleDelete() {
    Alert.alert("Ta bort uppgift", `Vill du ta bort "${todo.title}"?`, [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Ta bort",
        style: "destructive",
        onPress: () => {
          deleteTodo(todo.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView
      style={styles.screen}
      testID="detail-screen"
    >
      <View style={styles.header}>
        <Text style={styles.appTitle}>Att göra</Text>
        <Pressable
          style={styles.closeButton}
          onPress={() => router.back()}
          accessibilityLabel="Tillbaka"
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Uppgift</Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: todo.completed ? COLORS.green : categoryColors[todo.category],
              },
            ]}
          >
            <Text
              style={styles.statusText}
              testID="todo-status"
            >
              {todo.completed ? "Genomförd" : "Inte genomförd"}
            </Text>
          </View>

          <Text style={styles.label}>Vad behöver du göra?</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Namn på aktivitet"
            placeholderTextColor={COLORS.muted}
            testID="todo-title"
          />

          <Text style={styles.label}>Anteckningar (valfritt)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Beskrivning"
            placeholderTextColor={COLORS.muted}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.label}>Datum (ÅÅÅÅ-MM-DD)</Text>
          <TextInput
            style={styles.dateButton}
            value={date}
            onChangeText={setDate}
            placeholder="2026-10-21"
            placeholderTextColor={COLORS.muted}
            accessibilityLabel="Datum"
          />

          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categoryOptions}>
            {categories.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor: category === item ? categoryColors[item] : COLORS.white,
                  },
                ]}
                onPress={() => setCategory(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: category === item }}
              >
                <Text style={styles.categoryOptionText}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.button}
            onPress={saveChanges}
            testID="save-todo-button"
          >
            <Text style={styles.buttonText}>Spara ändringar</Text>
          </Pressable>

          <Pressable
            style={styles.statusButton}
            onPress={() => toggleTodo(todo.id)}
            testID="toggle-todo"
          >
            <Text style={styles.buttonText}>{todo.completed ? "Markera som ej klar" : "Markera som klar"}</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={handleDelete}
            testID="delete-todo"
          >
            <Text style={styles.buttonText}>Ta bort uppgift</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 92,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: COLORS.text,
  },
  appTitle: {
    fontSize: 25,
    fontFamily: "monospace",
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.text,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 27,
    lineHeight: 30,
    color: COLORS.text,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 23,
    fontFamily: "monospace",
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },
  statusBadge: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  statusText: {
    fontFamily: "monospace",
    color: COLORS.text,
  },
  label: {
    fontSize: 16,
    fontFamily: "monospace",
    color: COLORS.muted,
    marginBottom: 8,
    marginTop: 16,
  },
  titleInput: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: "monospace",
    color: COLORS.text,
  },
  descriptionInput: {
    minHeight: 92,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    padding: 18,
    fontSize: 16,
    fontFamily: "monospace",
    color: COLORS.text,
  },
  dateButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: "monospace",
    color: COLORS.text,
  },
  categoryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.text,
  },
  categoryOptionText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: COLORS.text,
  },
  button: {
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.text,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 12,
  },
  statusButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 12,
  },
  deleteButton: {
    minHeight: 56,
    borderRadius: 20,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "700",
    color: COLORS.text,
  },
});
