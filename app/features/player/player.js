import React from 'react';

import Video from './video/video.js';
import Controls from './controls/controls.js';

var ReactPlayer = React.createClass({
    render: function() {
        return (
            <div id="react-player" onMouseOver={this.showControls} onMouseOut={this.hideControls}>
                <Video ref="Video" src={this.props.src} />
                <Controls ref="Controls" playPauseClick={this.playPauseClick} />
            </div>
        );
    },
    showControls: function() {
        this.refs.Controls.showControls();
    },
    hideControls: function() {
        this.refs.Controls.hideControls();
    },
    playPauseClick: function playPauseClick(e) {
        this.refs.Video.playPauseClick(e);
    }
});

export default ReactPlayer;
