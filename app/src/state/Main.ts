///<reference path="../defs/definitions.d.ts"/>
import {MainModel} from "../main/model/MainModel";
import {MainView} from "../main/view/MainView";

export class Main extends Phaser.State {
    public model: MainModel;
    public view: MainView;

    init(_slickUI: any, _difficulty: string, _level: any) {

    }

    create() {
        this.model = new MainModel(this.game, "map1");
        this.view = new MainView(this.game, this.model);

        // this.game.input.keyboard.addKey(Phaser.KeyCode.P).onUp.add(function(this: Main){
        //     this.model.facilities.addPlant(new Plant(_.random(0, 124), _.random(0,74)));
        // }, this);
    }

}


