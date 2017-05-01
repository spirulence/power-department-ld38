/*  GameOver.ts - game over state
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

export class GameOver extends Phaser.State {
    private slickUI: any;
    private reason: string;

    init(slickUI: any, reason: string){
        this.slickUI = slickUI;
        this.reason = reason;
    }

    create(){
        this.add.image(0, 0, "game_over");
        this.slickUI.add(new SlickUI.Element.Text(0, 500, this.reason)).centerHorizontally();
    }
}
