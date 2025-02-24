import React, { useCallback, useEffect, useState, useMemo } from "react";
import { StyleSheet, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Input, BottomSheet, ListItem } from "@rneui/themed";
import { Icon } from "@rneui/base";

import { Colors } from "../../../constants/Colors";
import { idGenerator } from "../../../utilities/idGenerator";
import { CATEGORIES } from "../../../data/categories";
import { CLIENTS } from "../../../data/clients";
import { ListItemCheckBox } from "@rneui/base/dist/ListItem/ListItem.CheckBox";

export default function NoteScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();

  const [isVisible, setIsVisible] = useState(false);
  const [accordions, setAccordions] = useState({
    showCategories: false,
    showClients: false,
  });
  const [item, setItem] = useState({
    id: null,
    title: "",
    text: "",
    category_id: null,
    client_id: null,
  });

  const updateItem = useCallback(
    (property, value) => {
      console.log("property", property);
      let updatedItem = { ...item, [property]: value };

      if (!updatedItem.id) {
        updatedItem.id = idGenerator();
      }
      setItem(updatedItem);
    },
    [item]
  );

  const saveItem = async (item) => {
    try {
      const jsonValue = await AsyncStorage.getItem("notes");
      let notes = jsonValue != null ? JSON.parse(jsonValue) : [];

      const existingNoteIndex = notes.findIndex((note) => note.id === item.id);
      if (existingNoteIndex > -1) {
        notes[existingNoteIndex] = item;
      } else {
        notes.push(item);
      }
      await AsyncStorage.setItem("notes", JSON.stringify(notes));
    } catch (e) {
      console.error(e);
    }
  };

  // Save item to AsyncStorage when navigating away
  useEffect(() => {
    const beforeRemoveListener = navigation.addListener(
      "beforeRemove",
      async (e) => {
        await saveItem(item);
        navigation.dispatch(e.data.action);
      }
    );

    return () => {
      beforeRemoveListener();
    };
  }, [navigation, item]);

  // Delete note from AsyncStorage
  const handleDelete = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("notes");
      let notes = jsonValue != null ? JSON.parse(jsonValue) : [];

      const newNotes = notes.filter((note) => note.id !== item.id);
      await AsyncStorage.setItem("notes", JSON.stringify(newNotes));

      router.push("/", { relativeToDirectory: true });
    } catch (e) {
      console.error(e);
    }
    setIsVisible(false);
  }, [item]);

  const list = useMemo(
    () => [
      { title: "Categories", type: "category", id: 1 },
      { title: "Clients", type: "client", id: 2 },
      {
        title: "Delete",
        type: "delete",
        onPress: () => handleDelete(),
        id: 3,
      },
      {
        title: "Close",
        onPress: () => setIsVisible(false),
        id: 4,
      },
    ],
    [handleDelete]
  );

  const getCheckedState = useCallback(
    (id, param) => {
      if (item[param] === id) {
        return true;
      }
      return false;
    },
    [item]
  );

  const handleToggle = useCallback(
    (id, param) => {
      if (item[param] === id) {
        setItem((prevState) => ({
          ...prevState,
          [param]: null,
        }));
      } else {
        setItem((prevState) => ({
          ...prevState,
          [param]: id,
        }));
      }
    },
    [item]
  );

  // fetch note data from AsyncStorage
  useEffect(() => {
    if (id === "new") {
      return setItem({
        id: null,
        title: "",
        text: "",
        category_id: null,
        client_id: null,
      });
    }
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("notes");
        if (jsonValue !== null) {
          const notes = JSON.parse(jsonValue);
          const note = notes.find((note) => note.id === id);

          if (!note || !notes) {
            setItem({
              id: null,
              title: "",
              text: "",
              category_id: null,
              client_id: null,
            });
          } else {
            setItem(note);
          }
        } else {
          setItem({
            id: null,
            title: "",
            text: "",
            category_id: null,
            client_id: null,
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    getData();
  }, [id]);

  const accordion = useCallback(
    (data, title, type) => {
      return (
        <ListItem.Accordion
          key={"accordion-" + title}
          bottomDivider
          content={
            <>
              <ListItem.Content>
                <ListItem.Title
                  style={[styles.accordionTitle, { color: Colors.dark.text }]}
                >
                  {title}
                </ListItem.Title>
              </ListItem.Content>
            </>
          }
          containerStyle={{
            backgroundColor: Colors.dark.secondaryBackground,
          }}
          isExpanded={accordions[type]}
          onPress={() => {
            setAccordions((prevState) => ({
              ...prevState,
              [type]: !prevState[type],
            }));
          }}
        >
          {data.map((l) => (
            <ListItem
              key={l.id}
              containerStyle={[
                styles.listContent,
                {
                  backgroundColor: Colors.dark.secondaryBackground,
                },
              ]}
              onPress={() => {
                handleToggle(
                  l.id,
                  type === "showCategories" ? "category_id" : "client_id"
                );
              }}
            >
              <ListItem.Content style={[styles.listContent]}>
                <ListItem.Title
                  style={[styles.text, { color: Colors.dark.text }]}
                >
                  {l.name}
                </ListItem.Title>
                <ListItemCheckBox
                  containerStyle={{
                    backgroundColor: Colors.dark.secondaryBackground,
                  }}
                  checked={getCheckedState(
                    l.id,
                    type === "showCategories" ? "category_id" : "client_id"
                  )}
                />
              </ListItem.Content>
            </ListItem>
          ))}
        </ListItem.Accordion>
      );
    },
    [accordions, getCheckedState, handleToggle]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.dark.background }]}
    >
      <ScrollView>
        <Input
          placeholder="Title"
          inputStyle={{ color: Colors.dark.text, fontSize: 22 }}
          onChangeText={(value) => updateItem("title", value)}
          value={item.title}
        />
        <Input
          placeholder="Note"
          inputStyle={{ color: Colors.dark.text, fontSize: 16 }}
          inputContainerStyle={{
            borderColor: Colors.dark.background,
          }}
          multiline={true}
          numberOfLines={15}
          onChangeText={(value) => updateItem("text", value)}
          value={item.text}
        />
      </ScrollView>
      <View
        style={[
          styles.drawer,
          { backgroundColor: Colors.dark.secondaryBackground },
        ]}
      >
        <Icon
          name="menu"
          type="ionicon"
          color={Colors.dark.text}
          style={styles.menuIcon}
          size={35}
          onPress={() => setIsVisible((prevState) => !prevState)}
        />
      </View>
      <BottomSheet
        modalProps={{}}
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
      >
        {list.map((l) => {
          if (l.type === "category") {
            return accordion(CATEGORIES, "Categories", "showCategories");
          } else if (l.type === "client") {
            return accordion(CLIENTS, "Clients", "showClients");
          } else {
            return (
              <ListItem
                key={l.id}
                containerStyle={{
                  backgroundColor: Colors.dark.secondaryBackground,
                }}
                onPress={l.onPress}
              >
                <ListItem.Content style={[styles.listContent]}>
                  <ListItem.Title
                    style={[styles.text, { color: Colors.dark.text }]}
                  >
                    {l.title}
                  </ListItem.Title>
                  {l.type === "delete" && (
                    <Icon name="trash" type="ionicon" color="red" size={25} />
                  )}
                </ListItem.Content>
              </ListItem>
            );
          }
        })}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notes: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    paddingBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  drawer: {
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingRight: 20,
  },
  menuIcon: {
    alignSelf: "flex-end",
  },
  listContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  accordionTitle: {
    fontSize: 22,
    color: Colors.dark.text,
    fontWeight: "bold",
  },
});
