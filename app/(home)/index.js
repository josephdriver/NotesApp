import React, { useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { Link, useLocation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Icon } from "@rneui/themed";
import { useFocusEffect } from "@react-navigation/native";

import { Colors } from "../../constants/Colors";

const Item = ({ item }) => {
  const { title, text } = item;

  return (
    <Link
      href={{
        pathname: "/note/[id]",
        params: { id: item.id },
      }}
      style={[
        styles.item,
        {
          backgroundColor: Colors.dark.secondaryBackground,
          borderColor: Colors.dark.primaryTint,
        },
      ]}
    >
      <View>
        {title && (
          <Text style={[styles.title, { color: Colors.dark.text }]}>
            {title}
          </Text>
        )}
        {text && (
          <Text style={[styles.text, { color: Colors.dark.text }]}>{text}</Text>
        )}
      </View>
    </Link>
  );
};

export default function HomeScreen() {
  const [data, setData] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      const getData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem("notes");
          if (jsonValue !== null) {
            setData(JSON.parse(jsonValue));
          }
        } catch (e) {
          console.error(e);
        }
      };
      getData();
    }, [])
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.dark.background }]}
    >
      <FlatList
        data={data}
        renderItem={({ item }) => <Item item={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.footer}>
            <Text style={[{ color: Colors.dark.text }]}>
              No notes saved, add some notes...
            </Text>
          </View>
        }
      />

      <Link
        style={styles.slush}
        href={{
          pathname: "/note/[id]",
          params: { id: "new" },
        }}
      >
        <View style={styles.fab}>
          <Icon
            reverse
            name="add"
            type="ionicon"
            color={Colors.dark.primary}
            size={25}
          />
        </View>
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
  },
  text: {
    fontSize: 14,
  },
  footer: {
    flex: 1,
    fontSize: 22,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  slush: { position: "absolute", bottom: 20, right: 20, marginBottom: 20 },
});
