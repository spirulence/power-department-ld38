import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Substation} from "../entities/Substation";
import {Speculative} from "../components/Speculative";

export class SpeculativeAddSystem implements System{
    private entities: EntityManager;

    constructor(entities: EntityManager){
        this.entities = entities;
    }

    addSubstation(x: number, y: number, _hovered: boolean){
        Substation.make(this.entities, x, y).addComponent(Speculative);
    }

    process(_entities: EntityManager): void {

    }

}