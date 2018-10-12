import React, { Component } from 'react';
import './App.css';

import SSMLEditor from './editor';

class App extends Component {
  saveHTML(html) {
    localStorage.setItem("content", html);
  }

  render() {
    const html = localStorage.getItem("content") || "<p></p>";

    return (
      <div className="App">
        <SSMLEditor loadHTML={html} handleHTML={this.saveHTML.bind(this)} />
      </div>
    );
  }
}

export default App;
