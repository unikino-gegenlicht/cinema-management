import { useNavigation, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { ActivityIndicator, Button, Text, TextInput, Avatar } from "react-native-paper";

export default function Setup() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    let [serverAddress, setServerAddress] = useState('')
    let [urlValid, setUrlValid] = useState(false);
    let [configuring, setConfiguring] = useState(false);
    let [configurationStep, setConfigurationStep] = useState<'requesting-document'|'registering-device'|'Done'>('requesting-document')
    let [autoconfigResponse, setAutoconfigResponse] = useState<AutoconfigurationResponse>()


    let f = async () => {
        await SplashScreen.hideAsync()
    }

    useEffect(() => {
        navigation.setOptions({ title: t('Setup') })
    })

    useEffect(() => {
        if ((serverAddress.startsWith('http://') || serverAddress.startsWith('https://')) == false) {
            setUrlValid(false)
            return
        };
        try {
            new URL(serverAddress)
        } catch (e) {
            setUrlValid(false)
            return
        }
        setUrlValid(true)
    }, [serverAddress])

    useEffect(() => {
        if (configuring) {
            // TODO: Implement autoconfig in backend
            setTimeout(() => setConfigurationStep('registering-device'), 2500)
            setTimeout(() => setConfigurationStep('Done'), 5000)
            return
        }
        setConfigurationStep('requesting-document')
    }, [configuring])

    useEffect(() => {
        if (configurationStep !== 'Done') {
            return
        }
        console.log('setup done')

    }, [configurationStep])

    if (configuring) {
        return (
            <View style={{ paddingHorizontal: 8, justifyContent: 'space-between', flexGrow: 1 }}>
                <View style={{ alignItems: "center", alignContent: "center", flexGrow: 1, justifyContent: 'center'}}>
                    <ActivityIndicator size={"large"} animating={configurationStep !== 'Done'} />
                    <Text>
                        {t(configurationStep) /* i18next-extract-disable-line */}
                    </Text>
                </View>
                <Button mode="outlined" style={{ marginBottom: 8 }} onPress={() => setConfiguring(false)}>
                    {configurationStep === 'Done' ? t('Done') : t('Cancel')}
                </Button>
            </View>
        )
    }

    return (
        <View style={{ paddingHorizontal: 8, justifyContent: 'space-between', flexGrow: 1 }} onLayout={f}>
            <View>
                <Text variant="bodyMedium">
                    {t('setup-explanation')}
                </Text>
                <TextInput mode="flat" onChangeText={text => setServerAddress(text)} value={serverAddress} autoCapitalize="none" textContentType="URL" keyboardType="url" style={{ marginTop: 8 }} label={t('Server Address')} />
            </View>
            <Button disabled={!urlValid} mode="contained" style={{ marginBottom: 8 }} onPress={() => setConfiguring(true)}>
                {t('Next')}
            </Button>
        </View>
    )
}