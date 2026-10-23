import { useState } from "react";
import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTodos } from "../context/TodoContext";

const colors = {
  background: "#FFFFFF",
  text: "#000000",
  muted: "#45504F",
  line: "#222222",
};

const taskColors: Record<string, string> = {
  Hemma: "#B3D9BD",
  Arbete: "#E5C7B5",
  Studier: "#91D2EB",
  Personligt: "#F3ACAE",
  Övrigt: "#C9B1E8",
};

function getDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextThreeDays() {
  const days: string[] = [];
  const today = new Date();

  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push(getDateString(date));
  }

  return days;
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getDayLabel(dateString: string, today: string, tomorrow: string) {
  if (dateString === today) return "Idag";
  if (dateString === tomorrow) return "Imorgon";

  const day = formatDate(dateString).split(" ")[0];
  return day.charAt(0).toUpperCase() + day.slice(1);
}

export default function HomeScreen() {
  const { todos, toggleTodo } = useTodos();
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);

  const todayDate = new Date();
  const today = getDateString(todayDate);

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrow = getDateString(tomorrowDate);

  const groupedTodos = [...todos]
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce<Record<string, typeof todos>>((groups, todo) => {
      if (!groups[todo.date]) groups[todo.date] = [];
      groups[todo.date].push(todo);
      return groups;
    }, {});

  const dates = [...new Set([...getNextThreeDays(), ...Object.keys(groupedTodos)])].sort();

  function openTodo(id: string) {
    router.push({ pathname: "/detail", params: { id } });
  }

  return (
    <SafeAreaView
      style={styles.screen}
      testID="home-screen"
    >
      <View style={styles.header}>
        <View style={styles.headerSpacer} />

        <Pressable
          style={({ pressed }) => [styles.addButton, isHovered && styles.addButtonHovered, pressed && styles.addButtonPressed]}
          onPress={() => router.push("/add")}
          onHoverIn={() => setIsHovered(true)}
          onHoverOut={() => setIsHovered(false)}
          accessibilityLabel="Lägg till uppgift"
          testID="add-todo"
        >
          <Text style={[styles.plus, isHovered && styles.plusHovered]}>+</Text>
        </Pressable>
      </View>

      <FlatList
        data={dates}
        keyExtractor={(date) => date}
        contentContainerStyle={styles.list}
        renderItem={({ item: date }) => {
          const dayTodos = groupedTodos[date] ?? [];
          const activeTodos = dayTodos.filter((todo) => !todo.completed);
          const completedTodos = dayTodos.filter((todo) => todo.completed);
          const isExpanded = expandedDays[date] ?? false;

          return (
            <View>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{getDayLabel(date, today, tomorrow)}</Text>
                <Text style={styles.date}>{formatDate(date)}</Text>
              </View>

              {activeTodos.map((todo) => (
                <View
                  key={todo.id}
                  style={[
                    styles.taskRow,
                    {
                      backgroundColor: taskColors[todo.category] ?? taskColors.Övrigt,
                    },
                  ]}
                >
                  <Pressable
                    style={styles.checkboxButton}
                    onPress={() => toggleTodo(todo.id)}
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Markera ${todo.title} som klar`}
                    accessibilityState={{ checked: false }}
                    testID={`todo-item-${todo.id}`}
                  >
                    <View style={styles.checkbox} />
                  </Pressable>

                  <Pressable
                    style={styles.titlePressable}
                    onPress={() => openTodo(todo.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Visa ${todo.title}`}
                    testID="todo-row"
                  >
                    <Text style={styles.taskTitle}>{todo.title}</Text>
                  </Pressable>
                </View>
              ))}

              {completedTodos.length > 0 && (
                <View style={styles.completedSection}>
                  <Pressable
                    style={styles.completedHeader}
                    onPress={() =>
                      setExpandedDays((current) => ({
                        ...current,
                        [date]: !isExpanded,
                      }))
                    }
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <Text style={styles.completedHeaderText}>
                      {isExpanded ? "▾" : "▸"} Färdiga ({completedTodos.length})
                    </Text>
                  </Pressable>

                  {isExpanded &&
                    completedTodos.map((todo) => (
                      <View
                        key={todo.id}
                        style={[
                          styles.taskRow,
                          styles.completedRow,
                          {
                            backgroundColor: taskColors[todo.category] ?? taskColors.Övrigt,
                          },
                        ]}
                      >
                        <Pressable
                          style={styles.checkboxButton}
                          onPress={() => toggleTodo(todo.id)}
                          accessibilityRole="checkbox"
                          accessibilityLabel={`Markera ${todo.title} som ej klar`}
                          accessibilityState={{ checked: true }}
                        >
                          <View style={styles.checkbox}>
                            <Text style={styles.checkmark}>✓</Text>
                          </View>
                        </Pressable>

                        <Pressable
                          style={styles.titlePressable}
                          onPress={() => openTodo(todo.id)}
                          accessibilityRole="button"
                          accessibilityLabel={`Visa ${todo.title}`}
                          testID="todo-row"
                        >
                          <Text style={[styles.taskTitle, styles.completedText]}>{todo.title}</Text>
                        </Pressable>
                      </View>
                    ))}
                </View>
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    minHeight: 92,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  headerSpacer: {
    flex: 1,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: colors.text,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    transitionDuration: "150ms",
  },
  addButtonHovered: {
    backgroundColor: "#222222",
    borderColor: "#222222",
  },
  addButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  plus: {
    fontSize: 38,
    lineHeight: 42,
    color: colors.text,
    textAlign: "center",
    includeFontPadding: false,
    marginTop: -3,
  },
  plusHovered: {
    color: "#FFFFFF",
  },
  list: {
    paddingBottom: 28,
  },
  dayHeader: {
    minHeight: 76,
    paddingHorizontal: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayTitle: {
    fontSize: 24,
    fontFamily: "monospace",
    fontWeight: "700",
    color: colors.text,
  },
  date: {
    maxWidth: "55%",
    fontSize: 15,
    textAlign: "right",
    lineHeight: 21,
    color: colors.text,
    textTransform: "capitalize",
  },
  taskRow: {
    minHeight: 48,
    paddingLeft: 38,
    paddingRight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkboxButton: {
    minWidth: 24,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  titlePressable: {
    flex: 1,
    minHeight: 46,
    justifyContent: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.text,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 15,
    lineHeight: 16,
    color: colors.text,
  },
  taskTitle: {
    fontSize: 17,
    fontFamily: "monospace",
    color: colors.text,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: colors.muted,
  },
  completedSection: {
    marginTop: 6,
  },
  completedHeader: {
    minHeight: 40,
    paddingHorizontal: 38,
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#D8D8D8",
  },
  completedHeaderText: {
    fontSize: 14,
    fontFamily: "monospace",
    color: colors.muted,
  },
  completedRow: {
    opacity: 0.8,
  },
});
