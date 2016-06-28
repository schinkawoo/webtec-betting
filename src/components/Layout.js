/**
 * Created by nes on 12/06/16.
 */
import React from "react";
import Footer from "../components/layout/Footer";
import Menu from "./layout/Menu";
    
export default class Layout extends React.Component {
    render() {
        const { location } = this.props;
        const containerStyle = {
            marginTop: "60px"
        };
        
        return (
            <div>

                <Menu location={location} />

                <div class="container" style={containerStyle}>
                    <div class="row">
                        <div class="col-lg-12">
                            

                            {this.props.children}

                        </div>
                    </div>
                    <Footer/>
                </div>
            </div>

        );
    }
}