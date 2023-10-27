import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import {User, WebStorageStateStore} from "oidc-client-ts";
import reportWebVitals from './reportWebVitals';

import './i18n';
import {AuthProvider} from "react-oidc-context";
import axios from "axios";
import {BrowserRouter as Router} from "react-router-dom";
import App from "./App";

/**
 * This part configures the OpenID Connect configuration for the 'react-oidc-context'
 * library used to manage the authentication for this platform
 */

// get the openid connect configuration from the environment during build
let oidcAuthority = process.env.REACT_APP_OIDC_AUTHORITY
let oidcClientID = process.env.REACT_APP_OIDC_CLIENT_ID

// now check if the variables are present
if (!oidcAuthority) {
    throw new Error("OpenID Connect authority not configured during build")
}
if (!oidcClientID) {
    throw new Error("OpenID Connect client id not configured during build")
}

// now setup the configuration of the open id connect component
const oidcConfig = {
    authority: oidcAuthority,
    client_id: oidcClientID,
    redirect_uri: window.location.protocol + "//" + window.location.host + "/",
    scope: "openid profile email",
    loadUserInfo: true,
    automaticSilentRenew: true,
    onSigninCallback: (user: User | void) => {
        window.history.replaceState({}, document.title, window.location.pathname)
    },
    userStore: new WebStorageStateStore({store: window.sessionStorage})
}

/**
 * This part sets up the authentication on API calls.
 * Since the project uses axios as a library to make calls to the api
 */
axios
    .interceptors
    .request
    .use(
        request => {

            // generate the session storage key to get the user information
            let userSessionStorageKey = `oidc.user:${oidcAuthority}:${oidcClientID}`
            // get the user information from the session storage
            let userSessionStorageItem = sessionStorage.getItem(userSessionStorageKey)
            // check if user information was returned
            if (!userSessionStorageItem) {
                // since there is no user information available, just send the request as is
                console.warn("no user available in session storage. using unauthenticated request")
                return Promise.reject("no user available")
            }

            // now generate a user from the session storage
            let user = User.fromStorageString(userSessionStorageItem);

            // now add the access token of the user to the Authorization header of the request
            request.headers["Authorization"] = `${user.token_type} ${user.access_token}`
            return request;

        },
        error => {
            return Promise.reject(error);
        }
    )

/**
 * This part sets up the rendering of the whole project
 */

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <Router>
            <AuthProvider {...oidcConfig}>
                <App></App>
            </AuthProvider>
        </Router>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
