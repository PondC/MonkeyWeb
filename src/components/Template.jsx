import React from "react"
import Navbar from "./Navbar.jsx"
// import Footer from "./Footer.jsx"

export default function Template(props){
    return (
        <div>
            {props.showNavbar?<Navbar/>:null}
            {props.body}
        </div>
    )
}
