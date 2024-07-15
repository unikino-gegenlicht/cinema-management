import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationLightTheme
} from '@react-navigation/native';
import * as Localization from "expo-localization";
import { SplashScreen, Stack, } from "expo-router";
import i18next from "i18next";
import React, { useState } from "react";
import { initReactI18next } from "react-i18next";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider, adaptNavigationTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LocalConfigurationCtx } from "../providers/configuration";

SplashScreen.preventAutoHideAsync();

i18next
    .use(initReactI18next)
    .init({
        initImmediate: true,
        compatibilityJSON: "v3",
        lng: Localization.getLocales()[0].languageCode,
        fallbackLng: 'en',
        resources: {
            "en": require('../public/i18n/en.json'),
            "de": require('../public/i18n/de.json')
        },
    });

export default function Layout() {


    const colorScheme = useColorScheme();
    let material3Theme = useMaterial3Theme();

    const { LightTheme, DarkTheme } = adaptNavigationTheme({
        reactNavigationDark: NavigationDarkTheme,
        reactNavigationLight: NavigationLightTheme
    })

    const paperLightTheme = {
        ...MD3LightTheme,
        ...LightTheme,
        colors: {
            ...MD3LightTheme.colors,
            ...LightTheme.colors
        }
    }

    const paperDarkTheme = {
        ...MD3DarkTheme,
        ...DarkTheme,
        colors: {
            ...MD3DarkTheme.colors,
            ...DarkTheme.colors
        }
    }

    const theme = colorScheme === 'dark' ?
        { ...paperDarkTheme, colors: material3Theme.theme.dark } :
        { ...paperLightTheme, colors: material3Theme.theme.light }

    let [localConfiguration, setLocalConfiguration] = useState<LocalConfiguration>(undefined)

    React.useEffect(() => {
        if (localConfiguration !== undefined) {
            return
        }
        let { getItem, setItem } = useAsyncStorage('@cmm_local_config')
        let value = getItem()
        value.then((res) => {
            let config: LocalConfiguration = JSON.parse(res)
            setLocalConfiguration(config)
        })
    })


    if (localConfiguration === undefined) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
                <LocalConfigurationCtx.Provider value={localConfiguration}>
                    <Stack screenOptions={{
                        contentStyle: { backgroundColor: theme.colors.background },
                        headerStyle: { backgroundColor: theme.colors.primaryContainer },
                        headerTintColor: theme.colors.primary
                    }}>
                    </Stack>
                </LocalConfigurationCtx.Provider>
            </PaperProvider>
        </SafeAreaProvider>
    )

}