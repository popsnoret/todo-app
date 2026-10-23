import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useTodos, type TodoCategory } from "../context/TodoContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const COLORS = {
  background: "#FFFFFF",
  text: "#111111",
  muted: "#444444",
  white: "#FFFFFF",
  field: "#F1F1F1",
  green: "#B3D9BD",
  brown: "#E5C7B5",
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

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(`${date || formatDate(new Date())}T12:00:00`));

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
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
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
    if (date < getToday()) return;
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
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={goBack}
          accessibilityLabel="Tillbaka"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <Text style={styles.appTitle}>Redigera</Text>
      </View>
      <View style={styles.statusRow}>
        <Text style={[styles.statusBadge, todo.completed ? styles.completedBadge : styles.pendingBadge]}>{todo.completed ? "KLAR" : "EJ KLAR"}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
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
          <Pressable
            style={styles.input}
            onPress={() => {
              setSelectedDate(new Date(`${date || formatDate(new Date())}T12:00:00`));
              setShowDatePicker(true);
            }}
            testID="todo-date"
            accessibilityLabel="Välj datum"
            accessibilityRole="button"
          >
            <Text style={styles.dateText}>{date}</Text>
          </Pressable>

          <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.dateModalOverlay}>
              <View style={styles.dateModal}>
                <Text style={styles.dateModalTitle}>Välj datum</Text>

                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  themeVariant="light"
                  minimumDate={new Date()}
                  onChange={(_, newDate) => {
                    if (newDate) setSelectedDate(newDate);
                  }}
                />

                <View style={styles.dateModalActions}>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.dateCancel}>Avbryt</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setDate(formatDate(selectedDate));
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.dateConfirm}>Klar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

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
                      backgroundColor: selected ? categoryColors[item] : `${categoryColors[item]}30`,
                      borderColor: categoryColors[item],
                    },
                    pressed && styles.categoryPressed,
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
        </ScrollView>

        {/* Knapparna ligger fast längst ner */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={saveChanges}
            testID="save-todo-button"
          >
            <Text style={styles.buttonText}>Spara ändringar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.statusButton, pressed && styles.buttonPressed]}
            onPress={() => toggleTodo(todo.id)}
            testID="toggle-todo"
          >
            <Text style={styles.buttonText}>{todo.completed ? "Markera som ej klar" : "Markera som klar"}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
            onPress={handleDelete}
            testID="delete-todo"
          >
            <Text style={styles.buttonText}>Ta bort uppgift</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelPressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelText}>Avbryt</Text>
          </Pressable>
        </View>
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
    backgroundColor: COLORS.background,
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 28,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#222222",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 30,
    lineHeight: 32,
    color: "#111111",
    marginTop: -3,
    textAlign: "center",
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
    paddingBottom: 20,
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
    backgroundColor: COLORS.field,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: "monospace",
    color: COLORS.text,
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
    borderWidth: 1,
  },
  categoryOptionText: {
    fontSize: 13,
    fontFamily: "monospace",
    color: COLORS.text,
  },
  categoryPressed: {
    opacity: 0.75,
  },
  actions: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 0,
    gap: 6,
    backgroundColor: COLORS.background,
  },
  button: {
    minHeight: 52,
    backgroundColor: "rgba(232, 232, 232, 0.65)",
    borderWidth: 1.2,
    borderColor: "rgba(34, 34, 34, 0.35)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  statusButton: {
    minHeight: 52,
    backgroundColor: "rgba(179, 217, 189, 0.55)",
    borderWidth: 1.2,
    borderColor: "rgba(34, 34, 34, 0.35)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  deleteButton: {
    minHeight: 52,
    backgroundColor: "rgba(243, 172, 174, 0.55)",
    borderWidth: 1.2,
    borderColor: "rgba(34, 34, 34, 0.35)",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 15,
    fontFamily: "monospace",
    fontWeight: "700",
    textAlign: "center",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelPressed: {
    opacity: 0.55,
  },
  cancelText: {
    color: "#555555",
    fontSize: 14,
    fontFamily: "monospace",
  },
  buttonPressed: {
    opacity: 0.7,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    color: "#D9534F",
    fontSize: 13,
    marginTop: 5,
  },
  dateText: {
    fontSize: 16,
    fontFamily: "monospace",
    color: COLORS.text,
  },
  dateModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  dateModal: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  dateModalTitle: {
    fontSize: 18,
    fontFamily: "monospace",
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  dateModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 28,
    width: "100%",
    marginTop: 12,
    paddingHorizontal: 8,
  },
  dateCancel: {
    fontSize: 15,
    fontFamily: "monospace",
    color: "#555555",
  },
  dateConfirm: {
    fontSize: 15,
    fontFamily: "monospace",
    fontWeight: "700",
    color: COLORS.text,
  },
  statusRow: {
    paddingHorizontal: 28,
    alignItems: "flex-end",
    marginBottom: 4,
  },

  statusBadge: {
    overflow: "hidden",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 11,
    fontFamily: "monospace",
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  completedBadge: {
    backgroundColor: "#B3D9BD",
    color: "#234F32",
  },

  pendingBadge: {
    backgroundColor: "#EEEEEE",
    color: "#444444",
  },
});
