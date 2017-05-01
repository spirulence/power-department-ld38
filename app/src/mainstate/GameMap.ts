/*  GameMap.ts
 *  Copyright (C) 2017 Cameron B Seebach
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {LandPrice} from "./LandPrice";
import {TerrainTypes} from "./Terrain";
import {FacilityTypes} from "./Facilities";

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

/**
 * Interface for other code to get notified when tiles are clicked or hovered on map.
 */
export interface MapCallback{
    mapClicked(tile: MapTile):void;
    mapHovered(tile: MapTile):void;
}

/**
 * A view of a single tile that cuts across layers and presents most information in one place.
 */
export interface MapTile{
    location: {x: number, y: number},
    terrain: TerrainTypes,
    facility: FacilityTypes,
    line: boolean,
    landPrice: number
}

/**
 * A cheaper way of representing a tile layer, using dynamically resizing arrays of sprites instead.
 */
export class Layer{
    /**
     * Sometimes, you want to make layers non-visible. This helps.
     * @returns {boolean}
     */
    get visible(): boolean {
        return this._visible;
    }
    /**
     * Sometimes, you want to make layers non-visible. This helps.
     */
    set visible(value: boolean) {
        this._visible = value;
        this.group.visible = value;
    }
    private group: Phaser.Group;
    private tileset: string;
    private tilesize: number;
    private sprites: Phaser.Sprite[];
    private unusedSprites: Phaser.Sprite[];
    private game: Phaser.Game;
    private _visible: boolean;


    /**
     * Create a new Layer. Needs a few references to work right.
     *
     * Uses a tileset called "overlay-tiles" for all tile images. Make sure you load it.
     *
     * @param tilesize Assumes that tiles are square, this is length of a side.
     * @param game Needs this reference to add objects to the game world.
     * @param parent Usually the group that contains all the other layers.
     */
    constructor(tilesize: number, game: Phaser.Game, parent: Phaser.Group){
        this.game = game;
        this.group = game.add.group(parent);
        this.tileset = "overlay-tiles";
        this.tilesize = tilesize;

        this.sprites = [];
        this.unusedSprites = [];
    }

    /**
     * Set the tile at the specified location to some tile.
     * @param location Location, in tile coordinates, to set.
     * @param tile An index into the tileset. Note that to match Tiled, we actually set index+1 to get correct result.
     */
    setTile(location: {x: number; y: number}, tile: number){
        let pixelX = location.x * this.tilesize;
        let pixelY = location.y * this.tilesize;

        let found = false;
        for(let sprite of this.sprites){
            if(sprite.x == pixelX && sprite.y == pixelY){
                sprite.frame = tile - 1;
                found = true;
            }
        }

        if(!found){
            let sprite: Phaser.Sprite = null;
            if(this.unusedSprites.length == 0) {
                sprite = this.game.add.sprite(pixelX, pixelY, this.tileset, tile-1, this.group);
            }else{
                sprite = this.unusedSprites.pop();
                sprite.frame = tile - 1;
                sprite.visible = true;
                sprite.x = pixelX;
                sprite.y = pixelY;
            }
            this.sprites.push(sprite);
        }
    }

    /**
     * Clear the tile at the specified location.
     * @param location Location, in tile coordinates, to clear
     */
    clearTile(location: {x: number; y: number}){
        let pixelX = location.x * this.tilesize;
        let pixelY = location.y * this.tilesize;

        let index = 0;
        let found = false;
        for(let sprite of this.sprites){
            if(sprite.x == pixelX && sprite.y == pixelY){
                found = true;
                break;
            }
            index++;
        }

        if(found){
            let sprite = this.sprites.splice(index, 1)[0];
            sprite.visible = false;
            this.unusedSprites.push(sprite);
        }
    }

    // bake(){
    //     this.group.cacheAsBitmap = null;
    //     this.group.cacheAsBitmap = true;
    // }

    /**
     * Get the tile index at a specific location.
     * @param location the location to query
     * @returns {number} the tile index, -1 if no tile is there.
     */
    getTile(location: {x: number; y: number}) {
        let pixelX = location.x * this.tilesize;
        let pixelY = location.y * this.tilesize;

        for(let sprite of this.sprites){
            if(sprite.x == pixelX && sprite.y == pixelY){
                return parseInt(sprite.frame.toString(), 10) + 1;
            }
        }
        return -1;
    }
}

/**
 * An abstraction on top of a Phaser.Tilemap for convenience. Adds methods to view all layers of one tile at the
 * same time. Handles zooming and scrolling, and mouse input events.
 */
export class GameMap{
    /**
     * References to the individual layers by name.
     */
    layers: {[id: string]: Layer};
    /**
     * The land prices for this map.
     */
    landPrice: LandPrice;
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
    private callbacks: MapCallback[];
    private baseLayer: Phaser.TilemapLayer;
    private game: Phaser.Game;
    private scrollSpeed: number;

    /**
     * Create a tilemap with a given ID in the given game world.
     * @param game
     * @param mapID
     */
    constructor(game: Phaser.Game, mapID: string){
        this.callbacks = [];

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
        this.createPrices();
        this.setupZooming(game);
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

    private createPrices() {
        this.landPrice = new LandPrice();
        this.landPrice.map = this.map;
        this.landPrice.addToLayer(this.layers.land_price);
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
        this.layers[name] = new Layer(tilesize, game, parent);
    }

    /**
     * Add a callback to be notified when tiles are hovered or clicked.
     * @param callback
     */
    addCallback(callback: MapCallback){
        this.callbacks.push(callback);
    }

    //method called when baseLayer recieves a click
    //notifies any callbacks added
    private clickCallback(_layer: any, pointer: Phaser.Pointer){
        let coords = this.mapGroup.toLocal(pointer.position, this.mapGroup.parent);
        let baseTiile = this.map.getTileWorldXY(coords.x, coords.y, undefined, undefined, MapLayers.BASE, true);

        if(baseTiile != null){
            let mapTile = this.getTile(baseTiile);
            for(let callback of this.callbacks){
                callback.mapClicked(mapTile);
            }
        }
    }

    //method called when mouse moves in game, we try to figure out if it's on the map
    //and notify the appropriate code.
    private moveCallback(pointer: Phaser.Pointer, _x: number, _y:number, isClick: boolean){
        let coords = this.mapGroup.toLocal(pointer.position, this.mapGroup.parent);
        let baseTile = this.map.getTileWorldXY(coords.x, coords.y, undefined, undefined, MapLayers.BASE, true);

        if(baseTile != null && !isClick){
            let mapTile = this.getTile(baseTile);
            for(let callback of this.callbacks){
                callback.mapHovered(mapTile);
            }
        }
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
     * Get the MapTile at a certain location. Cuts across layers to summarize information.
     * @param location
     * @returns {MapTile}
     */
    getTile(location: {x: number; y: number}) {
        return {
            location: location,
            terrain: this.map.getTile(location.x, location.y, MapLayers.BASE, true).index,
            facility: this.layers[MapLayers.FACILITIES].getTile(location),
            line: this.layers[MapLayers.LINES].getTile(location) != -1,
            landPrice: this.landPrice.getPrice(location.x, location.y)
        };
    }

    /**
     * Remove a callback added with @addCallback so that if won't be notified anymore.
     * @param callback
     */
    removeCallback(callback: {mapHovered: any; mapClicked: any}) {
        let index = 0;
        let found = false;
        for(let addedCallback of this.callbacks){
            if(addedCallback.mapHovered == callback.mapHovered && addedCallback.mapClicked == callback.mapClicked){
                found = true;
                break;
            }
            index++;
        }
        this.callbacks.splice(index, 1);
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
}
