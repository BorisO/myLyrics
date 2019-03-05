import React, { Component } from "react";
import { Route, Redirect, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import LoginForm from "./components/loginForm";
import RegisterForm from "./components/registerForm";
import Logout from "./components/logout";
import NotFound from "./components/notFound";
import ProtectedRoute from "./components/common/protectedRoute";
import Lyrics from "./components/lyrics";
import NavBar from "./components/common/navBar";
import auth from "./services/authService";
import ChooseProvider from "./components/chooseProvider";

class App extends Component {
  state = {};

  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    return (
      <React.Fragment>
        <ToastContainer />
        <NavBar user={user} />
        <main className="container">
          <Switch>
            <Route path="/login" component={LoginForm} />
            <Route path="/register" component={RegisterForm} />
            <Route path="/provider" component={ChooseProvider} />
            <Route path="/logout" component={Logout} />
            <ProtectedRoute path="/spotify" component={Lyrics} />
            <Route path="/not-found" component={NotFound} />
            <ProtectedRoute from="/" exact to="/provider" />
            <Redirect to="not-found" />
          </Switch>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
