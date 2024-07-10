import { initReactI18next, useTranslation } from "react-i18next";
import i18next from "i18next";
import { SplashScreen, Stack } from "expo-router";
import * as Localization from "expo-localization";
import { useColorScheme } from "react-native";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { MD3DarkTheme, MD3LightTheme, PaperProvider, Text, adaptNavigationTheme } from "react-native-paper";
import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationLightTheme
} from '@react-navigation/native';
import { SafeAreaProvider } from "react-native-safe-area-context";

// SplashScreen.preventAutoHideAsync();

export default function Layout() {
    i18next
        .use(initReactI18next)
        .init({
            compatibilityJSON: "v3",
            lng: Localization.getLocales()[0].languageCode
        });

    const colorScheme = useColorScheme();
    let material3Theme = useMaterial3Theme();
    let { t } = useTranslation();

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

    // TODO: Move into other function
    SplashScreen.hideAsync()

    return(
        <SafeAreaProvider>
            <PaperProvider theme={theme}>
               <Text>This works!</Text>
            </PaperProvider>
        </SafeAreaProvider>
    )

}