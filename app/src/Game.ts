/// <reference path="./defs/definitions.d.ts"/>

import {Boot, Preload, Main} from './state/States';

class Game extends Phaser.Game {
    constructor() {
        super({
            width: 1000,
            height: 625,
            transparent: false,
            enableDebug: true
        });

        this.state.add('boot', Boot);
        this.state.add('preload', Preload);
        this.state.add('main', Main);

        this.state.start('boot');
    }
}

new Game();
