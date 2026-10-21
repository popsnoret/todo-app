import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTodos, type TodoCategory } from "../context/TodoContext";

const categories: TodoCategory[] = ["Hemma", "Arbete", "Studier", "Personligt", "Övrigt"];

const categoryColors: Record<TodoCategory, string> = {
  Hemma: "#B3D9BD",
  Arbete: "#cfad99",
  Studier: "#91D2EB",
  Personligt: "#F3ACAE",
  Övrigt: "#C9B1E8",
};

const backgroundColor = "#D5E5E5";

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AddScreen() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getToday());
  const [category, setCategory] = useState<TodoCategory>("Övrigt");
  const { addTodo } = useTodos();

  function handleSave() {
    if (!title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return;
    }

    addTodo(title, date, category);
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
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Ny uppgift</Text>

          <Text style={styles.label}>Vad ska du göra?</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Fyll i uppgift"
            placeholderTextColor="#666666"
            testID="todo-input"
            accessibilityLabel="Titel"
          />

          <Text style={styles.label}>När?</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="2026-10-21"
            placeholderTextColor="#666666"
            testID="todo-date"
            accessibilityLabel="Datum"
          />

          <Text style={styles.label}>Kategori</Text>
          <View style={styles.categories}>
            {categories.map((item) => {
              const selected = category === item;

              return (
                <Pressable
                  key={item}
                  style={[styles.categoryButton, { backgroundColor: categoryColors[item] }, selected && styles.selectedCategory]}
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

          <Pressable
            style={[styles.saveButton, !title.trim() && styles.disabledButton]}
            onPress={handleSave}
            disabled={!title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)}
            testID="save-todo"
          >
            <Text style={styles.saveText}>Spara</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            testID="cancel-add"
          >
            <Text style={styles.cancelText}>Avbryt</Text>
          </Pressable>
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
    backgroundColor,
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 25,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#111111",
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontFamily: "monospace",
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#111111",
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: "monospace",
    color: "#111111",
  },
  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
    marginBottom: 28,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedCategory: {
    borderColor: "#111111",
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: "#111111",
  },
  saveButton: {
    backgroundColor: "#111111",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.45,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelText: {
    color: "#111111",
    fontSize: 15,
    fontFamily: "monospace",
  },
});
