import { Stack } from "expo-router";
import { TodoProvider } from "../context/TodoContext";

export default function RootLayout() {
  return (
    <TodoProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="detail" />
        <Stack.Screen
          name="add"
          options={{ presentation: "modal" }}
        />
      </Stack>
    </TodoProvider>
  );
}
