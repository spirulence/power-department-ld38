import {GameMap, MapTile} from "./GameMap";
import {Facilities, Plant, VertexPoint, Substation} from "./Facilities";

export interface Builder{
    materialsCost: number;
    landCost: number;
    workersCost: number;

    fuelCost: number;
    upkeepCost: number;

    open: ()=>void;
    close: ()=>void;
    completeAffirmative: ()=>void;

    mapClicked(mapTile: MapTile): void;
    mapHovered(mapTile: MapTile): void;

    onReady: (callback:()=>void)=>void;
    onChange: (callback:()=>void)=>void;
    setupConfirmation(confirmation: {yes: Phaser.Button; no: Phaser.Button}): void;
}

abstract class BaseBuilder implements Builder{
    materialsCost: number;
    landCost: number;
    workersCost: number;
    fuelCost: number;
    upkeepCost: number;

    protected lastLocation: {x: number; y: number};
    protected map: GameMap;

    private isReady: boolean;
    private isOpen: boolean;
    private readyCallback: () => void;
    private changeCallback: () => void;

    constructor(map: GameMap){
        this.map = map;
        this.isOpen = false;
        this.lastLocation = {x:-1, y:-1};
        this.isReady = false;
    }

    setupConfirmation(confirmation: {yes: Phaser.Button; no: Phaser.Button}): void {
        confirmation.yes.position = this.map.toScreen(this.lastLocation);
        confirmation.yes.position.y -= 12;
        confirmation.yes.position.x -= 40;
        confirmation.yes.visible = true;
        let complete = function(this: BaseBuilder){
            this.completeAffirmative();
            confirmation.yes.onInputUp.remove(complete, this);
            confirmation.yes.visible = false;
            confirmation.no.onInputUp.remove(complete2, this);
            confirmation.no.visible = false;
        };
        confirmation.yes.onInputUp.add(complete, this);

        confirmation.no.position = this.map.toScreen(this.lastLocation);
        confirmation.no.position.y -= 12;
        confirmation.no.position.x += 16;
        confirmation.no.visible = true;
        let complete2 = function(this: BaseBuilder){
            this.close();
            confirmation.yes.onInputUp.remove(complete, this);
            confirmation.yes.visible = false;
            confirmation.no.onInputUp.remove(complete2, this);
            confirmation.no.visible = false;
        };
        confirmation.no.onInputUp.add(complete2, this);
    }

    mapClicked(tile: MapTile){
        if(this.isOpen) {
            this.clearLast();
            this.speculate(tile.location);
            this.updateCost();
            this.readyCallback();
            this.isReady = true;
            this.lastLocation = tile.location;
        }
    }
    mapHovered(mapTile: MapTile){
        if(this.isOpen && !this.isReady) {
            this.clearLast();
            this.speculate(mapTile.location);
            this.updateCost();
            this.changeCallback();
            this.lastLocation = mapTile.location;
        }
    }

    close(){
        if(this.isOpen){
            this.clearLast();
        }
        this.isOpen = false;
        this.isReady = false;
    }
    open(){
        this.isOpen = true;
        this.isReady = false;
    }

    completeAffirmative(){
        this.clearLast();
        this.build();
    }

    onReady(callback: () => void){
        this.readyCallback = callback;
    }

    onChange(callback: () => void){
        this.changeCallback = callback;
    }

    protected abstract clearLast(): void;

    protected abstract speculate(mapTile: {x: number; y: number}): void;

    protected abstract updateCost(): void;

    protected abstract build(): void;
}

export class GeneratorBuilder extends BaseBuilder{
    private facilities: Facilities;
    private generator: Plant;

    constructor(map: GameMap, facilities: Facilities){
        super(map);
        this.facilities = facilities;
        this.generator = null;
    }
    
    protected clearLast(): void {
        if(this.generator != null && this.generator.isValid()) {
            this.generator.clearTemp();
        }
    }

    protected speculate(mapTile: {x: number; y: number}): void {
        this.generator = new Plant(new VertexPoint(mapTile.x, mapTile.y, -1), this.map);
        if(this.generator.isValid()) {
            this.generator.speculate();
            this.generator.drawTemp()
        }
    }

    protected build(): void {
        if(this.generator != null && this.generator.isValid()) {
            this.facilities.addPlant(this.generator);
        }
    }
    
    protected updateCost() {
        this.materialsCost = this.generator.initialCosts.materials;
        this.landCost = this.generator.initialCosts.land;
        this.workersCost = this.generator.initialCosts.workers;
        
        this.fuelCost = this.generator.quarterlyCosts.fuel;
        this.upkeepCost = this.generator.quarterlyCosts.upkeep;
    }
}

export class SubstationBuilder extends BaseBuilder{
    private facilities: Facilities;
    private substation: Substation;

    constructor(map: GameMap, facilities: Facilities){
        super(map);
        this.facilities = facilities;
        this.substation = null;
    }
    
    protected clearLast(): void {
        if(this.substation != null && this.substation.isValid()) {
            this.substation.clearTemp();
        }
    }

    protected speculate(mapTile: {x: number; y: number}): void {
        this.substation = new Substation(new VertexPoint(mapTile.x, mapTile.y, -1), this.map);
        if(this.substation.isValid()) {
            this.substation.speculate();
            this.substation.drawTemp()
        }
    }

    protected build(): void {
        if(this.substation != null && this.substation.isValid()) {
            this.facilities.addPlant(this.substation);
        }
    }

    protected updateCost() {
        this.materialsCost = this.substation.initialCosts.materials;
        this.landCost = this.substation.initialCosts.land;
        this.workersCost = this.substation.initialCosts.workers;

        this.fuelCost = this.substation.quarterlyCosts.fuel;
        this.upkeepCost = this.substation.quarterlyCosts.upkeep;
    }
    
}