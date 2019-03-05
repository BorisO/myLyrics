import React, { Component } from "react";
import ListGroup from "./common/listGroup";
import {
  getRecentlyPlayed,
  getCurrentlyPlaying
} from "../services/spotifyService";
import auth from "../services/authService";

class Lyrics extends Component {
  state = {
    provider: this.props.location.pathname.slice(1),
    recentlyPlayed: [],
    currentPlayback: {},
    selectedSong: {},
    user: {}
  };

  async componentDidMount() {
    const user = await auth.getCurrentUser();
    this.setState({ user });

    // based on provider, get music
    switch (this.state.provider) {
      case "spotify":
        let { data: recentlyPlayed } = await getRecentlyPlayed(
          this.state.user._id
        );
        let { data: currentPlayback } = await getCurrentlyPlaying(
          this.state.user._id
        );
        this.setState({
          recentlyPlayed,
          currentPlayback
        });
        console.log();
        break;
      default:
        alert("This provider doesn't exist.");
    }
  }

  handleSongSelect = song => {
    this.setState({ selectedSong: song });
  };

  render() {
    let { recentlyPlayed, currentPlayback, currentSelection } = this.state;

    return (
      <div className="row">
        <div className="col-4">
          <h1>My Music</h1>
          <ListGroup
            items={this.state.recentlyPlayed}
            selectedItem={this.state.selectedSong}
            onItemSelect={this.handleSongSelect}
            textProperty={"song.name"}
          />
        </div>
        <div className="col-8">
          <h1>My Lyrics</h1>
        </div>
      </div>
    );
  }
}

export default Lyrics;
