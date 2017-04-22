///<reference path="../defs/definitions.d.ts"/>
import {Dialogs, DialogButtons} from "../interface/Dialogs";
import {Facilities, PowerLine} from "../mainstate/Facilities";
import {Inventory} from "../mainstate/Inventory";
import {LinePlacer} from "../mainstate/LinePlacer";
import {NetworkHighlighter} from "../mainstate/NetworkHighlighter";
import {Demand} from "../mainstate/Demand";
import * as _ from "lodash";



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
    private difficulty: string;
    private music: Phaser.Sound;
    private quarter: number;
    private quarterText: Phaser.Text;
    private nextQuarterButton: SlickUI.Element.Button;
    private lastReportButton: SlickUI.Element.Button;
    private happiness: number;
    private happinessHistory: number[];

    init(slickUI: any, difficulty: string){
        this.slickUI = slickUI;
        this.difficulty = difficulty;
    }

    create() {
        this.setupHappiness();
        this.setupQuarterCounter();

        this.setupMusic();
        this.setupMap();
        this.setupFacilities();
        this.setupDialogs();
        this.setupText();
        this.setupInventory();
        this.setupDemand();
        this.setupHover();
        this.setupUI();
    }

    private setupFacilities() {
        this.facilities = new Facilities(this.map);
    }

    private setupInventory() {
        let money = 250;
        if(this.difficulty == "medium"){
            money = 125;
        }else if(this.difficulty == "hard"){
            money = 50;
        }

        this.inventory = new Inventory(money);
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

        if(this.nextQuarterButton.visible === true) {
            if (this.placer == null) {
                this.dialogs.powerTileClicked(powerTile, pointer);
            } else {
                this.placer.clickCallback(powerTile, this.inventory, this.facilities);
                this.game.input.deleteMoveCallback(this.placer.moveCallback, null);
                this.placer = null;
            }
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

    private setupMusic() {
        this.music = this.add.audio("main_music_01");
        this.music.loopFull(0.1);
    }

    private setupUI() {
        let nextQuarter = new SlickUI.Element.Button(350, 600, 150, 25);
        this.slickUI.add(nextQuarter);
        nextQuarter.add(new SlickUI.Element.Text(0, 0, "Next Quarter")).center();
        nextQuarter.events.onInputUp.add(this.advanceQuarter, this);
        this.nextQuarterButton = nextQuarter;

        let lastReportButton = new SlickUI.Element.Button(500, 600, 150, 25);
        this.slickUI.add(lastReportButton);
        lastReportButton.add(new SlickUI.Element.Text(0, 0, "Last Report")).center();
        this.lastReportButton = lastReportButton;
    }

    private advanceQuarter() {
        let gameOver = this.updateHappiness();

        if(gameOver){
            return;
        }

        this.nextQuarterButton.visible = false;
        let nextQuarterButton = this.nextQuarterButton;

        this.quarter += 1;
        this.quarterText.text = `Quarter ${this.quarter}`;

        let events = this.generateEvents();
        let descriptions: string[] = [];
        events.forEach(function(event){
            descriptions.push(event.getDescription());
        });

        if(descriptions.length === 0){
            descriptions.push("Nothing particularly notable happened.");
        }

        descriptions.push("");
        descriptions.push("");
        descriptions.push(this.getHappinessString());

        let panel = new SlickUI.Element.Panel(250, 50, 500, 500);
        this.slickUI.add(panel);
        panel.add(new SlickUI.Element.Text(5, 0, _.join(descriptions, "\n")));
        let okButton = new SlickUI.Element.Button(425, 445, 50, 30);
        panel.add(okButton);
        okButton.add(new SlickUI.Element.Text(0,0,"OK")).center();

        okButton.events.onInputUp.add(function(){
            panel.container.displayGroup.destroy(true);
            nextQuarterButton.visible = true;
        }, this);
    }

    private setupQuarterCounter() {
        this.quarter = 0;
        let textStyle = {font: "20px monospace", fill: "#fff", };
        this.quarterText = this.add.text(0, 0, `Quarter ${this.quarter}`, textStyle);
        this.quarterText.setTextBounds(150,600, 200, 25);
    }

    private generateEvents() {
        let events: RandomEvent[] = [];

        let chance = Math.random();
        if(chance > 0.50){
            events.push(new LightningStrike(this.facilities, this.demand));
        }

        for(let event of events){
            event.apply();
        }

        return events;
    }

    private setupHappiness() {
        this.happiness = 50.0;
        this.happinessHistory = [];
    }

    private getHappinessString() {
        if(this.happiness > 80.0){
            return "The people are ecstatic about your performance.";
        }else if(this.happiness > 60.0){
            return "The people think your performance is good.";
        }else if(this.happiness > 40.0){
            return "The people feel neutral about your performance.";
        }else if(this.happiness > 20.0){
            return "The people feel your performance is not up to par.";
        }
        return "Your performance is abysmal.";
    }

    private updateHappiness() {
        this.happiness = this.happiness * 0.75 + 35.0 * 0.25;
        this.happinessHistory.push(this.happiness);
        if(this.happinessHistory.length > 5){
            this.happinessHistory.shift();
        }

        let sum = this.happinessHistory.reduce(function(a, b){return a+b});
        let average = sum / this.happinessHistory.length;
        if(average < 38.0){
            this.gameOver("People were unhappy with you for too long.");
            return true;
        }

        return false;
    }

    private gameOver(reason: string) {
        this.nextQuarterButton.container.displayGroup.destroy(true);
        this.lastReportButton.container.displayGroup.destroy(true);
        this.belowText.destroy(true);
        this.music.destroy();
        this.demandText.destroy(true);
        this.quarterText.destroy(true);


        this.game.state.start("game_over", false, false, this.slickUI, reason);
    }
}

interface RandomEvent{

    getDescription(): string;

    apply(): void;
}

class LightningStrike implements RandomEvent{
    private outage: boolean = false;
    private line: PowerLine;
    private demand: Demand;
    private facilities: Facilities;

    constructor(facilities: Facilities, demand: Demand){
        this.facilities = facilities;
        this.line = this.pickRandomLine();
        this.demand = demand;
    }

    getDescription(): string {
        let description = "Lightning struck nearby, but had no effect.";
        if(this.line != null) {
            description = "Lightning struck and destroyed a line.";
            if (this.outage) {
                description += " An outage resulted.";
            }
        }
        return description;
    }

    apply(): void {
        if(this.line != null) {
            this.demand.calculateSatisfaction();
            let satisfactionBefore = this.demand.satisfaction;

            this.facilities.deleteLine(this.line);

            this.demand.calculateSatisfaction();
            let satisfactionAfter = this.demand.satisfaction;

            if (satisfactionAfter.unconnected > satisfactionBefore.unconnected) {
                this.outage = true;
            }
        }
    }

    private pickRandomLine(): PowerLine {
        let networks = this.facilities.powerNetwork.allSubnetworks();
        if(networks.length === 0){
            return null;
        }
        let network = networks[_.random(0, networks.length-1)];
        if(network.lines.length === 0){
            return null;
        }
        return network.lines[_.random(0, network.lines.length-1)];
    }
}

// class TransformerExplosion implements RandomEvent{
//
// }
//
// class TreeFall implements RandomEvent{
//
// }


