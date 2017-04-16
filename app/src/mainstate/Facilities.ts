export class Facilities{
    map: Phaser.Tilemap;

    constructor(map: Phaser.Tilemap){
        this.map = map;
    }

    addSubstation(baseTile: Phaser.Tile){
        this.map.putTile(6, baseTile.x, baseTile.y, "power");
    }

    addPlant(baseTile: Phaser.Tile){
        this.map.putTile(5, baseTile.x, baseTile.y, "power");
    }

}
