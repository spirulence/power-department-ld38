import {MainSystems} from "../../ecs/MainSystems";
import {MapComponent} from "../../ecs/components/MapComponent";
import {PlanFacility} from "../../ecs/systems/PlanFacility";

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
        this.systems.planFacility.clearHover();
        this.mode = new SubstationMode(this.systems.planFacility);
    }

    generatorMode(){
        this.systems.planFacility.clearHover();
        this.mode = new GeneratorMode(this.systems.planFacility);
    }

    close() {
        if(this.mode != null){
            this.mode = null;
            this.systems.planFacility.clearHover();
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
    private facilityPlanner: PlanFacility;

    constructor(addSystem: PlanFacility){
        this.facilityPlanner = addSystem;
    }

    hover(x: number, y:number){
        this.facilityPlanner.addSubstation(x, y, true);
    }

    click(x: number, y:number){
        this.facilityPlanner.addSubstation(x, y, false);
        this.facilityPlanner.clearHover();
    }
}

class GeneratorMode implements BuildMode{
    private facilityPlanner: PlanFacility;

    constructor(addSystem: PlanFacility){
        this.facilityPlanner = addSystem;
    }

    hover(x: number, y:number){
        this.facilityPlanner.addGenerator(x, y, true);
    }

    click(x: number, y:number){
        this.facilityPlanner.addGenerator(x, y, false);
        this.facilityPlanner.clearHover();
    }
}

