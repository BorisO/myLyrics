import React, { Component } from "react";
import ListGroup from "./common/listGroup";
import auth from "../services/authService";
import { getAuthCode } from "../services/spotifyService";

class ChooseProvider extends Component {
  state = {
    providers: [
      { name: "spotify" },
      { name: "itunes (future)" },
      { name: "souncloud(future)" }
    ],
    selectedProvider: null
  };

  componentDidMount() {
    const user = auth.getCurrentUser();
    this.setState({ user });
  }

  handleProviderSelect = provider => {
    this.setState({ selectedProvider: provider });
  };

  goToAuth = async () => {
    switch (this.state.selectedProvider.name) {
      case "spotify":
        let { data: authCode } = await getAuthCode(this.state.user._id);
        window.location = authCode;
        break;
      default:
        alert("This functionality hasn't been invented yet.");
    }
  };

  goToLyrics = () => {
    let newPath = "/";
    this.props.history.push({
      pathname: newPath,
      provider: this.state.selectedProvider
    });
  };

  render() {
    return (
      <div className="row">
        <div className="col">
          <ListGroup
            items={this.state.providers}
            selectedItem={this.state.selectedProvider}
            onItemSelect={this.handleProviderSelect}
          />
        </div>
        <button className="btn btn-primary" onClick={this.goToAuth}>
          Continue
        </button>
      </div>
    );
  }
}

export default ChooseProvider;
