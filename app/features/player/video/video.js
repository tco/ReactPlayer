import React from 'react';

var Video = React.createClass({
    getInitialState: function() {
        return {
            playing: false
        };
    },

    render: function() {
        return (
            <video ref="video" src={this.props.src} id="video"></video>
        );
    },
    playPauseClick: function(e) {
        if(this.state.playing) {
            this.refs.video.getDOMNode().pause();
        } else {
            this.refs.video.getDOMNode().play();
        }
        this.setState({
            playing: !this.state.playing
        });
    }
});

export default Video;



