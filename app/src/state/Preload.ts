/*  Preload.ts - preload assets
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

export class Preload extends Phaser.State {
    private preloadBar: Phaser.Sprite;
    private slickUI: Phaser.Plugin.SlickUI;

    preload() {
        this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
        this.load.setPreloadSprite(this.preloadBar);

        this.load.tilemap("tutorial", "assets/tutorial.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap("map1", "assets/rural-1.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap("map2", "assets/delta-2.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap("map3", "assets/islands-3.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.tilemap("map4", "assets/icy-4.json", null, Phaser.Tilemap.TILED_JSON);
        this.load.image("grid-tile", "assets/grid-tile.png");
        this.load.image("tileset", "assets/tileset.png");
        this.load.spritesheet("overlay-tiles", "assets/tileset.png", 8, 8);
        this.load.image("tutorial.png", "assets/tutorial.png");
        this.load.image("rural-1.png", "assets/rural-1.png");
        this.load.image("delta-2.png", "assets/delta-2.png");

        this.load.spritesheet('buttons', 'assets/buttons.png', 32, 32);

        this.slickUI = this.game.plugins.add(Phaser.Plugin.SlickUI);
        this.slickUI.load("assets/kenney-theme/kenney.json");

        this.load.image("logo", "assets/logo.png");

        this.load.json("setup_text", "assets/gametext-setup.json");

        this.load.audio("main_music_01", "assets/audio/power_department_01.mp3");
        this.load.audio("main_music_02", "assets/audio/pd_chugging.mp3");
        this.load.audio("main_music_03", "assets/audio/pd_slow_it_down.mp3");

        this.load.image("game_over", "assets/game_over.png");
        this.load.image("you_win", "assets/you_win.png");
    }

    create() {
        this.preloadBar.destroy();
        this.game.state.start('setup', false, false, this.slickUI);
    }
}
