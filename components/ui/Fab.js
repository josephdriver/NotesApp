import React from "react";
import { StyleSheet, View, Pressable } from "react-native";

import { Colors } from "../../constants/Colors";
import { Icon } from "@rneui/themed";

export default function Fab({ handlePress, icon }) {
	return (
		<Pressable onPress={handlePress}>
			<View>
				<Icon
					reverse
					name={icon}
					type="ionicon"
					color={Colors.dark.primary}
					size={30}
				/>
			</View>
		</Pressable>
	);
}
