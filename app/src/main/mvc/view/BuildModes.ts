import {MainSystems} from "../../ecs/MainSystems";
import {MapComponent} from "../../ecs/components/MapComponent";
import {SpeculativeAddSystem} from "../../ecs/systems/SpeculativeAddSystem";

export class BuildModes{
    private systems: MainSystems;
    private mapComponent: MapComponent;
    private game: Phaser.Game;
    private mode: BuildMode;

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
        this.systems.speculative.clearHover();
        this.mode = new SubstationMode(this.systems.speculative);
    }

    generatorMode(){
        this.systems.speculative.clearHover();
        this.mode = new GeneratorMode(this.systems.speculative);
    }

    lineMode(){
        this.systems.speculative.clearHover();
        this.mode = new LineMode(this.systems.speculative);
    }

    close() {
        if(this.mode != null){
            this.mode = null;
        }
    }

    isOpen() {
        return this.mode != null;
    }
}

interface BuildMode{
    hover(x: number, y:number): void;

    click(x: number, y:number): void;
}

class SubstationMode implements BuildMode{
    private addSystem: SpeculativeAddSystem;

    constructor(addSystem: SpeculativeAddSystem){
        this.addSystem = addSystem;
    }

    hover(x: number, y:number){
        this.addSystem.addSubstation(x, y, true);
    }

    click(x: number, y:number){
        this.addSystem.addSubstation(x, y, false);
        this.addSystem.clearHover();
    }
}

class GeneratorMode implements BuildMode{
    private addSystem: SpeculativeAddSystem;

    constructor(addSystem: SpeculativeAddSystem){
        this.addSystem = addSystem;
    }

    hover(x: number, y:number){
        this.addSystem.addGenerator(x, y, true);
    }

    click(x: number, y:number){
        this.addSystem.addGenerator(x, y, false);
        this.addSystem.clearHover();
    }
}

class LineMode implements BuildMode{
    private addSystem: SpeculativeAddSystem;
    private source: {x: number, y: number};

    constructor(addSystem: SpeculativeAddSystem){
        this.addSystem = addSystem;
        this.source = null;
    }

    hover(x: number, y:number){
        if(this.source != null) {
            this.addSystem.addLine(this.source, {x: x, y: y}, true);
        }
    }

    click(x: number, y:number){
        if(this.source == null) {
            this.source = {x: x, y: y};
        }else{
            this.addSystem.addLine(this.source, {x: x, y: y}, false);
            this.source = {x:x, y:y};
            this.addSystem.clearHover();
        }
    }
}

