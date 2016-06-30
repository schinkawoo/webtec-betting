import React from "react";
import { Link } from "react-router";

export default class Menu extends React.Component {
    constructor() {
        super()
        this.state = {
            collapsed: true,
        };
    }

    toggleCollapse() {
        if(this.mounted) {
            const collapsed = !this.state.collapsed;
            this.setState({collapsed});
        }
    }

    componentWillUnMount(){
        this.mounted = false;
    }

    componentDidMount(){
        this.mounted = true;
    }



    render() {
        const { location } = this.props;
        const { collapsed } = this.state;

        const standingsClass = location.pathname === "/" ? "active" : "";
        const navClass = collapsed ? "collapse" : "";

        return (
            <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
                <div class="container">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle" onClick={this.toggleCollapse.bind(this)} >
                            <span class="sr-only">Toggle navigation</span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                            <span class="icon-bar"></span>
                        </button>
                    </div>
                    <div class={"navbar-collapse " + navClass} id="bs-example-navbar-collapse-1">
                        <ul class="nav navbar-nav">
                            <li class={standingsClass}>
                                <Link to="/" onClick={this.toggleCollapse.bind(this)}>Silvio Is Ass</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        );
    }
}
