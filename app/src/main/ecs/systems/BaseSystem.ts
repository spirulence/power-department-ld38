import {System} from "./System";
import {EntityManager} from "tiny-ecs";
export abstract class BaseSystem implements System{

    process(entities: EntityManager): void {
        for(let entity of entities.queryComponents(this.getTypes())){
            this.processEach(entity);
        }
    }

    abstract getTypes(): any[];

    abstract processEach(entity: any): void;

}