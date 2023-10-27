import {hasAuthParams, useAuth} from "react-oidc-context";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export default function LoginPage() {
    const auth = useAuth();
    const {t} = useTranslation();
    const [triedSignIn, setTriedSignIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!hasAuthParams() &&
            !auth.isAuthenticated &&
            !auth.activeNavigator &&
            !auth.isLoading &&
            !triedSignIn) {
            auth.signinRedirect().then(() => {setTriedSignIn(true)}).catch((err) => {console.error(err)})
        }
    }, [auth, triedSignIn])

    // now check if the authentication data is being loaded
    if (auth.isLoading) {
        return (
            <div className={"hero is-dark is-fullheight is-fullheight-with-navbar"}>
                <div className={"hero-body"}>
                    <div className={"container"}>
                        <div className={"heading"}>
                            <p>{t(`login.loadingUserInfo`)}</p>
                        </div>
                        <div className={"block"}>
                            <progress max={100} className={"progress"}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // now check if an error occurred during the login
    if (auth.error) {
        // log the error into the console
        console.error(auth.error)
    }

    // now check if the authentication wsa successful
    if (auth.isAuthenticated) {
        navigate("/")
    }
    // now try to infer the hostname of the identity provider
    let idpUrl = new URL(auth.settings.authority)

    // since nothing of the cases fit, display the login page

}