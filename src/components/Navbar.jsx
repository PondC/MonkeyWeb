import React from "react"

export default class Navbar extends React.Component{
    render(){
        return (
            <nav className="navbar navbar-expand-sm navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="home">Monkey</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div id="navbarNav" className="collapse navbar-collapse">
                        <div className="navbar-nav">
                            <a className="nav-item nav-link" href="#" onClick={()=>alert("loadRegistrationPage();")}>Register</a>
                            <div className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" data-toggle="dropdown">Form</a>
                                <div className="dropdown-menu">
                                    <a className="dropdown-item" href="#">Donkey</a>
                                    <a className="dropdown-item" href="#">Perm</a>
                                </div>
                            </div>
                        </div>
                        <div className="navbar-nav ml-auto">
                            <a className="nav-item nav-link" href="#" onClick={()=>alert("loadRegistrationPage();")}>Register</a>
                        </div>
                    </div>
                </div>
            </nav>
        )
    }
}
