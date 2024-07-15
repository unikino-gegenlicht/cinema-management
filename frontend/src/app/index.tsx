import { Text } from "react-native-paper";
import { View } from "react-native";
import { useCallback, useContext, useEffect, useState } from "react";
import { LocalConfigurationCtx } from "../providers/configuration";
import { Redirect, Slot, useNavigation, useRouter } from "expo-router";

export default function Index() {
    let config = useContext(LocalConfigurationCtx)
    let router = useRouter();

    if (!config) {
        return <Redirect href={'setup'}/>
    }

    return (
        <View>
            <Text>Hello</Text>
        </View>
    )
}