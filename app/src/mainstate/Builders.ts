import {GameMap} from "./GameMap";
import {MapLayers, FacilityTypes, Facilities} from "./Facilities";

export interface Builder{
    materialsCost: number;
    landCost: number;
    workersCost: number;

    fuelCost: number;
    upkeepCost: number;

    open: ()=>void;
    close: ()=>void;
    completeAffirmative: ()=>void;

    mapClicked(mapTile: {x:number, y:number}): void;
    mapHovered(mapTile: {x:number, y:number}): void;

    onReady: (callback:()=>void)=>void;
    onChange: (callback:()=>void)=>void;
    setupConfirmation(confirmation: {yes: Phaser.Button; no: Phaser.Button}): void;
}

class BaseBuilder implements Builder{
    materialsCost: number;
    landCost: number;
    workersCost: number;
    fuelCost: number;
    upkeepCost: number;

    private isReady: boolean;
    private map: GameMap;
    private lastLocation: {x: number; y: number};
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

    mapClicked(mapTile: {x: number; y: number}){
        if(this.isOpen) {
            this.clearLast();
            this.putTile(mapTile);
            this.updateCost();
            this.readyCallback();
            this.isReady = true;
        }
    }
    mapHovered(mapTile: {x: number; y: number}){
        if(this.isOpen && !this.isReady) {
            this.clearLast();
            this.putTile(mapTile);
            this.updateCost();
            this.changeCallback();
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

    }

    onReady(callback: () => void){
        this.readyCallback = callback;
    }

    onChange(callback: () => void){
        this.changeCallback = callback;
    }

    protected clearLast() {
        this.map.overlays[MapLayers.TEMPORARY].clearTile(this.lastLocation.x, this.lastLocation.y);
    }

    protected putTile(mapTile: {x: number; y: number}) {
        this.map.overlays[MapLayers.TEMPORARY].setTile(mapTile.x, mapTile.y, this.tileType());
        this.lastLocation = mapTile;
    }

    protected updateCost() {
        this.landCost = this.map.prices.getPrice(this.lastLocation.x, this.lastLocation.y);
    }

    protected tileType() {
        return 0;
    }
}

export class GeneratorBuilder extends BaseBuilder{
    private facilities: Facilities;

    constructor(map: GameMap, facilities: Facilities){
        super(map);
        this.facilities = facilities;
        this.materialsCost = 25;
        this.workersCost = 10;
        this.fuelCost = 10;
        this.upkeepCost = 5;
    }

    completeAffirmative(){

    }

    protected tileType(){
        return FacilityTypes.Plant;
    }
}

export class SubstationBuilder extends BaseBuilder{
    private facilities: Facilities;

    constructor(map: GameMap, facilities: Facilities){
        super(map);
        this.facilities = facilities;
        this.materialsCost = 5;
        this.workersCost = 2;
        this.fuelCost = 0;
        this.upkeepCost = 2;
    }

    completeAffirmative(){
        // this.facilities.addSubstation()
    }

    protected tileType(){
        return FacilityTypes.Substation;
    }
}