/*  GameSetup.ts - game state for game preparation
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

interface GameText{
    friendlyName: string
    specials: string[],
    text: string
    next: string[]
}

export interface LevelInfo{
    mapID: string
    cutsceneFile: string
}


export class GameSetup extends Phaser.State {
    private slickUI: any;
    private texts: {[p: string]: GameText};
    private textIndex: string;
    private textElement: SlickUI.Element.Text;
    private panel: SlickUI.Element.Panel;
    private buttons: SlickUI.Element.Button[];
    private name: string;
    private difficulty: string;

    init(slickUI: any){
        this.slickUI = slickUI;
    }

    create() {
        let panel = new SlickUI.Element.Panel(400, 150, 200, 300);
        this.slickUI.add(panel);
        this.panel = panel;

        this.texts = this.game.cache.getJSON("setup_text");
        this.textIndex = "0";
        this.textElement = new SlickUI.Element.Text(0, 0, "");
        panel.add(this.textElement);

        this.name = "";
        this.buttons = [];
        this.setTextAndRunSpecials();

        this.difficulty = "easy";
    }

    update(){

    }

    private setTextAndRunSpecials() {
        this.runSpecials();

        this.textElement.value = this.texts[this.textIndex].text.replace("{name}", this.name);

        this.setupButtons();
    }

    private setupButtons() {
        this.clearButtons();
        this.addNewButtons();
    }

    private addNewButtons() {
        let y = 100;
        let gameText = this.texts[this.textIndex];
        for (let next of gameText.next) {
            let nextText = this.texts[next];
            let button = new SlickUI.Element.Button(50, y, 100, 50);
            let buttonText = new SlickUI.Element.Text(0, 0, nextText.friendlyName);
            this.panel.add(button);
            button.add(buttonText).center();

            let setup = this;
            button.events.onInputUp.add(function () {
                setup.textIndex = next;
                setup.setTextAndRunSpecials();
            });
            y += 50;
            this.buttons.push(button);
        }
    }

    private clearButtons() {
        for (let button of this.buttons) {
            button.container.displayGroup.destroy(true);
        }
        this.buttons = [];
    }

    private runSpecials() {
        for (let special of this.texts[this.textIndex].specials) {
            if (special === "set-difficulty-easy") {
                this.difficulty = "easy";
            } else if (special === "set-difficulty-medium") {
                this.difficulty = "medium";
            } else if (special === "set-difficulty-hard") {
                this.difficulty = "hard";
            } else if (special === "start-game") {
                this.startGame();
            }
        }
    }

    private startGame() {
        this.panel.container.displayGroup.destroy(true);

        let levelInfo: LevelInfo = {mapID: "map1", cutsceneFile: "level2intro.html"};
        if (document.title === "Power Department Tutorial") {
            levelInfo.mapID = "tutorial";
            levelInfo.cutsceneFile = "index.html";
        } else if (document.title === "Power Department - Level 2") {
            levelInfo.mapID = "map2";
            levelInfo.cutsceneFile = "level3intro.html";
        } else if (document.title === "Power Department - Level 3") {
            levelInfo.mapID = "map3";
            levelInfo.cutsceneFile = "level4intro.html";
        } else if (document.title === "Power Department - Level 4") {
            levelInfo.mapID = "map4";
            levelInfo.cutsceneFile = "outro.html";
        }
        this.game.state.start("main", false, false, this.slickUI, this.difficulty, levelInfo);
    }
}
