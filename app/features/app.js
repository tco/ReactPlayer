require('babel/polyfill');

import React from 'react';
import ReactPlayer from './player/player.js';

var mountNode = document.getElementById('application');

React.render(
    <ReactPlayer
        src="/static/sintel.webm"
    />
, mountNode);
