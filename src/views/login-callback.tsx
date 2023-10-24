import {useTranslation} from "react-i18next";

export default function LoginCallback() {
    const {t} = useTranslation();

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