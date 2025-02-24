import { Stack } from "expo-router";

import React from "react";

import { Colors } from "../../constants/Colors";

export default function Index() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="note/[id]"
        options={{
          title: "",
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
          headerTintColor: Colors.dark.text,
        }}
      />
    </Stack>
  );
}
