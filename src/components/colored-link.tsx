import {Component} from "react";
import {useNavigate} from "react-router-dom"

class ColoredLink extends Component<any, any> {
    render() {
        const location = window.location;
        if (location.pathname === this.props.to) {
            return (
                <a
                    className={"navbar-item has-text-primary"}
                    onClick={() => this.props.navigate(this.props.to)}>
                    {this.props.children}
                </a>)
        }
        return (
            <a className={"navbar-item has-text-white"}
               onClick={() => this.props.navigate(this.props.to)}>
                {this.props.children}
            </a>
        )
    }
}

function NavigationLink(props: any) {
    const navigate = useNavigate();
    return <ColoredLink {...props} navigate={navigate}/>
}

export default NavigationLink;