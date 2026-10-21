import { Stack } from "expo-router";
import { TodoProvider } from "../context/TodoContext";

export default function RootLayout() {
  return (
    <TodoProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ title: "Mina todos" }}
        />
        <Stack.Screen
          name="detail"
          options={{ title: "Detaljer" }}
        />
        <Stack.Screen
          name="add"
          options={{
            title: "Ny todo",
            presentation: "modal",
          }}
        />
      </Stack>
    </TodoProvider>
  );
}
