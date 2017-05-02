import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Substation} from "../entities/Substation";
import {Speculative} from "../components/Speculative";
import {Generator} from "../entities/Generator";
import {Hovered} from "../components/Hovered";
import {Line} from "../entities/Line";

export class SpeculativeAddSystem implements System{
    private entities: EntityManager;

    constructor(entities: EntityManager){
        this.entities = entities;
    }

    addSubstation(x: number, y: number, hovered: boolean){
        let entity = Substation.make(this.entities, x, y).addComponent(Speculative);
        if(hovered){
            this.doHoveredMagic(entity);
        }
    }

    private doHoveredMagic(entity: any) {
        this.clearHover();
        entity.addComponent(Hovered);
    }

    clearHover() {
        for(let hovered of this.entities.queryComponents([Hovered])){
            this.entities.removeEntity(hovered);
        }
    }

    process(_entities: EntityManager): void {

    }

    addGenerator(x: number, y: number, hovered: boolean) {
        let entity = Generator.make(this.entities, x, y).addComponent(Speculative);
        if(hovered){
            this.doHoveredMagic(entity);
        }
    }

    addLine(source: {x: number; y: number}, destination: {x: number; y: number}, hovered: boolean) {
        let entity = Line.make(source, destination, this.entities).addComponent(Speculative);
        if(hovered){
            this.doHoveredMagic(entity);
        }
    }
}