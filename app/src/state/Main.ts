import {Dialogs, DialogButtons} from "../interface/Dialogs";
import {Facilities} from "../mainstate/Facilities";
import {Inventory} from "../mainstate/Inventory";
import {LinePlacer} from "../mainstate/LinePlacer";

export class Main extends Phaser.State {
    map: Phaser.Tilemap;
    facilities: Facilities;
    dialogs: Dialogs;
    inventory: Inventory;

    private belowText: Phaser.Text;
    private placer: LinePlacer;

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
            belowText.text = `$${inv.dollarsMillions}m`;
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
        this.dialogs = new Dialogs(this.game);

        let addSubstation = this.facilities.addSubstation.bind(this.facilities);
        this.dialogs.addAction(DialogButtons.NewSubstation, addSubstation);

        let addPlant = this.facilities.addPlant.bind(this.facilities);
        this.dialogs.addAction(DialogButtons.NewPlant, addPlant);

        let map = this.map;
        let game = this.game;
        let mainstate = this;
        let newTransmissionLine = function(tile: Phaser.Tile){
            let placer = new LinePlacer(map, tile);
            game.input.addMoveCallback(placer.moveCallback, null);
            mainstate.placer = placer;
        };
        this.dialogs.addAction(DialogButtons.NewTransmissionLine, newTransmissionLine);
    }

    private clickBaseLayer(_mapLayer: Phaser.TilemapLayer, pointer: Phaser.Pointer){
        let powerTile = this.map.getTileWorldXY(
            pointer.position.x, pointer.position.y,
            undefined, undefined, "power", true);

        if(this.placer == null){
            this.dialogs.powerTileClicked(powerTile, pointer);
        }else{
            this.placer.clickCallback(powerTile, this.inventory, this.facilities);
            this.game.input.deleteMoveCallback(this.placer.moveCallback, null);
            this.placer = null;
        }
    }

    update() {

    }
}
