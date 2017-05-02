import {EntityManager} from "tiny-ecs";
import {TilePosition} from "../components/TilePosition";
import {Consumer} from "../components/Consumer";

export class CityTile{

    public static make(entities: EntityManager){
        let entity = entities.createEntity();
        return entity.addComponent(Consumer).addComponent(TilePosition);
    }
}