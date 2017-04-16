import {Inventory} from "./Inventory";

export class Facilities{
    private map: Phaser.Tilemap;
    private inventory: Inventory;

    constructor(map: Phaser.Tilemap){
        this.map = map;
    }

    addSubstation(baseTile: Phaser.Tile){
        if(this.inventory.enoughDollars(2)){
            this.map.putTile(6, baseTile.x, baseTile.y, "power");
            this.inventory.deductDollars(2);
        }
    }

    addPlant(baseTile: Phaser.Tile){
        if(this.inventory.enoughDollars(5)) {
            this.map.putTile(5, baseTile.x, baseTile.y, "power");
            this.inventory.deductDollars(5);
        }
    }

    setInventory(inventory: Inventory) {
        this.inventory = inventory;
    }
}
