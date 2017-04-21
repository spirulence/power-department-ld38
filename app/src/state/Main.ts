///<reference path="../defs/definitions.d.ts"/>
import {Dialogs, DialogButtons} from "../interface/Dialogs";
import {Facilities} from "../mainstate/Facilities";
import {Inventory} from "../mainstate/Inventory";
import {LinePlacer} from "../mainstate/LinePlacer";
import {NetworkHighlighter} from "../mainstate/NetworkHighlighter";
import {Demand} from "../mainstate/Demand";



export class Main extends Phaser.State {
    map: Phaser.Tilemap;
    facilities: Facilities;
    dialogs: Dialogs;
    inventory: Inventory;

    private belowText: Phaser.Text;
    private placer: LinePlacer;
    private demand: Demand;
    private demandText: Phaser.Text;
    private slickUI: any;

    init(slickUI: any){
        this.slickUI = slickUI;
    }

    create() {
        this.setupMap();
        this.setupFacilities();
        this.setupDialogs();
        this.setupText();
        this.setupInventory();
        this.setupDemand();
        this.setupHover();

        let panel = new SlickUI.Element.Panel(8, 8, 150, this.game.height - 16);
        this.slickUI.add(panel);

        let button = new SlickUI.Element.Button(0,0, 140, 80);
        panel.add(button);
        button.events.onInputUp.add(function () {console.log('Clicked button');});
        button.add(new SlickUI.Element.Text(0,0, "My button")).center();
    }

    private setupFacilities() {
        this.facilities = new Facilities(this.map);
    }

    private setupInventory() {
        this.inventory = new Inventory();
        this.facilities.setInventory(this.inventory);
        let belowText = this.belowText;
        this.inventory.addNotifier(function (inv: Inventory) {
            belowText.text = `$${inv.dollarsMillions}m`;
        });
        this.inventory.notify();
    }

    private setupText() {
        let textStyle = {font: "20px monospace", fill: "#fff"};
        this.belowText = this.add.text(0, 600, "", textStyle);
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

    private setupHover() {
        let highlighter = new NetworkHighlighter();
        highlighter.facilities = this.facilities;
        highlighter.map = this.map;
        this.game.input.addMoveCallback(highlighter.highlightHover, highlighter);
    }

    private setupDemand() {
        this.demand = new Demand();
        this.demand.map = this.map;
        this.demand.facilities = this.facilities;

        let textStyle = {font: "20px monospace", fill: "#fff", boundsAlignH: "right"};
        this.demandText = this.add.text(0, 0, "", textStyle);
        this.demandText.setTextBounds(0,600, 1000, 25);
        let demandText = this.demandText;

        let demand = this.demand;
        this.facilities.addNotifier(function(_facilities: Facilities){
            demand.calculateSatisfaction();
            let sat = demand.satisfaction;
            demandText.text = `${sat.unconnected}uncon-${sat.unreliable}unrel-${sat.reliable}rel`
        });

        this.facilities.notify();
    }
}
