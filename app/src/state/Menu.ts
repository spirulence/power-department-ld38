/*  Menu.ts - game menu state
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

export class Menu extends Phaser.State {
    private slickUI: any;
    private music: Phaser.Sound;
    private panel: SlickUI.Element.Panel;
    private logo: Phaser.Image;

    init(slickUI: any){
        this.slickUI = slickUI;
    }

    create() {
        this.music = this.add.audio("main_menu_music");
        this.music.loopFull(0.3);
        this.logo = this.add.image(0, 0, "logo");

        let panel = new SlickUI.Element.Panel(430, 400, 140, 110);
        this.slickUI.add(panel);
        this.panel = panel;

        let newGameButton = new SlickUI.Element.Button(0,0, 140, 50);
        panel.add(newGameButton);
        newGameButton.add(new SlickUI.Element.Text(0,0, "New Game")).center();
        newGameButton.events.onInputUp.add(this.newGame.bind(this));

        // let loadGameButton = new SlickUI.Element.Button(0, 55, 140, 50);
        // panel.add(loadGameButton);
        // loadGameButton.add(new SlickUI.Element.Text(0,0, "Load Game")).center();
        // loadGameButton.events.onInputUp.add(function () {console.log('Clicked button');});
    }

    private newGame(){
        this.panel.container.displayGroup.removeAll();
        this.logo.destroy();
        this.music.destroy();
        this.game.state.start("setup", false, false, this.slickUI);
    }

    update(){

    }
}
