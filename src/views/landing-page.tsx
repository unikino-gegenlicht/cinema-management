import {useAuth} from "react-oidc-context";
import {useTranslation} from "react-i18next";
import {Navigate, useNavigate} from "react-router-dom";

export default function LandingPage() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    let auth = useAuth();
    let user = auth.user;
    if (auth.isLoading) {
        return <div></div>
    }
    if (!auth.isAuthenticated) {
        return <Navigate to={"/login"}></Navigate>
    }
    return (
        <div className={"p-1"}>
            <h1 className={"title has-text-centered mb-5"}>
                {t("welcome")}, {user?.profile.name}
            </h1>
            <p className={"buttons is-centered are-medium"}>
                <button className={"button is-primary"} onClick={() => navigate('/cash-register')}>
                    <span className={"icon"}>
                        <i className={"fa-solid fa-cash-register"}>
                        </i>
                    </span>
                    <span>Kasse</span>
                </button>
            </p>
        </div>
    )
}