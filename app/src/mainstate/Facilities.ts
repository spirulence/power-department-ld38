import {Inventory} from "./Inventory";
import {Graph} from "../utils/Graph";
import {bresenhamLine} from "../utils/Bresenham";
import {LandPrice} from "./LandPrice";
import {TerrainTypes} from "./Terrain";

export enum FacilityTypes{
    Nothing = -1,
    Plant = 5,
    Substation = 6,
    PowerLine = 7
}

export class MapLayers{
    public static readonly BASE = "base";
    public static readonly TEMP_LAYER = "temp";
    public static readonly LINES_LAYER = "lines";
    public static readonly FACILITIES_LAYER = "facilities";
    public static readonly HIGHLIGHTS = "highlights";
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
    location: VertexPoint;
    type: FacilityTypes;

    private map: Phaser.Tilemap;

    constructor(location: VertexPoint, type: FacilityTypes, map: Phaser.Tilemap){
        this.location = location;
        this.type = type;
        this.map = map;
    }

    isValid(){
        let currentTile = this.map.getTile(this.location.x, this.location.y, MapLayers.FACILITIES_LAYER, true);
        return currentTile.index === FacilityTypes.Nothing;
    }

    draw() {
        this.map.putTile(this.type, this.location.x, this.location.y, MapLayers.FACILITIES_LAYER);
    }

    clear(){
        this.map.putTile(this.type, this.location.x, this.location.y, MapLayers.FACILITIES_LAYER);
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
}

export class PowerLine{
    from: VertexPoint;
    to: VertexPoint;
    cost: number;

    private map: Phaser.Tilemap;

    constructor(from: VertexPoint, to: VertexPoint, map: Phaser.Tilemap){
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
        this.draw(MapLayers.LINES_LAYER);
    }

    clearPermanent(){
        this.clear(MapLayers.LINES_LAYER);
    }

    drawTemporary(){
        this.draw(MapLayers.TEMP_LAYER);
    }

    clearTemporary(){
        this.clear(MapLayers.TEMP_LAYER);
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
            this.map.putTile(FacilityTypes.PowerLine, coord.x, coord.y, layer);
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
    //         let tileType = map.getTile(coord.x, coord.y, MapLayers.FACILITIES_LAYER, true).index;
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
            this.map.putTile(null, coord.x, coord.y, layer);
        }
    }

    private terrainCost(coords: {x:number, y:number}[]) {
        let extraCost = 0;
        for(let coord of coords){
            let tileIndex = this.map.getTile(coord.x, coord.y, "base", true).index;
            if(tileIndex == TerrainTypes.Mountain){
                extraCost += 5;
            }else if(tileIndex == TerrainTypes.Water){
                extraCost += 3;
            }
        }
        return extraCost;
    }

    private facilityAt(point: VertexPoint) {
        return this.map.getTile(point.x, point.y, MapLayers.FACILITIES_LAYER, true).index != FacilityTypes.Nothing;
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
    private map: Phaser.Tilemap;
    private inventory: Inventory;
    private notifiers: FacilitiesNotifier[];

    powerNetwork: PowerNetwork;
    private landPrice: LandPrice;


    constructor(map: Phaser.Tilemap) {
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

    addSubstation(baseTile: Phaser.Tile) {
        let location = new VertexPoint(baseTile.x, baseTile.y, -1);
        let facility = new Facility(location, FacilityTypes.Substation, this.map);
        let price = 5 + this.landPrice.getPrice(baseTile.x, baseTile.y);
        if (this.inventory.enoughDollars(price) && facility.isValid()) {
            facility.draw();
            this.inventory.deductDollars(price);
            this.powerNetwork.addFacility(facility);
            this.notify();
        }
    }

    addPlant(baseTile: Phaser.Tile) {
        let location = new VertexPoint(baseTile.x, baseTile.y, -1);
        let facility = new Facility(location, FacilityTypes.Plant, this.map);
        let price = 25 + this.landPrice.getPrice(baseTile.x, baseTile.y);
        if (this.inventory.enoughDollars(price) && facility.isValid()) {
            facility.draw();
            this.inventory.deductDollars(price);
            this.powerNetwork.addFacility(facility);
            this.notify();
        }
    }

    purchaseLine(line: PowerLine) {
        if(this.inventory.enoughDollars(line.cost)){
            this.inventory.deductDollars(line.cost);
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
    }

    setInventory(inventory: Inventory) {
        this.inventory = inventory;
    }

    setLandPrice(landPrice: LandPrice){
        this.landPrice = landPrice;
    }

    isFacilityAt(coord: VertexPoint) {
        return this.map.getTile(coord.x, coord.y, MapLayers.FACILITIES_LAYER, true).index != FacilityTypes.Nothing;
    }

    deleteConnectionsAtFacility(facility: Facility) {
        let connectedLines = this.powerNetwork.getFacilityConnections(facility);
        for(let line of connectedLines){
            this.deleteLine(line);
        }
    }
}
