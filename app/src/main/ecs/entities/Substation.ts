import {EntityManager} from "tiny-ecs";
import {DistributionPoint} from "../components/DistributionPoint";
import {GraphComponent} from "../components/GraphComponent";
import {TilePosition} from "../components/TilePosition";
export class Substation{

    public static make(entities: EntityManager, x: number, y: number){
        let entity = entities.createEntity().addComponent(DistributionPoint).addComponent(GraphComponent).addComponent(TilePosition);
        entity.tilePosition.x = x;
        entity.tilePosition.y = y;
        return entity;
    }
}