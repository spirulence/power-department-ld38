/*  Game.ts - Power Department starting point
 *  Copyright (C) 2017 Cameron B Seebach
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/*  This file is based on https://github.com/geowarin/phaser-webpack
 *  the following notice (MIT license) applies to code originated from there:
 *
 *  Copyright (c) 2015 Geoffroy Warin
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */

/// <reference path="./defs/definitions.d.ts"/>

import {Boot, Preload, Main, Menu} from './state/States';
import {GameSetup} from "./state/GameSetup";
import {GameOver} from "./state/GameOver";
import {GameWin} from "./state/GameWin";

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
        this.state.add('game_won', GameWin);

        this.state.start('boot');
    }
}

new Game();
