///<reference path="../defs/definitions.d.ts"/>
import {Dialogs, DialogButtons} from "../interface/Dialogs";
import {Facilities, PowerLine, MapLayers, Facility} from "../mainstate/Facilities";
import {Inventory} from "../mainstate/Inventory";
import {LinePlacer} from "../mainstate/LinePlacer";
import {NetworkHighlighter} from "../mainstate/NetworkHighlighter";
import {Demand} from "../mainstate/Demand";
import * as _ from "lodash";
import {LandPrice} from "../mainstate/LandPrice";
import {TerrainTypes} from "../mainstate/Terrain";
import {LevelInfo} from "./GameSetup";
import {HappinessCalculator} from "../mainstate/Happiness";


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
    private music: Phaser.Sound[];
    private quarter: number;
    private quarterText: Phaser.Text;
    private nextQuarterButton: SlickUI.Element.Button;
    private happiness: HappinessCalculator;
    private lastEvents: RandomEvent[];
    private active: boolean;
    private mapID: string;
    private nextCutscene: string;
    private priceLayer: Phaser.TilemapLayer;
    private mapGroup: Phaser.Group;
    private scrollSpeed: number;

    init(slickUI: any, difficulty: string, level: LevelInfo){
        this.slickUI = slickUI;
        this.difficulty = difficulty;
        this.mapID = level.mapID;
        this.nextCutscene = level.cutsceneFile;
    }

    create() {
        this.active = true;
        this.scrollSpeed = 4;

        this.setupMusic();
        this.setupMap();
        this.setupQuarterCounter();
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
        let game = this.game;
        this.inventory.addNotifier(function (inv: Inventory, event: string) {
            belowText.text = `$${inv.dollarsMillions}m`;
            if(inv.dollarsMillions <= 0){
                belowText.setStyle({font: "20px monospace", fill: "#f00"});
            }else{
                belowText.setStyle({font: "20px monospace", fill: "#fff"});
            }

            if(event == "notEnough"){
                let blink = function(){
                    if(belowText.alpha == 1.0){
                        belowText.alpha = 0.0;
                    }else{
                        belowText.alpha = 1.0;
                    }
                };

                game.time.events.repeat(Phaser.Timer.SECOND/8.0, 10, blink);
            }
        });
        this.inventory.firstNotify();
    }

    private setupText() {
        let textStyle = {font: "20px monospace", fill: "#fff"};
        this.belowText = this.add.text(0, 600, "", textStyle);
    }

    private setupMap() {
        this.stage.smoothed = false;

        this.mapGroup = this.add.group();

        this.map = this.add.tilemap(this.mapID);
        this.map.addTilesetImage("tileset", "tileset");
        this.map.addTilesetImage("grid-tile", "grid-tile");

        for(let imageLayer of this.map.images) {
            this.add.image(imageLayer.x, imageLayer.y, imageLayer.image, null, this.mapGroup);
        }

        let baseLayer = this.map.createLayer(MapLayers.BASE, null, null, this.mapGroup);
        if(this.map.images.length > 0){
            baseLayer.alpha = 0.0;

            // assuming that maps with image layer also have grid layer..
            let gridLayer = this.map.createLayer("grid", null, null, this.mapGroup);
            gridLayer.alpha = 0.125;
        }
        baseLayer.inputEnabled = true;
        baseLayer.events.onInputDown.add(this.clickBaseLayer.bind(this));

        this.map.createBlankLayer(MapLayers.TEMP_LAYER, 125, 75, 8, 8, this.mapGroup);
        this.map.createBlankLayer(MapLayers.LINES_LAYER, 125, 75, 8, 8, this.mapGroup);
        this.map.createBlankLayer(MapLayers.FACILITIES_LAYER, 125, 75, 8, 8, this.mapGroup);
        this.map.createBlankLayer(MapLayers.HIGHLIGHTS, 125, 75, 8, 8, this.mapGroup);
        this.priceLayer = this.map.createBlankLayer(MapLayers.LAND_PRICE, 125, 75, 8, 8, this.mapGroup);
        this.priceLayer.visible = false;

        let centeredX = -(this.mapGroup.width*2 - this.world.width)/2;
        let centeredY = -(this.mapGroup.height*2 - this.world.height)/2;
        let mapGroup = this.mapGroup;

        let zoomIn = function(){
            if(mapGroup.scale.x != 2) {
                mapGroup.scale.set(2);
                mapGroup.position.set(centeredX, centeredY);
            }
        };

        let zoomOut = function(){
            if(mapGroup.scale.x != 1) {
                mapGroup.scale.set(1);
                mapGroup.position.set(0);
            }
        };

        this.input.keyboard.addKey(Phaser.KeyCode.ONE).onUp.add(zoomIn);
        this.input.keyboard.addKey(Phaser.KeyCode.TWO).onUp.add(zoomOut);
        let mouse = this.input.mouse;
        this.input.mouse.mouseWheelCallback = function(){
            if(mouse.wheelDelta == Phaser.Mouse.WHEEL_DOWN){
                zoomIn();
            }else{
                zoomOut();
            }
        }
    }

    private setupDialogs() {
        this.dialogs = new Dialogs(this.game);

        let addSubstation = this.facilities.addSubstation.bind(this.facilities);
        this.dialogs.addAction(DialogButtons.NewSubstation, addSubstation);

        let addPlant = this.facilities.addPlant.bind(this.facilities);
        this.dialogs.addAction(DialogButtons.NewPlant, addPlant);

        let map = this.map;
        let game = this.game;
        let mapGroup = this.mapGroup;
        let mainstate = this;
        let newTransmissionLine = function(tile: Phaser.Tile){
            let placer = new LinePlacer(map, mapGroup, tile);
            game.input.addMoveCallback(placer.moveCallback, null);
            mainstate.placer = placer;
        };
        this.dialogs.addAction(DialogButtons.NewTransmissionLine, newTransmissionLine);
    }

    private clickBaseLayer(_mapLayer: Phaser.TilemapLayer, pointer: Phaser.Pointer){
        let coords = this.mapGroup.toLocal(pointer.position, this.world);

        let powerTile = this.map.getTileWorldXY(
            coords.x, coords.y,
            undefined, undefined, MapLayers.FACILITIES_LAYER, true);
        let baseTile = this.map.getTileWorldXY(
            coords.x, coords.y,
            undefined, undefined, MapLayers.BASE, true);

        let terrainGood = baseTile.index != TerrainTypes.Mountain && baseTile.index != TerrainTypes.Water;

        if(this.nextQuarterButton.visible === true && this.active && terrainGood) {
            if (this.placer == null) {
                this.dialogs.powerTileClicked(powerTile, pointer);
            } else {
                this.placer.clickCallback(powerTile, this.facilities);
                this.game.input.deleteMoveCallback(this.placer.moveCallback, null);
                this.placer = null;
            }
        }
    }

    shutdown(){
        this.active = false;
    }



    update() {
        if(this.isZoomedIn()){
            this.scrollMap();
        }
    }

    private scrollMap() {
        if (this.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
            this.mapGroup.position.x += this.scrollSpeed;
        }
        if (this.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
            this.mapGroup.position.x -= this.scrollSpeed;
        }
        if (this.input.keyboard.isDown(Phaser.KeyCode.UP)) {
            this.mapGroup.position.y += this.scrollSpeed;
        }
        if (this.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
            this.mapGroup.position.y -= this.scrollSpeed;
        }
        this.mapGroup.position.clampX(-(this.mapGroup.width - this.world.width), 0);
        this.mapGroup.position.clampY(-(this.mapGroup.height - this.world.height), 0);
    }

    private isZoomedIn() {
        return this.mapGroup.scale.x != 1;
    }

    private setupHover() {
        let highlighter = new NetworkHighlighter();
        highlighter.facilities = this.facilities;
        highlighter.map = this.map;
        highlighter.mapGroup = this.mapGroup;
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
        this.music = [];
        this.music.push(this.add.audio("main_music_01"));
        this.music.push(this.add.audio("main_music_02"));
        this.music.push(this.add.audio("main_music_03"));

        let music = this.music;
        function playSong(){
            let index = _.random(0, music.length - 1);
            let chosen = music[index];
            chosen.play(null, 0, 0.1);
        }

        for(let track of music){
            track.onStop.add(playSong);
        }

        this.music[0].onDecoded.add(playSong);
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
        descriptions.push(this.happiness.current().sentence);
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
        this.quarterText.setTextBounds(150, 600, 200, 25);
    }

    private generateEvents() {
        let events: RandomEvent[] = [];

        let chance = Math.random();
        if(chance > 0.50){
            events.push(new LightningStrike(this.facilities, this.demand));
        }

        chance = Math.random();
        if(chance > 0.80 && this.mapID != "map1"){
            events.push(new Tornado(this.facilities, this.demand));
        }

        for(let event of events){
            event.apply();
        }

        return events;
    }

    private setupHappiness() {
        this.happiness = new HappinessCalculator(this.demand.satisfaction);
        this.lastEvents = [];
    }

    private updateHappiness() {
        this.demand.calculateSatisfaction();
        let outage = false;
        for(let event of this.lastEvents){
            if(event.outage){
                outage = true;
            }
        }
        this.happiness.addSatisfaction(this.demand.satisfaction, outage);

        if(this.happiness.isGameOver()){
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
        this.music.forEach(function(track){track.onStop.removeAll(); track.destroy()});
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

        this.game.state.start("game_won", false, false, this.slickUI, this.nextCutscene);
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

        let priceLayer = this.priceLayer;
        let key = this.game.input.keyboard.addKey(Phaser.KeyCode.P);
        key.onUp.add(function(){
            priceLayer.visible = !priceLayer.visible;
        });
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

class Tornado implements RandomEvent{
    outage: boolean;
    private facilities: Facilities;
    private substation: Facility;
    private demand: Demand;

    constructor(facilities: Facilities, demand: Demand){
        this.facilities = facilities;
        this.substation = this.pickRandomSubstation();
        this.demand = demand;
    }

    getDescription(): string {
        let description = "A tornado came down, but had no effect on you.";
        if(this.substation != null) {
            description = "A tornado came down, and destroyed connections at a facility.";
            if (this.outage) {
                description += " An outage resulted.";
            }
        }
        return description;
    }

    apply(): void {
        if(this.substation != null) {
            this.demand.calculateSatisfaction();
            let satisfactionBefore = this.demand.satisfaction;

            this.facilities.deleteConnectionsAtFacility(this.substation);

            this.demand.calculateSatisfaction();
            let satisfactionAfter = this.demand.satisfaction;

            if (satisfactionAfter.unconnected > satisfactionBefore.unconnected) {
                this.outage = true;
            }
        }
    }

    private pickRandomSubstation() {
        let networks = this.facilities.powerNetwork.allSubnetworks();
        if(networks.length === 0){
            return null;
        }
        let network = networks[_.random(0, networks.length-1)];
        if(network.substations.length === 0){
            return null;
        }
        return network.substations[_.random(0, network.substations.length-1)];
    }
}
//
// class TreeFall implements RandomEvent{
//
// }


