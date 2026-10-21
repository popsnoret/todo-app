import { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTodos } from "../context/TodoContext";

const colors = {
  background: "#D5E5E5",
  text: "#111111",
};

const taskColors: Record<string, string> = {
  Hemma: "#B3D9BD",
  Arbete: "#cfad99",
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

  const todayDate = new Date();
  const today = getDateString(todayDate);

  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(todayDate.getDate() + 1);
  const tomorrow = getDateString(tomorrowDate);

  const groupedTodos = [...todos]
    .sort((a, b) => a.date.localeCompare(b.date))
    .reduce<Record<string, typeof todos>>((groups, todo) => {
      if (!groups[todo.date]) {
        groups[todo.date] = [];
      }

      groups[todo.date].push(todo);
      return groups;
    }, {});

  const dates = [...new Set([...getNextThreeDays(), ...Object.keys(groupedTodos)])].sort();

  function openTodo(id: string) {
    router.push({
      pathname: "/detail",
      params: { id },
    });
  }

  return (
    <SafeAreaView
      style={styles.screen}
      testID="home-screen"
    >
      <View style={styles.header}>
        <Text style={styles.appTitle}>Att göra</Text>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/add")}
          accessibilityLabel="Lägg till uppgift"
          testID="add-todo"
        >
          <Text style={styles.plus}>+</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {dates.map((date) => {
          const dayTodos = groupedTodos[date] ?? [];
          const activeTodos = dayTodos.filter((todo) => !todo.completed);
          const completedTodos = dayTodos.filter((todo) => todo.completed);
          const isExpanded = expandedDays[date] ?? false;

          return (
            <View key={date}>
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
        })}
      </ScrollView>
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
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: colors.text,
  },
  appTitle: {
    fontSize: 25,
    fontFamily: "monospace",
    fontWeight: "700",
    color: colors.text,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 27,
    lineHeight: 30,
    color: colors.text,
  },
  list: {
    paddingBottom: 24,
  },
  dayHeader: {
    minHeight: 70,
    paddingHorizontal: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayTitle: {
    fontSize: 20,
    fontFamily: "monospace",
    fontWeight: "700",
    color: colors.text,
  },
  date: {
    fontSize: 15,
    textAlign: "right",
    lineHeight: 20,
    color: colors.text,
    textTransform: "capitalize",
  },
  taskRow: {
    minHeight: 42,
    paddingLeft: 38,
    paddingRight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkboxButton: {
    minWidth: 24,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  titlePressable: {
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
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
    fontSize: 16,
    fontFamily: "monospace",
    color: colors.text,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#45504F",
  },
  completedSection: {
    marginTop: 4,
  },
  completedHeader: {
    minHeight: 36,
    paddingHorizontal: 38,
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#45504F",
  },
  completedHeaderText: {
    fontSize: 13,
    fontFamily: "monospace",
    color: "#45504F",
  },
  completedRow: {
    opacity: 0.8,
  },
});
