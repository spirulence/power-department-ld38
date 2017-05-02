///<reference path="../defs/definitions.d.ts"/>

import {MainSystems} from "../main/ecs/MainSystems";
import {MainGUI} from "../main/mvc/view/MainGUI";

export class Main extends Phaser.State {
    private systems: MainSystems;
    private gui: MainGUI;

    init(_slickUI: any, _difficulty: string, _level: any) {

    }

    create() {
        this.systems = new MainSystems(this.game);
        this.gui = new MainGUI(this.game);
    }

    update(){
        this.systems.update();
    }
}


