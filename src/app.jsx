import React from "react"
import ReactDom from "react-dom"
import "bootstrap"
import "./scss/style.scss"
$(function(){
	$.post("plus",{a:1,b:2},function(result){
		if(confirm("Heyyyy")){
			ReactDom.render(<h2>{result.num}</h2>,document.getElementById("react-root"));
		}
	});
});
class Test extends React.Component {
	constructor(){
		super();
		this.state={
			message: "What the Food!",
			load: "Here I cow!!"
		}
	}
	render(){
		return <h1>{this.state.message}{this.state.load}<Button/></h1>
	}
}
function Button() {
	return <button className="btn btn-default">Click</button>
}

ReactDom.render(<Test/>,document.getElementById("react-root"));
