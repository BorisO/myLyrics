import React, { Component } from "react";
import queryString from "query-string";
import ListGroup from "./common/listGroup";
import {
  getRecentlyPlayed,
  getCurrentlyPlaying
} from "../services/spotifyService";
import { getLyricsFromSongObj } from "../services/lyricService";
import auth from "../services/authService";
import TextareaAutosize from "react-autosize-textarea";

class Lyrics extends Component {
  state = {
    provider: this.props.location.pathname.slice(1),
    recentlyPlayed: [],
    currentPlayback: [],
    selectedSong: {},
    selectedSongLyrics: String,
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
        currentPlayback = Array.of(currentPlayback);
        this.setState({
          recentlyPlayed,
          currentPlayback
        });
        break;
      default:
        alert("This provider doesn't exist.");
    }
  }

  handleSongSelect = async song => {
    const q = queryString.stringify({
      name: song.song.name,
      artist: song.artists.names[0]
    });

    let { data: lyrics } = await getLyricsFromSongObj(q);
    this.setState({ selectedSong: song, selectedSongLyrics: lyrics });
  };

  render() {
    return (
      <div className="row">
        <div className="col-4">
          <h1>My Music</h1>
          <h4>Currently Playing</h4>
          <ListGroup
            items={this.state.currentPlayback}
            selectedItem={this.state.selectedSong}
            onItemSelect={this.handleSongSelect}
            textProperty={"song.name"}
          />
          <h4>Recently Played</h4>
          <ListGroup
            items={this.state.recentlyPlayed}
            selectedItem={this.state.selectedSong}
            onItemSelect={this.handleSongSelect}
            textProperty={"song.name"}
          />
        </div>
        <div className="col-8">
          <h1>My Lyrics</h1>
          <TextareaAutosize
            className="form-control"
            readOnly={true}
            id="lyricText"
            value={this.state.selectedSongLyrics}
          />
        </div>
      </div>
    );
  }
}

export default Lyrics;
