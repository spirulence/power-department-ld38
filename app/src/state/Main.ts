///<reference path="../defs/definitions.d.ts"/>

import {MainSystems} from "../main/ecs/MainSystems";
import {MainGUI} from "../main/mvc/view/MainGUI";
import {MainLayers} from "../main/MainLayers";

export class Main extends Phaser.State {
    private systems: MainSystems;
    private gui: MainGUI;
    private layers: MainLayers;

    init(_slickUI: any, _difficulty: string, _level: any) {

    }

    create() {
        this.layers = new MainLayers(this.game);
        this.systems = new MainSystems(this.game, this.layers);
        this.systems.update();
        this.gui = new MainGUI(this.game, this.systems, this.layers.gui);
    }

    update(){
        this.systems.update();
    }
}


