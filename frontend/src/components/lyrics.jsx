import React, { Component } from "react";
import ListGroup from "./common/listGroup";

class Lyrics extends Component {
  state = {
    recentlyPlayed: {},
    currentPlayback: {},
    selectedSong: {}
  };

  async componentDidMount() {}

  render() {
    let { recentlyPlayed, currentPlayback, currentSelection } = this.state;

    return (
      <div className="row">
        <div className="col-4">
          <h1>My Music</h1>
          {/* <ListGroup
            items={this.state.recentlyPlayed}
            selectedItem={this.state.selectedSong}
            onItemSelect={this.handleSongSelect}
          /> */}
        </div>
        <div className="col-8">
          <h1>My Lyrics</h1>
        </div>
      </div>
    );
  }
}

export default Lyrics;
