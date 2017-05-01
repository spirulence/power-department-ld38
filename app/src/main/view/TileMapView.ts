import {TileLayerView} from "./TileLayerView";
import {Events} from "../Events";
import {Plant} from "../model/Facilities";

/**
 * Convenient strings for working with the different map layers available.
 *
 * Note that "base" is in here, but isn't accessible directly like the others.
 */
export class MapLayers{
    public static readonly BASE = "base";
    public static readonly TEMPORARY = "temp";
    public static readonly LINES = "lines";
    public static readonly FACILITIES = "facilities";
    public static readonly HIGHLIGHTS = "highlights";
    public static readonly LAND_PRICE = "land_price";
}

enum FacilityTypes{
    Nothing = -1,
    Plant = 5,
    Substation = 6,
    PowerLine = 7
}

export interface MapTile{
    location: {x: number, y: number}
}


/**
 * An abstraction on top of a Phaser.Tilemap for convenience. Adds methods to view all layers of one tile at the
 * same time. Handles zooming and scrolling, and mouse input events.
 */
export class TileMapView{
    /**
     * References to the individual layers by name.
     */
    layers: {[id: string]: TileLayerView};
    /**
     * Width in tiles of this map.
     */
    width: number;
    /**
     * Height in tiles of this map.
     */
    height: number;

    private map: Phaser.Tilemap;
    private mapGroup: Phaser.Group;
    private baseLayer: Phaser.TilemapLayer;
    private game: Phaser.Game;
    private scrollSpeed: number;

    /**
     * Create a tilemap with a given ID in the given game world.
     * @param game
     * @param mapID
     */
    constructor(game: Phaser.Game, mapID: string){

        this.width = 125;
        this.height = 75;
        this.scrollSpeed = 4;

        game.input.addMoveCallback(this.moveCallback, this);
        this.game = game;

        this.mapGroup = game.add.group();

        this.map = game.add.tilemap(mapID);
        this.addTileSets();

        this.addImageLayers(game);
        this.setupBaseLayer();
        this.createLayers(game);
        this.setupZooming(game);

        this.setupEvents();
    }

    private setupZooming(game: Phaser.Game) {
        let centeredX = -(this.mapGroup.width * 2 - game.world.width) / 2;
        let centeredY = -(this.mapGroup.height * 2 - game.world.height) / 2;
        let mapGroup = this.mapGroup;

        let zoomIn = function () {
            if (mapGroup.scale.x != 2) {
                mapGroup.scale.set(2);
                mapGroup.position.set(centeredX, centeredY);
            }
        };

        let zoomOut = function () {
            if (mapGroup.scale.x != 1) {
                mapGroup.scale.set(1);
                mapGroup.position.set(0);
            }
        };

        game.input.keyboard.addKey(Phaser.KeyCode.ONE).onUp.add(zoomIn);
        game.input.keyboard.addKey(Phaser.KeyCode.TWO).onUp.add(zoomOut);
        let mouse = game.input.mouse;
        game.input.mouse.mouseWheelCallback = function () {
            if (mouse.wheelDelta == Phaser.Mouse.WHEEL_DOWN) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    }

    private createLayers(game: Phaser.Game) {
        this.layers = {};

        this.createOverlay(MapLayers.TEMPORARY, 8, game, this.mapGroup);
        this.createOverlay(MapLayers.LINES, 8, game, this.mapGroup);
        this.createOverlay(MapLayers.FACILITIES, 8, game, this.mapGroup);
        this.createOverlay(MapLayers.HIGHLIGHTS, 8, game, this.mapGroup);
        this.createOverlay(MapLayers.LAND_PRICE, 8, game, this.mapGroup);

        this.layers.land_price.visible = false;
        //toggle between image layer and base layer
        let toggleBaseKey = this.game.input.keyboard.addKey(Phaser.KeyCode.P);
        let layer = this.layers.land_price;
        toggleBaseKey.onUp.add(function(){
            layer.visible = !layer.visible;
        });
    }

    private setupBaseLayer() {
        let baseLayer = this.map.createLayer(MapLayers.BASE, null, null, this.mapGroup);
        if (this.map.images.length > 0) {
            baseLayer.alpha = 0.0;

            //we assume maps with images also have grid layers
            let gridLayer = this.map.createLayer("grid", null, null, this.mapGroup);
            gridLayer.alpha = 0.125;
        }
        baseLayer.inputEnabled = true;
        baseLayer.events.onInputDown.add(this.clickCallback.bind(this));
        this.baseLayer = baseLayer;

        //toggle between image layer and base layer
        let toggleBaseKey = this.game.input.keyboard.addKey(Phaser.KeyCode.M);
        toggleBaseKey.onUp.add(function(){
            baseLayer.alpha = 1.0-baseLayer.alpha;
        });
    }

    private addImageLayers(game: Phaser.Game) {
        for (let imageLayer of this.map.images) {
            game.add.image(imageLayer.x, imageLayer.y, imageLayer.image, null, this.mapGroup);
        }
    }

    private addTileSets() {
        this.map.addTilesetImage("tileset", "tileset");
        this.map.addTilesetImage("grid-tile", "grid-tile");
    }

    private createOverlay(name: string, tilesize: number, game: Phaser.Game, parent: Phaser.Group) {
        this.layers[name] = new TileLayerView(tilesize, game, parent);
    }

    //method called when baseLayer recieves a click
    //notifies any callbacks added
    private clickCallback(_layer: any, _pointer: Phaser.Pointer){
        // let coords = this.mapGroup.toLocal(pointer.position, this.mapGroup.parent);
        // let baseTile = this.map.getTileWorldXY(coords.x, coords.y, undefined, undefined, MapLayers.BASE, true);
        //
        // if(baseTile != null){
        //     let mapTile = {location:{x:baseTile.x, y:baseTile.y}};
        //     for(let callback of this.callbacks){
        //         callback.mapClicked(mapTile);
        //     }
        // }
    }

    //method called when mouse moves in game, we try to figure out if it's on the map
    //and notify the appropriate code.
    private moveCallback(_pointer: Phaser.Pointer, _x: number, _y:number, _isClick: boolean){
        // let coords = this.mapGroup.toLocal(pointer.position, this.mapGroup.parent);
        // let baseTile = this.map.getTileWorldXY(coords.x, coords.y, undefined, undefined, MapLayers.BASE, true);
        //
        // if(baseTile != null && !isClick){
        //     let mapTile = {location:{x:baseTile.x, y:baseTile.y}};
        //     // for(let callback of this.callbacks){
        //     //     callback.mapHovered(mapTile);
        //     // }
        // }
    }

    /**
     * Transform tile coordinates into screen coordinates. No guarantee that they fall within screen boundaries.
     * @param tile
     * @returns {Phaser.Point}
     */
    toScreen(tile: {x: number, y:number}){
        let pixelX = tile.x * 8;
        let pixelY = tile.y * 8;
        let point = this.mapGroup.toGlobal(new Phaser.Point(pixelX, pixelY));
        return new Phaser.Point(point.x, point.y);
    }

    /**
     * We need to be updated to scroll the map properly.
     */
    update() {
        if(this.isZoomedIn()){
            this.scrollMap();
        }
    }

    //scroll the map according to set scroll speed, but don't scroll past map boundaries.
    private scrollMap() {
        if (this.game.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
            this.mapGroup.position.x += this.scrollSpeed;
        }
        if (this.game.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
            this.mapGroup.position.x -= this.scrollSpeed;
        }
        if (this.game.input.keyboard.isDown(Phaser.KeyCode.UP)) {
            this.mapGroup.position.y += this.scrollSpeed;
        }
        if (this.game.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
            this.mapGroup.position.y -= this.scrollSpeed;
        }
        this.mapGroup.position.clampX(-(this.mapGroup.width - this.game.world.width), 0);
        this.mapGroup.position.clampY(-(this.mapGroup.height - this.game.world.height), 0);
    }

    //convenience method that determines whether or not we're zoomed in
    private isZoomedIn() {
        return this.mapGroup.scale.x != 1;
    }

    private setupEvents() {
        Events.plantAdded.attach(function(this: TileMapView, plant: Plant){
             this.layers.facilities.setTile(plant.location, FacilityTypes.Plant);
        }.bind(this));
    }
}