require('aframe');
require('aframe-orbit-controls');
require('./components/load-volume-data');

import vert from 'raw-loader!glslify-loader!./shaders/volume.vert.glsl'
import frag from 'raw-loader!glslify-loader!./shaders/volume.frag.glsl'
