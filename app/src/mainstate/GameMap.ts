import {MapLayers} from "./Facilities";
import {LandPrice} from "./LandPrice";

export interface MapCallback{
    mapClicked: (mapTile: {x:number, y:number})=>void;
    mapHovered: (mapTile: {x:number, y:number})=>void;
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

    setTile(x: number, y: number, tile: number){
        let pixelX = x * this.tilesize;
        let pixelY = y * this.tilesize;

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

    clearTile(x: number, y: number){
        let pixelX = x * this.tilesize;
        let pixelY = y * this.tilesize;

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
}

export class GameMap{
    overlays: {[id: string]: Overlay};
    prices: LandPrice;

    private map: Phaser.Tilemap;
    private mapGroup: Phaser.Group;
    private callbacks: MapCallback[];

    constructor(game: Phaser.Game, mapID: string){
        this.callbacks = [];

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
        this.prices = new LandPrice();
        this.prices.map = this.map;
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
        // if (this.map.images.length > 0) {
        //     baseLayer.visible = false;
        // }
        baseLayer.inputEnabled = true;
        baseLayer.events.onInputOver.add(this.moveCallback.bind(this));
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

    moveCallback(_layer: any, pointer: Phaser.Pointer){
        console.log(pointer);
        let coords = this.mapGroup.toLocal(pointer.position, this.mapGroup.parent);
        let tile = this.map.getTileWorldXY(coords.x, coords.y, undefined, undefined, MapLayers.BASE, true);

        if(tile != null){
            for(let callback of this.callbacks){
                callback.mapHovered(tile);
            }
        }
    }

    toScreen(tile: {x: number, y:number}){
        let pixelX = tile.x * 8;
        let pixelY = tile.y * 8;
        let point = this.mapGroup.toGlobal(new Phaser.Point(pixelX, pixelY));
        return new Phaser.Point(point.x, point.y);
    }

}