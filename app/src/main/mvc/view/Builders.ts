import {MapTile} from "./TileMapView";

export interface Builder{
    materialsCost: number;
    landCost: number;
    workersCost: number;

    fuelCost: number;
    upkeepCost: number;

    open(): void;
    close(): void;
    completeYes(): void;
    completeNo(): void;

    mapClicked(mapTile: MapTile): void;
    mapHovered(mapTile: MapTile): void;

    onReady(callback:(mapTile: MapTile)=>void): void;
    onChange(callback:()=>void): void;
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
    private readyCallback: (tile: MapTile) => void;
    private changeCallback: () => void;

    constructor(map: GameMap){
        this.map = map;
        this.isOpen = false;
        this.lastLocation = {x:-1, y:-1};
        this.isReady = false;
    }

    mapClicked(tile: MapTile){
        if(this.isOpen) {
            this.clearLast();
            this.speculate(tile.location);
            this.updateCost();
            this.readyCallback(tile);
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

    completeYes(){
        this.clearLast();
        this.build();
    }

    completeNo(){
        this.clearLast();
    }

    onReady(callback: (mapTile: MapTile) => void){
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
            this.facilities.addFacility(this.generator);
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
            this.facilities.addFacility(this.substation);
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

export class LineBuilder implements Builder{
    materialsCost: number;
    landCost: number;
    workersCost: number;
    fuelCost: number;
    upkeepCost: number;


    private isOpen: boolean;
    private facilities: Facilities;
    private line: PowerLine;
    private source: VertexPoint;
    private destination: VertexPoint;
    private map: GameMap;
    private readyCallback: (mapTile: MapTile) => void;
    private changeCallback: () => void;
    private isReady: boolean;

    constructor(map: GameMap, facilities: Facilities){
        this.map = map;
        this.facilities = facilities;
        this.line = null;
        this.source = null;
        this.destination = null;
        this.isReady = false;
    }


    mapClicked(tile: MapTile): any {
        if(this.isOpen) {
            if (tile.facility == FacilityTypes.Substation || tile.facility == FacilityTypes.Plant) {
                if (this.source == null) {
                    this.source = new VertexPoint(tile.location.x, tile.location.y, -1);
                } else {
                    this.clearLast();
                    this.destination = new VertexPoint(tile.location.x, tile.location.y, -1);
                    this.speculate();
                    this.updateCosts();
                    this.readyCallback(tile);
                    this.isReady = true;
                }
            }
        }
    }

    mapHovered(tile: MapTile): any {
        if(this.isOpen) {
            if (this.source != null && this.isReady == false) {
                this.clearLast();
                this.destination = new VertexPoint(tile.location.x, tile.location.y, -1);
                this.speculate();
                this.updateCosts();
                this.changeCallback();
            }
        }
    }

    onReady(callback: (mapTile: MapTile) => void){
        this.readyCallback = callback;
    }

    onChange(callback: () => void){
        this.changeCallback = callback;
    }

    open(): void {
        this.isOpen = true;
        this.clearStatus();
    }

    close(): void {
        this.clearLast();
        this.clearStatus();
        this.isOpen = false;
    }

    completeYes(): void {
        this.facilities.purchaseLine(this.line);
        this.clearStatus();
    }

    private clearStatus() {
        this.line = null;
        this.source = null;
        this.destination = null;
        this.isReady = false;
    }

    completeNo(): void {
        this.clearLast();
        this.clearStatus();
    }

    private clearLast() {
        if(this.line != null){
            this.line.clearTemporary();
        }
    }

    private speculate() {
        this.line = new PowerLine(this.source, this.destination, this.map);
        this.line.drawTemporary();
    }

    private updateCosts() {
        this.materialsCost = this.line.cost;
        this.landCost = 0;
        this.workersCost = this.line.cost;
        this.fuelCost = 0;
        this.upkeepCost = 1;
    }
}