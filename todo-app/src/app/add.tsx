import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Modal } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTodos, type TodoCategory } from "../context/TodoContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const categories: TodoCategory[] = ["Hemma", "Arbete", "Studier", "Personligt", "Övrigt"];

const categoryColors: Record<TodoCategory, string> = {
  Hemma: "#B3D9BD",
  Arbete: "#E5C7B5",
  Studier: "#91D2EB",
  Personligt: "#F3ACAE",
  Övrigt: "#C9B1E8",
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

export default function AddScreen() {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [date, setDate] = useState(getToday());
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TodoCategory>("Övrigt");
  const { addTodo } = useTodos();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(`${date}T12:00:00`));

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError("Du verkar ha glömt titel på din uppgift");
      return;
    }

    setTitleError("");

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return;
    }

    if (date < getToday()) {
      return;
    }

    addTodo(title.trim(), date, category, description);
    router.back();
  };

  function handleCancel() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  return (
    <SafeAreaView
      style={styles.screen}
      testID="add-screen"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
              onPress={handleCancel}
              accessibilityLabel="Tillbaka"
            >
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>

            <Text style={styles.heading}>Ny uppgift</Text>
          </View>

          <Text style={styles.label}>Vad behöver du göra?</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Fyll i aktivitet"
            placeholderTextColor="#666666"
            testID="todo-input"
            accessibilityLabel="Titel"
          />
          {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

          <Text style={styles.label}>Anteckningar</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Lägg till anteckningar..."
            placeholderTextColor="#666666"
            multiline
            textAlignVertical="top"
            accessibilityLabel="Anteckningar"
          />

          <Text style={styles.label}>När?</Text>
          <Pressable
            style={styles.input}
            onPress={() => {
              setSelectedDate(new Date(`${date}T12:00:00`));
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
          <View style={styles.categories}>
            {categories.map((item) => {
              const selected = category === item;

              return (
                <Pressable
                  key={item}
                  style={({ pressed }) => [
                    styles.categoryButton,
                    { backgroundColor: categoryColors[item] },
                    selected && styles.selectedCategory,
                    pressed && styles.categoryPressed,
                  ]}
                  onPress={() => setCategory(item)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  testID={`category-${item}`}
                >
                  <Text style={styles.categoryText}>{item}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                (!title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)) && styles.disabledButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSave}
              disabled={!/^\d{4}-\d{2}-\d{2}$/.test(date)}
              testID="save-todo"
            >
              <Text style={styles.saveText}>Lägg till</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelPressed]}
              onPress={handleCancel}
              testID="cancel-add"
            >
              <Text style={styles.cancelText}>Avbryt</Text>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  header: {
    minHeight: 68,
    paddingTop: 25,
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
    marginTop: -3,
    color: "#111111",
  },
  heading: {
    fontSize: 22,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#111111",
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
    backgroundColor: "#F1F1F1",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 20,
    fontSize: 16,
    fontFamily: "monospace",
    color: "#111111",
  },
  notesInput: {
    minHeight: 85,
    paddingTop: 12,
  },
  helperText: {
    backgroundColor: "#F7F7F7",
    color: "#666666",
    fontSize: 13,
    fontFamily: "monospace",
    padding: 12,
    borderRadius: 8,
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  selectedCategory: {
    borderColor: "#111111",
  },
  categoryPressed: {
    opacity: 0.75,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#111111",
  },
  actions: {
    marginTop: "auto",
    paddingTop: 8,
    gap: 6,
  },
  saveButton: {
    minHeight: 52,
    backgroundColor: "#E8E8E8",
    borderWidth: 1.2,
    borderColor: "#222222",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveText: {
    color: "#111111",
    fontSize: 15,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.7,
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
  errorText: {
    color: "#D9534F",
    fontSize: 13,
    marginTop: 5,
  },
  dateText: {
    fontSize: 16,
    fontFamily: "monospace",
    color: "#111111",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
  },
  dateModalTitle: {
    fontSize: 18,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#111111",
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
    color: "#111111",
  },
});
