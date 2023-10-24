import {useAuth} from "react-oidc-context";
import {useTranslation} from "react-i18next";

export default function LoginPage() {
    const auth = useAuth();
    const {t} = useTranslation();

    // check the current login process state
    if (auth.activeNavigator) {
        return (
            <div className={"hero is-dark is-fullheight"}>
                <div className={"hero-body"}>
                    <div className={"container"}>
                        <div className={"heading"}>
                            <p>{t(`login.authStates.${auth.activeNavigator}`)}</p>
                        </div>
                        <div className={"block"}>
                            <progress max={100} className={"progress"}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // now check if the authentication data is being loaded
    if (auth.isLoading) {
        return (
            <div className={"hero is-dark is-fullheight"}>
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

        return (
            <div className={"hero has-background-danger-dark is-fullheight"}>
                <div className={"hero-body"}>
                    <div className={"container"}>
                        <div className={"heading"}>
                            <p>{t(`login.error`)}</p>
                        </div>
                        <div className={"box"}>
                            <p className={"is-family-code"}>
                                {auth.error.stack}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // now check if the authentication wsa successful
    if (auth.isAuthenticated) {
        window.location.replace("/")
    }
    // now try to infer the hostname of the identity provider
    let idpUrl = new URL(auth.settings.authority)

    // since nothing of the cases fit, display the login page
    return (
        <div className={"hero is-dark is-fullheight"}>
            <div className={"hero-body"}>
                <div className={"container"}>
                    <div className={"title"}>
                        <p>{t(`title`)}</p>
                    </div>
                    <div className={"subtitle"}>
                        <p>{t(`login.information`)}</p>
                    </div>
                    <button className={"button is-fullwidth is-medium is-link"} onClick={() => auth.signinRedirect()}>
                        {t(`login.usingIDP`)}
                    </button>
                </div>
            </div>
            <div className={"hero-foot"}>
                <p className={"has-text-right"}>
                    {t(`login.hint.currentIDP`)}&ensp;
                    <span className={"is-family-code"}>
                        {`${idpUrl.protocol}//${idpUrl.host}`}&nbsp;
                    </span>
                </p>
            </div>
        </div>
    )
}