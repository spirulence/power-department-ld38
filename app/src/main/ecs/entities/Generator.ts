import {EntityManager} from "tiny-ecs";
import {DistributionPoint} from "../components/DistributionPoint";
import {GraphComponent} from "../components/GraphComponent";
import {TilePosition} from "../components/TilePosition";
import {TileRender} from "../components/TileRender";
export class Generator{

    public static make(entities: EntityManager, x: number, y: number){
        let entity = entities.createEntity()
            .addComponent(DistributionPoint)
            .addComponent(GraphComponent)
            .addComponent(TilePosition)
            .addComponent(TileRender);

        entity.tileRender.tile = 4;
        entity.tilePosition.x = x;
        entity.tilePosition.y = y;
        return entity;
    }
}