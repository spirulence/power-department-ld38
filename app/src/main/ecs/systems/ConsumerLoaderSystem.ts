import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {MapComponent} from "../components/MapComponent";
import {CityTile} from "../entities/CityTile";

export class ConsumerLoaderSystem implements System {
    private loaded = false;
    readonly CITY_INDEX = 3;

    process(entities: EntityManager): void {
        if (!this.loaded) {
            this.load(entities);
            this.loaded = true;
        }
    }

    private load(entities: EntityManager) {
        let map: MapComponent = entities.queryComponents([MapComponent])[0].mapComponent;

        for(let tile of map.baseLayer.getTiles(0, 0, map.map.width, map.map.height)){
            this.maybeCreateConsumer(tile, entities);
        }
    }

    private maybeCreateConsumer(tile: Phaser.Tile, entities: EntityManager) {
        if (tile.index == this.CITY_INDEX) {
            let cityTile = CityTile.make(entities);
            cityTile.tilePosition.x = tile.x;
            cityTile.tilePosition.y = tile.y;
        }
    }
}