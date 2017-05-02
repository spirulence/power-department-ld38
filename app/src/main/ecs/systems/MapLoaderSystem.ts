import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {MapComponent} from "../components/MapComponent";

export class MapLoaderSystem implements System{
    private game: Phaser.Game;

    public lastLoaded: MapComponent;
    private layer: Phaser.Group;

    constructor(game: Phaser.Game, layer: Phaser.Group){
        this.game = game;
        this.layer = layer;
    }

    process(entities: EntityManager): void {
        let maybeLoad = entities.queryComponents([MapComponent]);
        for(let map of maybeLoad){
            this.maybeLoad(map);
        }
    }

    private maybeLoad(map: any) {
        if (map.mapComponent.map == null) {
            this.load(map.mapComponent);
        }
    }

    private load(map: MapComponent) {
        map.mapGroup = this.layer;
        this.game.world.add(map.mapGroup);
        this.game.world.sendToBack(map.mapGroup);

        map.map = this.game.add.tilemap(map.mapID);
        let tilemap = map.map;

        this.addImageLayers(map);

        tilemap.addTilesetImage("tileset", "tileset");
        tilemap.addTilesetImage("grid-tile", "grid-tile");

        let baseLayer = tilemap.createLayer("base", null, null, map.mapGroup);
        baseLayer.resizeWorld();
        baseLayer.alpha = 0;
        map.baseLayer = baseLayer;

        let gridLayer = tilemap.createLayer("grid", null, null, map.mapGroup);
        gridLayer.alpha = 0.125;

        this.lastLoaded = map;
    }

    private addImageLayers(map: MapComponent) {
        for (let imageLayer of map.map.images) {
            this.game.add.image(imageLayer.x, imageLayer.y, imageLayer.image, null, map.mapGroup);
        }
    }
}