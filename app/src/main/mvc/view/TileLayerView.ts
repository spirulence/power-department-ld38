/**
 * A cheaper way of representing a tile layer, using dynamically resizing arrays of sprites instead.
 */
export class TileLayerView{
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