/*  ContextDialog.ts
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

import {MapTile} from "../mainstate/GameMap";
export interface Button{
    normal: number;
    hover: number;
    onPress: (tile: MapTile)=>void;
}

export class ContextDialog{
    group: Phaser.Group;
    game: Phaser.Game;
    tile: MapTile;

    constructor(buttons: Array<Button>, game: Phaser.Game, tile: MapTile){
        this.group = game.add.group(undefined, "contextDialog", true);
        this.game = game;
        this.game.world.bringToTop(this.group);
        this.tile = tile;

        this.addButtons(buttons, game);
    }

    private addButtons(buttons: Array<Button>, game: Phaser.Game){
        let x = (buttons.length / 2) * -32;
        let y = -32/2;

        for (let button of buttons){
            let closeAndFire = function(this: ContextDialog){
                this.close();
                button.onPress(this.tile);
            }.bind(this);

            game.add.button(x, y,
                "buttons", closeAndFire, undefined,
                button.hover, button.normal, button.normal, button.normal,
                this.group);
            x = 32 + x;
        }
    }

    close(){
        this.group.removeAll(true);
        this.game.world.remove(this.group, true);
    }

    setPosition(position: Phaser.Point){
        position.x = Math.min(position.x, 1000-32);
        position.x = Math.max(position.x, 32);
        position.y = Math.min(position.y, 600-16);
        position.y = Math.max(position.y, 16);

        this.group.position = position;
    }

}
