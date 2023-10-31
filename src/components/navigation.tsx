import {useState} from "react";
import {useAuth} from "react-oidc-context";
import {useNavigate} from "react-router-dom";

export default function Navigation() {
    const [showMenu, setMenuVisible] = useState(false);
    const auth = useAuth()
    const navigate = useNavigate();
    
    function Link(props: {target: string, children: any}) {
        return (
            <a className={`navbar-item has-text-${props.target === window.location.pathname ? 'primary' : 'white' }`}
                onClick={() => {
                    setMenuVisible(false);
                    navigate(props.target);
                }}>
                {props.children}
            </a>
        )
    }

    // if the authentication information is still loading return an empty div
    if (auth.isLoading) {
        return (
            <nav className={`navbar is-dark is-fixed-top`} role={"navigation"} aria-label={"main navigation"}>
                <div className={"navbar-brand has-background-dark"}>
                    <a className={"navbar-item"} onClick={() => navigate("/")}>
                        <img alt={"favicon"} src={"/images/favicon-32x32.png"} height={28} style={{color: "#ffdd00"}}/>
                    </a>

                    <a role="button" className={`navbar-burger ${showMenu ? 'is-active' : ''}`} aria-label="menu"
                       aria-expanded="false"
                       onClick={() => setMenuVisible(!showMenu)}>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>
                <div className={`navbar-menu ${showMenu ? 'is-active' : ''}`}>

                </div>
            </nav>
        );
    }

    // now get the current user
    let user = auth.user
    if (!user) {
        return (
            <nav className={`navbar is-dark is-fixed-top`} role={"navigation"} aria-label={"main navigation"}>
                <div className={"navbar-brand has-background-dark"}>
                    <a className={"navbar-item"} href={"/"}>
                        <img alt={"favicon"} src={"/images/favicon-32x32.png"} height={28} style={{color: "#ffdd00"}}/>
                    </a>

                    <a role="button" className={`navbar-burger ${showMenu ? 'is-active' : ''}`} aria-label="menu"
                       aria-expanded="false"
                       onClick={() => setMenuVisible(!showMenu)}>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>
                </div>
                <div className={`navbar-menu ${showMenu ? 'is-active' : ''}`}>

                </div>
            </nav>
        );
    }

    function logoutUser() {
        auth.removeUser()
        auth.signoutRedirect()
    }

    // now render the navigation bar
    return (
        <nav className={`navbar is-dark is-fixed-top`} role={"navigation"} aria-label={"main navigation"}>
            <div className={"navbar-brand has-background-dark"}>
                <a className={"navbar-item"} href={"/"}>
                    <img alt={"favicon"} src={"/images/favicon-32x32.png"} height={28} style={{color: "#ffdd00"}}/>
                </a>

                <a role="button" className={`navbar-burger ${showMenu ? 'is-active' : ''}`} aria-label="menu"
                   aria-expanded="false"
                   onClick={() => setMenuVisible(!showMenu)}>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <div className={`navbar-menu has-background-dark ${showMenu ? 'is-active' : ''}`}>
                <div className={"navbar-start"}>
                    {/* Now create the menu containing the user information on mobile devices */}
                    <div className={"navbar-item is-hidden-desktop"}>
                        <div className={"columns is-mobile"}>
                            <div className={"colum is-2"}>
                                <figure className={"image m-0 is-flex is-fullwidth"}>
                                    <img
                                        alt={"profile image"}
                                        className={"is-rounded is-flex"}
                                        style={{maxHeight: "fit-content"}}
                                        src={user?.profile.picture}/>
                                </figure>
                            </div>
                            <div className={"column"}>
                                <p className={"has-text-left has-text-white"}>
                                        <span className={"has-text-weight-bold has-text-white"}>
                                            {user?.profile.name}
                                        </span>
                                    <span className={"mx-1"}>
                                            &ndash;
                                        </span>
                                    {user?.profile.preferred_username}
                                </p>
                                <button
                                    className={"button is-danger is-small is-fullwidth"}
                                    onClick={() => logoutUser()}>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Now render the links to the pages of the app */}
                    {/* TODO: Add routes during development */}
                    <Link target={"/"}>Home</Link>
                    <Link target={"/cash-register"}>Kasse</Link>
                    <Link target={"/statistics"}>Statistiken</Link>
                </div>
                <div className={"navbar-end"}>
                    <Link target={"/settings"}>Einstellungen</Link>
                    <div className={"navbar-item is-hidden-touch"}>
                        <div className={"dropdown is-right is-hoverable"}>
                            <div className={"dropdown-trigger"}>
                                <div className={"buttons"}>
                                    <div className={"button is-rounded"} style={{
                                        backgroundImage: `url(${user?.profile.picture})`,
                                        backgroundSize: "cover"
                                    }}></div>
                                </div>
                            </div>
                            <div className={"dropdown-menu"}>
                                <div className={"dropdown-content"}>
                                    <div className={"dropdown-item"}>
                                        <div className={"is-block has-text-centered"}>
                                            <p className={"has-text-weight-bold is-size6 mb-0"}>{user?.profile.name}</p>
                                            <p className={"has-text-weight-light"}>{user?.profile.preferred_username}</p>
                                        </div>
                                    </div>
                                    <div className={"dropwdown-divider has-background-grey-light m-2"}
                                         style={{height: "2px"}}></div>
                                    <div className={"dropdown-item"}>
                                        <button onClick={() => logoutUser()}
                                                className={"button is-danger is-fullwidth is-small"}>Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}