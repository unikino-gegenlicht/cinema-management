import {useAuth} from "react-oidc-context";
import React, {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {Route, Routes} from "react-router-dom";
import Navigation from "./components/navigation";
import LandingPage from "./views/landing-page";
import CashRegister from "./views/cash-register";
import {toast} from "bulma-toast";
import Statistics from "./views/statistics";


export default function App() {
    const auth = useAuth();
    const {t} = useTranslation();


    useEffect(() => {
        return auth.events.addSilentRenewError(() => {
            console.warn("unable to silently renew expiring access token")
            auth.removeUser()
            toast({
                message: t(`errors.tokenRenewFailed`),
                type: "is-warning",
                position: "center",
                dismissible: false,
                single: true,
                duration: 5000,
                animate: {
                    in: 'fadeIn',
                    out: 'fadeOut'
                }
            })
        })
    }, [auth.events, t, auth]);

    let page = document.getElementsByTagName("html").item(0);
    if (auth.isLoading) {
        page?.classList.remove("has-navbar-fixed-top")
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

    if (!auth.isAuthenticated) {
        let idpUrl = new URL(auth.settings.authority)
        page?.classList.remove("has-navbar-fixed-top")
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
                        <button className={"button is-fullwidth is-medium is-link"}
                                onClick={() => auth.signinRedirect()}>
                            {t(`login.usingIDP`)}
                        </button>
                    </div>
                </div>
                <div className={"hero-foot"}>
                    <p className={"has-text-right"}>
                        {t(`hint.currentIDP`)}&ensp;
                        <span className={"is-family-code"}>
                        {`${idpUrl.protocol}//${idpUrl.host}`}&nbsp;
                    </span>
                    </p>
                </div>
            </div>
        )
    }

    page?.classList.add("has-navbar-fixed-top")
    return (
        <div>
            <Navigation/>
            <Routes>
                <Route path={"/"} element={<LandingPage/>}/>
                <Route path={"/cash-register"} element={<CashRegister/>}/>
                <Route path={"/statistics"} element={<Statistics/>}/>
            </Routes>
        </div>
    )
}