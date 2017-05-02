import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {Substation} from "../entities/Substation";
import {Planned} from "../components/Planned";
import {Generator} from "../entities/Generator";
import {buildChecker} from "../../../utils/MapChecker";
import {TilePosition} from "../components/TilePosition";
import {Hovered} from "../components/Hovered";

export class PlanFacility implements System{
    private entities: EntityManager;
    private checker: (range: number, position: {x: number; y: number}) => boolean;

    constructor(entities: EntityManager){
        this.entities = entities;
    }

    addSubstation(x: number, y: number, hovered: boolean){
        let entity = Substation.make(this.entities, x, y);
        this.finish(entity, hovered);
    }

    finish(entity: any, hovered: boolean) {
        if (hovered) {
            this.clearHover();
            entity.addTag("hovered");
            entity.addComponent(Hovered);
        } else {
            entity.addComponent(Planned);
        }
    }

    clearHover() {
        this.entities.removeEntitiesByTag("hovered");
    }

    process(_entities: EntityManager): void {
        this.checker = buildChecker(_entities.queryComponents([Planned, TilePosition]));
    }

    addGenerator(x: number, y: number, hovered: boolean) {
        let entity = Generator.make(this.entities, x, y);
        this.finish(entity, hovered);
    }
}