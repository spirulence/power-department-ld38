import {MainSystems} from "../../ecs/MainSystems";
import {MapComponent} from "../../ecs/components/MapComponent";
import {SubstationMode} from "./SubstationMode";

export class BuildMode{
    private systems: MainSystems;
    private mapComponent: MapComponent;
    private game: Phaser.Game;
    private mode: any;

    constructor(systems: MainSystems, game: Phaser.Game){
        this.game = game;
        this.systems = systems;

        this.mapComponent = this.systems.mapLoader.lastLoaded;
        this.mapComponent.baseLayer.inputEnabled = true;
        this.mapComponent.baseLayer.events.onInputDown.add(this.click, this);

        game.input.addMoveCallback(this.hover, this);

        this.mode = null;
    }

    hover(pointer: Phaser.Pointer, _x: number, _y:number, _isClick:boolean){
        let local = this.mapComponent.baseLayer.toLocal(pointer.position, this.game.world);
        let x = Math.floor(local.x / 8);
        let y = Math.floor(local.y / 8);

        if(this.mode != null) {
            this.mode.hover(x, y);
        }
    }

    click(baseLayer: Phaser.TilemapLayer, pointer: Phaser.Pointer){
        let local = baseLayer.toLocal(pointer.position, this.game.world);
        let x = Math.floor(local.x / 8);
        let y = Math.floor(local.y / 8);

        if(this.mode != null) {
            this.mode.click(x, y);
        }
    }

    substationMode(){
        this.closeMode();
        this.mode = new SubstationMode(this.systems.speculative);
    }

    generatorMode(){

    }

    lineMode(){

    }

    closeMode(){
        if(this.mode != null) {
            this.mode.close();
        }
    }
}

