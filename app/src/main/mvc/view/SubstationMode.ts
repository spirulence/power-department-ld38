import {SpeculativeAddSystem} from "../../ecs/systems/SpeculativeAddSystem";
export class SubstationMode{
    private addSystem: SpeculativeAddSystem;

    constructor(addSystem: SpeculativeAddSystem){
        this.addSystem = addSystem;
    }

    hover(_x: number, _y:number){

    }

    click(x: number, y:number){
        this.addSystem.addSubstation(x, y, false);
    }

    close(){

    }
}