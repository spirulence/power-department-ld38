import {Inventory} from "./Inventory";
import {Graph} from "../utils/Graph";
import {bresenhamLine} from "../utils/Bresenham";
import {LandPrice} from "./LandPrice";
import {TerrainTypes} from "./Terrain";
import {MapLayers, GameMap} from "./GameMap";
import {Finances} from "./Finances";

export enum FacilityTypes{
    Nothing = -1,
    Plant = 5,
    Substation = 6,
    PowerLine = 7
}



export class VertexPoint {
    x: number;
    y: number;
    vertex: number;

    constructor(x: number, y: number, vertex: number){
        this.x = x;
        this.y = y;
        this.vertex = vertex;
    }

    toArrayCoordinate(arrayWidth: number){
        return this.y * arrayWidth + this.x;
    }

    hash(){
        return this.x.toString() + "-" + this.y.toString();
    }
}

export class Facility{
    price: number;
    location: VertexPoint;
    type: FacilityTypes;

    initialCosts:{
        materials: number,
        land: number,
        workers: number
    };

    quarterlyCosts:{
        fuel: number,
        upkeep: number
    };

    protected map: GameMap;

    constructor(location: VertexPoint, type: FacilityTypes, map: GameMap){
        this.location = location;
        this.type = type;
        this.map = map;

        this.setupCosts();
    }

    isValid(){
        let range = 1;
        
        for(let x = -range; x<= range; x++){
            for(let y = -range; y<=range; y++){
                let location = {x: x+this.location.x, y: y+this.location.y};
                if(this.map.hasTile(location)) {
                    let facility = this.map.getTile(location).facility;
                    if (facility != FacilityTypes.Nothing) {
                        return false;
                    }
                }
            }
        }

        if(this.map.hasTile(this.location) && this.map.getTile(this.location).terrain == TerrainTypes.Water){
            return false;
        }

        return true;
    }

    draw() {
        this.map.layers.facilities.setTile(this.location, this.type);
    }

    drawTemp(){
        this.map.layers.temporary.setTile(this.location, this.type);
    }

    clear(){
        this.map.layers.facilities.clearTile(this.location);
    }

    clearTemp(){
        this.map.layers.temporary.clearTile(this.location);
    }

    coverageArea():VertexPoint[]{
        return [];
    }

    setupCosts() {
        this.initialCosts = {
            "materials": 0,
            "land": 0,
            "workers": 0
        };
        this.initialCosts.land = this.map.getTile(this.location).landPrice;

        this.quarterlyCosts = {
            "fuel": 0,
            "upkeep": 0
        }
    }
}

export class Substation extends Facility{

    constructor(location: VertexPoint, map: GameMap){
        super(location, FacilityTypes.Substation, map);
    }

    coverageArea(){
        let coverage: VertexPoint[] = [];

        let coverageLevel = SUBSTATION_LEVELS[0];
        if(this.type == FacilityTypes.Substation) {
            for (let offset of coverageLevel) {
                let covered = new VertexPoint(offset.x + this.location.x, offset.y + this.location.y, -1);
                coverage.push(covered);
            }
        }

        return coverage;
    }

    setupCosts(){
        super.setupCosts();

        this.initialCosts.materials = 5;
        this.initialCosts.workers = 2;

        this.quarterlyCosts.upkeep = 2;
    }

    speculate() {
        this.initialCosts.land = this.map.getTile(this.location).landPrice;
        this.price = this.initialCosts.materials + this.initialCosts.land;
    }
}

export class Plant extends Facility{

    constructor(location: VertexPoint, map: GameMap){
        super(location, FacilityTypes.Plant, map);
    }

    setupCosts(){
        super.setupCosts();

        this.initialCosts.materials = 25;
        this.initialCosts.workers = 5;

        this.quarterlyCosts.fuel = 10;
        this.quarterlyCosts.upkeep = 5;
    }

    speculate() {
        this.initialCosts.land = this.map.getTile(this.location).landPrice;
        this.price = this.initialCosts.materials + this.initialCosts.land;
    }
}

export class PowerLine{
    from: VertexPoint;
    to: VertexPoint;
    cost: number;

    private map: GameMap;

    constructor(from: VertexPoint, to: VertexPoint, map: GameMap){
        if(from.toArrayCoordinate(map.width) > to.toArrayCoordinate(map.width)){
            this.from = to;
            this.to = from;
        }else{
            this.from = from;
            this.to = to;
        }
        this.map = map;
        this.cost = this.calculateCost();
    }

    private calculateCost(){
        if(this.isValid()) {
            let coords = this.getRawCoords();
            return coords.length + this.terrainCost(coords);
        }else{
            return 0;
        }
    }

    drawPermanent(){
        this.draw(MapLayers.LINES);
    }

    clearPermanent(){
        this.clear(MapLayers.LINES);
    }

    drawTemporary(){
        this.draw(MapLayers.TEMPORARY);
    }

    clearTemporary(){
        this.clear(MapLayers.TEMPORARY);
    }

    hash(){
        return this.from.hash() + "_" + this.to.hash();
    }

    isValid(){
        return this.facilityAt(this.from) && this.facilityAt(this.to);
    }

    private draw(layer: string) {
        let coords = this.getRawCoords();
        for(let coord of coords) {
            this.map.layers[layer].setTile(coord, FacilityTypes.PowerLine);
        }
    }

    private getRawCoords() {
        let coords: {x:number, y:number}[] = [];
        let setPixel = function (x: number, y: number) {
            coords.push({x:x, y:y});
        };

        bresenhamLine(this.from.x, this.from.y, this.to.x, this.to.y, setPixel);

        return coords;
    }

    // private containsForeignFacility(map: Phaser.Tilemap, coords: {x:number, y:number}[]) {
    //     for(let coord of coords){
    //         if(this.isFromOrTo(coord)){
    //             continue;
    //         }
    //
    //         let tileType = map.getTile(coord.x, coord.y, MapLayers.FACILITIES, true).index;
    //
    //         if(tileType !== FacilityTypes.Nothing){
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    // private isFromOrTo(coord: {x: number; y: number}) {
    //     return (coord.x === this.from.x && coord.y === this.to.y) || (coord.x === this.to.x && coord.y === this.to.y)
    // }

    private clear(layer: string) {
        let coords = this.getRawCoords();
        for(let coord of coords){
            this.map.layers[layer].clearTile(coord);
        }
    }

    private terrainCost(coords: {x:number, y:number}[]) {
        let extraCost = 0;
        for(let coord of coords){
            let terrain = this.map.getTile(coord).terrain;
            if(terrain == TerrainTypes.Mountain){
                extraCost += 5;
            }else if(terrain == TerrainTypes.Water){
                extraCost += 3;
            }
        }
        return extraCost;
    }

    private facilityAt(point: VertexPoint) {
        return this.map.getTile(point).facility != FacilityTypes.Nothing;
    }
}

export type SubstationCoverage = {x:number, y:number}[];

//@formatter:off
export const SUBSTATION_LEVELS: SubstationCoverage[] = [
    [
        {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},
        {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},
        {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}
    ],
    [
                      {x:-1, y:2},  {x:0,y:2},  {x:1,y:2},
        {x:-2, y:1},  {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},  {x:2, y:1},
        {x:-2, y:0},  {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},  {x:2, y:0},
        {x:-2, y:-1}, {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}, {x:2, y:-1},
                      {x:-1, y:-2}, {x:0,y:-2}, {x:1,y:-2},
    ],
    [
                                                  {x:0,y:3},
                                    {x:-1, y:2},  {x:0,y:2},  {x:1,y:2},
                      {x:-2, y:1},  {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},  {x:2, y:1},
        {x:-3, y:0},  {x:-2, y:0},  {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},  {x:2, y:0}, {x:3, y:0},
                      {x:-2, y:-1}, {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}, {x:2, y:-1},
                                    {x:-1, y:-2}, {x:0,y:-2}, {x:1,y:-2},
                                                  {x:0,y:-3}
    ]
];
//@formatter:on

export interface SubNetwork {
    substations: Facility[];
    plants: Facility[];
    lines: PowerLine[];
}

export class PowerNetwork {
    private graph: Graph;

    private facilitiesByCoord: { [id: string]: Facility };
    private facilitiesByVertex: { [id: number]: Facility };
    private linesByCoords: {[id: string]: PowerLine};
    private linesByVertex: {[id: number]: {[id: number]: PowerLine}};

    constructor() {
        this.graph = new Graph();
        this.facilitiesByVertex = {};
        this.facilitiesByCoord = {};
        this.linesByCoords = {};
        this.linesByVertex = {};
    }

    addFacility(facility: Facility) {
        facility.location.vertex = this.graph.addVertex();
        this.facilitiesByCoord[facility.location.hash()] = facility;
        this.facilitiesByVertex[facility.location.vertex] = facility;
    }

    addLine(line: PowerLine) {
        let source = this.facilitiesByCoord[line.from.hash()];
        let destination = this.facilitiesByCoord[line.to.hash()];
        line.from.vertex = source.location.vertex;
        line.to.vertex = destination.location.vertex;

        this.linesByCoords[line.hash()] = line;

        if(this.linesByVertex[line.from.vertex] == null) {
            this.linesByVertex[line.from.vertex] = {};
        }
        this.linesByVertex[line.from.vertex][line.to.vertex] = (line);

        if(this.linesByVertex[line.to.vertex] == null) {
            this.linesByVertex[line.to.vertex] = {};
        }
        this.linesByVertex[line.to.vertex][line.from.vertex] = (line);

        this.graph.addEdge(source.location.vertex, destination.location.vertex);
    }

    deleteLine(line: PowerLine){
        delete this.linesByCoords[line.hash()];
        delete this.linesByVertex[line.from.vertex][line.to.vertex];
        delete this.linesByVertex[line.to.vertex][line.from.vertex];

        this.graph.removeEdge(line.from.vertex, line.to.vertex);
    }

    subnetworkAt(coord: VertexPoint) {
        let vertex = coord.vertex;
        if(vertex == -1){
            vertex = this.facilitiesByCoord[coord.hash()].location.vertex;
        }

        let component = this.graph.components.wholeComponent(this.graph.components.component(vertex));

        let lines: { [index:string] : PowerLine } = {};


        let result: SubNetwork = {substations: [], plants: [], lines: []};
        for (let connectedVertex of component) {
            let facility = this.facilitiesByVertex[connectedVertex];
            switch (facility.type) {
                case FacilityTypes.Substation:
                    result.substations.push(facility);
                    break;
                case FacilityTypes.Plant:
                    result.plants.push(facility);
                    break;
                default:
                    break;
            }

            let linesHere = this.linesByVertex[connectedVertex];
            if(linesHere == null){
                linesHere = {};
            }

            for(let lineVertex in linesHere){
                let line = linesHere[lineVertex];
                lines[line.hash()] = line;
            }
        }

        for(let lineKey in lines){
            result.lines.push(lines[lineKey]);
        }

        return result;
    }

    allSubnetworks(){
        let subnetworks: SubNetwork[] = [];

        for(let componentId = 0; componentId < this.graph.components.size(); componentId++){
            let firstVertex = this.graph.components.wholeComponent(componentId)[0];
            subnetworks.push(this.subnetworkAt(new VertexPoint(0,0,firstVertex)));
        }

        return subnetworks;
    }

    getLines() {
        let lines = [];
        for(let lineKey in this.linesByCoords){
            lines.push(this.linesByCoords[lineKey]);
        }
        return lines;
    }

    getFacilityConnections(facility: Facility) {
        let linesHashed: {[id:string]: PowerLine} = {};
        for(let peerVertex of this.graph.adjacent(facility.location.vertex)){
            let line = this.linesByVertex[facility.location.vertex][peerVertex];
            linesHashed[line.hash()] = line;
        }

        let lines: PowerLine[] = [];
        for(let lineKey in linesHashed){
            lines.push(linesHashed[lineKey]);
        }
        return lines;
    }
}

export type FacilitiesNotifier = (facilities: Facilities)=>void;

export class Facilities {
    private map: GameMap;
    private inventory: Inventory;
    private finances: Finances;
    private notifiers: FacilitiesNotifier[];

    powerNetwork: PowerNetwork;
    private landPrice: LandPrice;


    constructor(map: GameMap) {
        this.map = map;
        this.powerNetwork = new PowerNetwork();
        this.notifiers = [];
    }

    addNotifier(callback: FacilitiesNotifier){
        this.notifiers.push(callback);
    }

    notify() {
        for (let callback of this.notifiers) {
            callback(this);
        }
    }


    addFacility(facility: Facility) {
        if (this.finances.canAffordFacility(facility)){
            if(facility.isValid()) {
                facility.draw();
                this.finances.newFacility(facility);
                this.powerNetwork.addFacility(facility);
                this.notify();
            }
        }
    }

    purchaseLine(line: PowerLine) {
        if(this.finances.canAffordLine(line)){
            this.finances.newLine(line);
            line.drawPermanent();
            this.powerNetwork.addLine(line);
            this.notify();
        }
    }

    deleteLine(line: PowerLine){
        let lines = this.powerNetwork.getLines();
        for(let line of lines){
            line.clearPermanent();
        }

        this.powerNetwork.deleteLine(line);

        lines = this.powerNetwork.getLines();
        for(let line of lines){
            line.drawPermanent();
        }

        this.notify();
    }

    setInventory(inventory: Inventory) {
        this.inventory = inventory;
    }

    setFinances(finances: Finances){
        this.finances = finances;
    }

    setLandPrice(landPrice: LandPrice){
        this.landPrice = landPrice;
    }

    isFacilityAt(coord: VertexPoint) {
        return this.map.getTile(coord).facility != FacilityTypes.Nothing;
    }

    deleteConnectionsAtFacility(facility: Facility) {
        let connectedLines = this.powerNetwork.getFacilityConnections(facility);
        for(let line of connectedLines){
            this.deleteLine(line);
        }
        this.notify();
    }
}
