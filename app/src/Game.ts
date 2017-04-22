/// <reference path="./defs/definitions.d.ts"/>

import {Boot, Preload, Main, Menu} from './state/States';
import {GameSetup} from "./state/GameSetup";
import {GameOver} from "./state/GameOver";

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
        this.state.add('main_menu', Menu);
        this.state.add('setup', GameSetup);
        this.state.add('main', Main);
        this.state.add('game_over', GameOver);

        this.state.start('boot');
    }
}

new Game();
