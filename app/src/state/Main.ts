import {Dialogs, DialogButtons} from "../interface/Dialogs";
import {Facilities} from "../mainstate/Facilities";
import {Inventory} from "../mainstate/Inventory";

export class Main extends Phaser.State {
    map: Phaser.Tilemap;
    facilities: Facilities;
    dialogs: Dialogs;
    inventory: Inventory;
    private belowText: Phaser.Text;

    create() {
        this.setupMap();
        this.facilities = new Facilities(this.map);
        this.setupDialogs();

        let textStyle = {font:"20px monospace", fill:"#fff"};
        this.belowText = this.add.text(0, 600, "", textStyle);
        let belowText = this.belowText;

        this.inventory = new Inventory();
        this.facilities.setInventory(this.inventory);
        this.inventory.addNotifier(function(inv: Inventory){
            let dollars = inv.dollarsMillions;
            belowText.text = `$${dollars}m`;
        });
        this.inventory.notify();
    }

    private setupMap() {
        this.map = this.add.tilemap("map1");
        this.map.addTilesetImage("tileset", "tileset");

        let baseLayer = this.map.createLayer("base");
        baseLayer.resizeWorld();
        baseLayer.inputEnabled = true;
        baseLayer.events.onInputDown.add(this.clickBaseLayer.bind(this));

        this.map.createBlankLayer("power", 125, 75, 8, 8);
        this.map.createBlankLayer("temporary", 125, 75, 8, 8);
    }

    private setupDialogs() {
        this.dialogs = new Dialogs(this.game,
            [
                {image: DialogButtons.NewSubstation, callback: this.facilities.addSubstation.bind(this.facilities)},
                {image: DialogButtons.NewPlant, callback: this.facilities.addPlant.bind(this.facilities)}
            ]);
    }

    private clickBaseLayer(_mapLayer: Phaser.TilemapLayer, pointer: Phaser.Pointer){
        let powerTile = this.map.getTileWorldXY(
            pointer.position.x, pointer.position.y,
            undefined, undefined, "power", true);

        this.dialogs.powerTileClicked(powerTile, pointer);
    }

    update() {

    }
}
