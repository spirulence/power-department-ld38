import {LandPrice} from "./LandPrice";
import {TerrainTypes} from "./Terrain";
import {FacilityTypes} from "./Facilities";

export class MapLayers{
    public static readonly BASE = "base";
    public static readonly TEMPORARY = "temp";
    public static readonly LINES = "lines";
    public static readonly FACILITIES = "facilities";
    public static readonly HIGHLIGHTS = "highlights";
    public static readonly LAND_PRICE = "land_price";
}

export interface MapCallback{
    mapClicked(tile: MapTile):void;
    mapHovered(tile: MapTile):void;
}

export interface MapTile{
    location: {x: number, y: number},
    terrain: TerrainTypes,
    facility: FacilityTypes,
    line: boolean,
    landPrice: number
}

export class Overlay{
    private group: Phaser.Group;
    private tileset: string;
    private tilesize: number;
    private sprites: Phaser.Sprite[];
    private unusedSprites: Phaser.Sprite[];
    private game: Phaser.Game;


    constructor(tilesize: number, game: Phaser.Game, parent: Phaser.Group){
        this.game = game;
        this.group = game.add.group(parent);
        this.tileset = "overlay-tiles";
        this.tilesize = tilesize;

        this.sprites = [];
        this.unusedSprites = [];
    }

    setTile(location: {x: number; y: number}, tile: number){
        let pixelX = location.x * this.tilesize;
        let pixelY = location.y * this.tilesize;

        let found = false;
        for(let sprite of this.sprites){
            if(sprite.x == pixelX && sprite.y == pixelY){
                sprite.frame = tile;
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

export class GameMap{
    overlays: {[id: string]: Overlay};
    landPrice: LandPrice;
    width: number;
    height: number;

    private map: Phaser.Tilemap;
    private mapGroup: Phaser.Group;
    private callbacks: MapCallback[];
    private baseLayer: Phaser.TilemapLayer;
    private game: Phaser.Game;
    private scrollSpeed: number;

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
        this.createOverlays(game);
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
    }

    private createOverlays(game: Phaser.Game) {
        this.overlays = {};

        this.createOverlay(MapLayers.TEMPORARY, 8, game, this.mapGroup);
        this.createOverlay(MapLayers.LINES, 8, game, this.mapGroup);
        this.createOverlay(MapLayers.FACILITIES, 8, game, this.mapGroup);
        this.createOverlay(MapLayers.HIGHLIGHTS, 8, game, this.mapGroup);
    }

    private setupBaseLayer() {
        let baseLayer = this.map.createLayer(MapLayers.BASE, null, null, this.mapGroup);
        if (this.map.images.length > 0) {
            baseLayer.alpha = 0.0;
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
    }

    private createOverlay(name: string, tilesize: number, game: Phaser.Game, parent: Phaser.Group) {
        this.overlays[name] = new Overlay(tilesize, game, parent);
    }

    addCallback(callback: MapCallback){
        this.callbacks.push(callback);
    }

    clickCallback(_layer: any, pointer: Phaser.Pointer){
        let coords = this.mapGroup.toLocal(pointer.position, this.mapGroup.parent);
        let baseTiile = this.map.getTileWorldXY(coords.x, coords.y, undefined, undefined, MapLayers.BASE, true);

        if(baseTiile != null){
            let mapTile = this.getTile(baseTiile);
            for(let callback of this.callbacks){
                callback.mapClicked(mapTile);
            }
        }
    }

    moveCallback(pointer: Phaser.Pointer, _x: number, _y:number, isClick: boolean){
        let coords = this.mapGroup.toLocal(pointer.position, this.mapGroup.parent);
        let baseTile = this.map.getTileWorldXY(coords.x, coords.y, undefined, undefined, MapLayers.BASE, true);

        if(baseTile != null && !isClick){
            let mapTile = this.getTile(baseTile);
            for(let callback of this.callbacks){
                callback.mapHovered(mapTile);
            }
        }
    }

    toScreen(tile: {x: number, y:number}){
        let pixelX = tile.x * 8;
        let pixelY = tile.y * 8;
        let point = this.mapGroup.toGlobal(new Phaser.Point(pixelX, pixelY));
        return new Phaser.Point(point.x, point.y);
    }

    getTile(location: {x: number; y: number}) {
        return {
            location: location,
            terrain: this.map.getTile(location.x, location.y, MapLayers.BASE, true).index,
            facility: this.overlays[MapLayers.FACILITIES].getTile(location),
            line: this.overlays[MapLayers.LINES].getTile(location) != -1,
            landPrice: this.landPrice.getPrice(location.x, location.y)
        };
    }

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

    update() {
        if(this.isZoomedIn()){
            this.scrollMap();
        }
    }

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

    private isZoomedIn() {
        return this.mapGroup.scale.x != 1;
    }
}