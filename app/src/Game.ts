/// <reference path="./defs/definitions.d.ts"/>

import {GameOver} from "./state/GameOver";
import {GameWin} from "./state/GameWin";
import {Boot} from "./state/Boot";
import {Preload} from "./state/Preload";
import {Main} from "./state/Main";

class Game extends Phaser.Game {
    constructor() {
        super({
            width: 1000,
            height: 600,
            transparent: false,
            enableDebug: true
        });

        this.state.add('boot', Boot);
        this.state.add('preload', Preload);
        this.state.add('main', Main);
        this.state.add('game_over', GameOver);
        this.state.add('game_won', GameWin);

        this.state.start('boot');
    }
}

new Game();
