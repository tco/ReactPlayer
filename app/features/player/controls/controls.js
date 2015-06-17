import React from 'react';
import classNames from 'classnames';

var Controls = React.createClass({
    getInitialState: function() {
        return {
            controlsVisible: false,
            playing: false
        }
    },
    render: function() {

        var playClasses = classNames({
                fa: true,
                'fa-play': true,
                hidden: this.state.playing
            }),
            pauseClasses = classNames({
                fa: true,
                'fa-pause': true,
                hidden: !this.state.playing
            }),
            containerClasses = classNames({
               hidden: !this.state.controlsVisible
            });

        return (
            <div ref="controls" id="controls" className={containerClasses}>
                <ul id="play-pause">
                    <li className="play-pause" onClick={this.playPauseClick}>
                        <i ref="play" className={playClasses}></i>
                        <i ref="pause" className={pauseClasses}></i>
                    </li>
                </ul>
            </div>
        );
    },

    showControls: function() {
        this.setState({
            controlsVisible: true
        });
    },

    hideControls: function() {
        this.setState({
            controlsVisible: false
        });
    },

    playPauseClick: function(e) {
        this.setState({
            playing: !this.state.playing
        });
        this.props.playPauseClick(e);
    }
});

export default Controls;
