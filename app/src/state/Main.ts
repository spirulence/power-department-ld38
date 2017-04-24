///<reference path="../defs/definitions.d.ts"/>
import {Dialogs, DialogButtons} from "../interface/Dialogs";
import {Facilities, PowerLine} from "../mainstate/Facilities";
import {Inventory} from "../mainstate/Inventory";
import {LinePlacer} from "../mainstate/LinePlacer";
import {NetworkHighlighter} from "../mainstate/NetworkHighlighter";
import {Demand, Satisfaction} from "../mainstate/Demand";
import * as _ from "lodash";
import {LandPrice} from "../mainstate/LandPrice";
import {TerrainTypes} from "../mainstate/Terrain";


interface Finances {
    revenue: number
    maintenance: number
    fuel: number
    interest: number
}

export class Main extends Phaser.State {
    map: Phaser.Tilemap;
    facilities: Facilities;
    dialogs: Dialogs;
    inventory: Inventory;
    landPrice: LandPrice;

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
    private happiness: number;
    private happinessHistory: number[];
    private satisfactionHistory: Satisfaction[];
    private lastEvents: RandomEvent[];
    private active: boolean;

    init(slickUI: any, difficulty: string){
        this.slickUI = slickUI;
        this.difficulty = difficulty;
    }

    create() {
        this.active = true;

        this.setupQuarterCounter();
        this.setupMusic();
        this.setupMap();
        this.setupLandPrice();
        this.setupFacilities();
        this.setupDialogs();
        this.setupText();
        this.setupInventory();
        this.setupDemand();
        this.setupHover();
        this.setupUI();
        this.setupHappiness();
    }

    private setupFacilities() {
        this.facilities = new Facilities(this.map);
        this.facilities.setLandPrice(this.landPrice);
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

        let imagelayer = this.map.images[0];
        this.add.image(imagelayer.x, imagelayer.y, imagelayer.name);

        let baseLayer = this.map.createLayer("base");
        baseLayer.alpha = 0.3;
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
        let baseTile = this.map.getTileWorldXY(
            pointer.position.x, pointer.position.y,
            undefined, undefined, "base", true);

        let terrainGood = baseTile.index != TerrainTypes.Mountain && baseTile.index != TerrainTypes.Water

        if(this.nextQuarterButton.visible === true && this.active && terrainGood) {
            if (this.placer == null) {
                this.dialogs.powerTileClicked(powerTile, pointer);
            } else {
                this.placer.clickCallback(powerTile, this.inventory, this.facilities);
                this.game.input.deleteMoveCallback(this.placer.moveCallback, null);
                this.placer = null;
            }
        }
    }

    shutdown(){
        this.active = false;
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
        let nextQuarter = new SlickUI.Element.Button(425, 600, 150, 25);
        this.slickUI.add(nextQuarter);
        nextQuarter.add(new SlickUI.Element.Text(0, 0, "Next Quarter")).center();
        nextQuarter.events.onInputUp.add(this.advanceQuarter, this);
        this.nextQuarterButton = nextQuarter;
    }

    private advanceQuarter() {
        let finances: Finances = this.runFinances();
        this.inventory.addDollars(finances.revenue);
        this.inventory.deductDollars(finances.maintenance);
        this.inventory.deductDollars(finances.fuel);
        this.inventory.deductDollars(finances.interest);

        if(this.gameIsWon()){
            this.gameWon();
            return;
        }

        if(this.isBankrupt()){
            return;
        }

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
        this.lastEvents = events;

        if(descriptions.length === 0){
            descriptions.push("Nothing particularly notable happened.");
        }

        descriptions.push("");
        descriptions.push(this.getHappinessString());
        descriptions.push("");
        descriptions.push("Revenue: +"+finances.revenue);
        descriptions.push("Maintenance: -"+finances.maintenance);
        descriptions.push("Fuel: -"+finances.fuel);
        descriptions.push("Loan Interest: -"+finances.interest);

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

        this.satisfactionHistory = [];
        this.satisfactionHistory.push(this.demand.satisfaction);
        this.lastEvents = [];
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
        this.demand.calculateSatisfaction();
        this.satisfactionHistory.push(this.demand.satisfaction);

        if(this.satisfactionHistory.length > 3){
            this.satisfactionHistory.shift();
        }

        let unconnectedSum = 0;
        for(let satisfaction of this.satisfactionHistory){
            unconnectedSum += satisfaction.unconnected;
        }
        let unconnectedAverage = unconnectedSum/this.satisfactionHistory.length;
        if(this.demand.satisfaction.unconnected < unconnectedAverage){
            this.happiness += 15;
        }

        for(let event of this.lastEvents){
            if(event.outage){
                this.happiness -= 15;
            }
        }

        this.happiness -= Math.floor(this.demand.satisfaction.unreliable / 10);

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
        this.teardown();

        this.game.state.start("game_over", false, false, this.slickUI, reason);
    }

    private teardown() {
        this.nextQuarterButton.container.displayGroup.destroy(true);
        this.belowText.destroy(true);
        this.music.destroy();
        this.demandText.destroy(true);
        this.quarterText.destroy(true);
    }

    private gameIsWon() {
        this.demand.calculateSatisfaction();

        //game is over when less than %10 of demand remains unconnected
        let enoughConnected = (this.demand.satisfaction.unconnected / this.demand.totalDemand) < .10;
        //and most is reliably connected
        let enoughReliable = (this.demand.satisfaction.unreliable / this.demand.satisfaction.reliable) < .35;

        return enoughConnected && enoughReliable;
    }

    private gameWon() {
        this.teardown();

        this.game.state.start("game_won", false, false, this.slickUI);
    }

    private runFinances() {
        //generate revenue based on how many connected
        let revenue = this.demand.satisfaction.reliable + this.demand.satisfaction.unreliable;
        revenue = Math.floor(revenue / 2);

        //pay maintenance based on lines and substations
        let maintenance = 0;
        for(let subnetwork of this.facilities.powerNetwork.allSubnetworks()){
            maintenance += subnetwork.substations.length * 2;
            maintenance += subnetwork.lines.length;
            maintenance += subnetwork.plants.length * 3;
        }

        //pay cost of fuel based on how many plants
        let fuel = 0;
        for(let subnetwork of this.facilities.powerNetwork.allSubnetworks()){
            fuel += subnetwork.plants.length * 10;
        }

        let interest = 0;
        if(this.inventory.dollarsMillions < 0){
            interest += Math.floor(this.inventory.dollarsMillions * .12);
        }

        return {
            revenue: revenue,
            maintenance: maintenance,
            fuel: fuel,
            interest: interest,
        };
    }

    private setupLandPrice() {
        this.landPrice = new LandPrice();
        this.landPrice.map = this.map;
    }

    private isBankrupt() {
        if(this.inventory.dollarsMillions <= -100){
            this.gameOver("You are bankrupt.");
            return true;
        }
        return false;
    }
}

interface RandomEvent{
    outage: boolean;

    getDescription(): string;

    apply(): void;
}

class LightningStrike implements RandomEvent{
    outage: boolean;
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


