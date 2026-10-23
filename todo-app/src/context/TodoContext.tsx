import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TodoCategory = "Hemma" | "Arbete" | "Studier" | "Personligt" | "Övrigt";

export type Todo = {
  id: string;
  title: string;
  description: string;
  date: string;
  category: TodoCategory;
  completed: boolean;
};

type TodoContextType = {
  todos: Todo[];
  addTodo: (title: string, date: string, category: TodoCategory, description?: string) => void;
  updateTodo: (id: string, title: string, description: string, date: string, category: TodoCategory) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  getTodo: (id: string) => Todo | undefined;
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);
const STORAGE_KEY = "@todo-app/todos";

function getDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialTodos(): Todo[] {
  const today = new Date();

  function dateOffset(offset: number) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return getDateString(date);
  }

  return [
    {
      id: "example-1",
      title: "Skoluppgift 1",
      description: "",
      date: dateOffset(0),
      category: "Studier",
      completed: false,
    },
    {
      id: "example-2",
      title: "Spela STS2",
      description: "",
      date: dateOffset(0),
      category: "Personligt",
      completed: true,
    },
    {
      id: "example-3",
      title: "Stäng retursopor",
      description: "",
      date: dateOffset(0),
      category: "Hemma",
      completed: true,
    },
    {
      id: "example-4",
      title: "Tvätta",
      description: "",
      date: dateOffset(1),
      category: "Hemma",
      completed: false,
    },
    {
      id: "example-5",
      title: "Skoluppgift 2",
      description: "",
      date: dateOffset(1),
      category: "Studier",
      completed: false,
    },
    {
      id: "example-6",
      title: "Ring läkaren",
      description: "",
      date: dateOffset(1),
      category: "Personligt",
      completed: false,
    },
    {
      id: "example-7",
      title: "Skoluppgift 3",
      description: "",
      date: dateOffset(2),
      category: "Studier",
      completed: false,
    },
    {
      id: "example-8",
      title: "Träffa P",
      description: "",
      date: dateOffset(2),
      category: "Personligt",
      completed: false,
    },
  ];
}

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTodos() {
      try {
        const savedTodos = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedTodos !== null) {
          setTodos(JSON.parse(savedTodos) as Todo[]);
        } else {
          setTodos(createInitialTodos());
        }
      } catch (error) {
        console.error("Kunde inte ladda todos:", error);
        setTodos(createInitialTodos());
      } finally {
        setIsLoaded(true);
      }
    }

    loadTodos();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    async function saveTodos() {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error("Kunde inte spara todos:", error);
      }
    }

    saveTodos();
  }, [todos, isLoaded]);

  function addTodo(title: string, date: string, category: TodoCategory, description = "") {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    setTodos((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        title: trimmedTitle,
        description: description.trim(),
        date,
        category,
        completed: false,
      },
    ]);
  }

  function updateTodo(id: string, title: string, description: string, date: string, category: TodoCategory) {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, title, description, date, category } : todo)));
  }

  function toggleTodo(id: string) {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  function getTodo(id: string) {
    return todos.find((todo) => todo.id === id);
  }

  return (
    <TodoContext.Provider
      value={{
        todos,
        addTodo,
        updateTodo,
        toggleTodo,
        deleteTodo,
        getTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);

  if (!context) {
    throw new Error("useTodos must be used inside TodoProvider");
  }

  return context;
}
