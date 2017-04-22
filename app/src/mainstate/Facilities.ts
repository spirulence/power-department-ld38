import {Inventory} from "./Inventory";
import {Graph} from "../utils/Graph";
import {bresenhamLine} from "./LinePlacer";
import * as _ from "lodash";

export enum FacilityTypes{
    Nothing = -1,
    Plant = 5,
    Substation = 6,
    PowerLine = 7
}

interface FacilityVertex {
    vertex: number
    facilityType: string
}

interface SimplePoint {
    x: number,
    y: number
}

export type SubstationCoverage = SimplePoint[];

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

export interface PowerLine {
    from: SimplePoint;
    to: SimplePoint;
}

export interface SubNetwork {
    substations: SimplePoint[];
    plants: SimplePoint[];
    lines: PowerLine[];
}

export class PowerNetwork {
    private graph: Graph;

    private coordToVertex: { [id: string]: FacilityVertex };
    private vertexToCoord: { [id: number]: SimplePoint };

    constructor() {
        this.graph = new Graph();
        this.coordToVertex = {};
        this.vertexToCoord = {};
    }

    addSubstation(coord: SimplePoint) {
        let vertex = this.graph.addVertex();
        this.coordToVertex[PowerNetwork.hashCoordinate(coord)] = {vertex: vertex, facilityType: "substation"};
        this.vertexToCoord[vertex] = coord;
    }

    addPlant(coord: SimplePoint) {
        let vertex = this.graph.addVertex();
        this.coordToVertex[PowerNetwork.hashCoordinate(coord)] = {vertex: vertex, facilityType: "plant"};
        this.vertexToCoord[vertex] = coord;
    }

    addLine(source: SimplePoint, destination: SimplePoint) {
        let sourceVertex = this.coordToVertex[PowerNetwork.hashCoordinate(source)];
        let destinationVertex = this.coordToVertex[PowerNetwork.hashCoordinate(destination)];
        this.graph.addEdge(sourceVertex.vertex, destinationVertex.vertex);
    }

    deleteLine(source: SimplePoint, destination: SimplePoint){
        let sourceVertex = this.coordToVertex[PowerNetwork.hashCoordinate(source)];
        let destinationVertex = this.coordToVertex[PowerNetwork.hashCoordinate(destination)];
        this.graph.removeEdge(sourceVertex.vertex, destinationVertex.vertex);
    }

    static hashCoordinate(coordinate: SimplePoint) {
        return coordinate.x.toString() + "-" + coordinate.y.toString();
    }

    at(coord: SimplePoint) {
        let result = this.coordToVertex[PowerNetwork.hashCoordinate(coord)];
        if (result != null) {
            return this.coordToVertex[PowerNetwork.hashCoordinate(coord)].facilityType;
        } else {
            return "";
        }
    }

    subnetworkAt(coord: SimplePoint) {
        let vertex = this.coordToVertex[PowerNetwork.hashCoordinate(coord)].vertex;
        let component = this.graph.components.wholeComponent(this.graph.components.component(vertex));

        let lineStrings: { [index:string] : boolean } = {};
        let hashEdge = function(vertex1: number, vertex2: number){
            return Math.min(vertex1, vertex2).toString() + "-" + Math.max(vertex1, vertex2);
        };
        let unhashEdge = function(hash: string){
            let splits = hash.split("-");
            return {from: Number(splits[0]), to: Number(splits[1])};
        };

        let result: SubNetwork = {substations: [], plants: [], lines: []};
        for (let connectedVertex of component) {
            let connectedCoord = this.vertexToCoord[connectedVertex];
            let facility = this.coordToVertex[PowerNetwork.hashCoordinate(connectedCoord)].facilityType;
            switch (facility) {
                case "substation":
                    result.substations.push(connectedCoord);
                    break;
                case "plant":
                    result.plants.push(connectedCoord);
                    break;
                default:
                    break;
            }

            for(let peer of this.graph.adjacent(connectedVertex)){
                lineStrings[hashEdge(connectedVertex, peer)] = true;
            }
        }

        for(let hashed in lineStrings){
            let vertices = unhashEdge(hashed);
            result.lines.push({from: this.vertexToCoord[vertices.from], to: this.vertexToCoord[vertices.to]});
        }

        return result;
    }

    allSubnetworks(){
        let subnetworks: SubNetwork[] = [];

        for(let componentId = 0; componentId < this.graph.components.size(); componentId++){
            let firstVertex = this.graph.components.wholeComponent(componentId)[0];
            subnetworks.push(this.subnetworkAt(this.vertexToCoord[firstVertex]));
        }

        return subnetworks;
    }
}

export type FacilitiesNotifier = (facilities: Facilities)=>void;

export class Facilities {
    private map: Phaser.Tilemap;
    private lineCoords: {[id: string]: PowerLine[]};
    private inventory: Inventory;
    private notifiers: FacilitiesNotifier[];

    powerNetwork: PowerNetwork;

    private static readonly POWER_LAYER = "power";


    constructor(map: Phaser.Tilemap) {
        this.map = map;
        this.powerNetwork = new PowerNetwork();
        this.notifiers = [];
        this.lineCoords = {};
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
        let location = {x: baseTile.x, y: baseTile.y};
        let facilityAtTile = this.powerNetwork.at(location) === "substation";
        if (this.inventory.enoughDollars(2) && !facilityAtTile) {
            this.map.putTile(6, baseTile.x, baseTile.y, "power");
            this.inventory.deductDollars(2);
            this.powerNetwork.addSubstation(location);
            this.notify();
        }
    }

    addPlant(baseTile: Phaser.Tile) {
        let location = {x: baseTile.x, y: baseTile.y};
        let facilityAtTile = this.powerNetwork.at(location) === "plant";
        if (this.inventory.enoughDollars(5) && !facilityAtTile) {
            this.map.putTile(5, baseTile.x, baseTile.y, "power");
            this.inventory.deductDollars(5);
            this.powerNetwork.addPlant(location);
            this.notify();
        }
    }

    addLine(source: Phaser.Tile, destination: Phaser.Tile, coords: SimplePoint[]) {
        let sourceCoord = {x: source.x, y: source.y};
        let destinationCoord = {x: destination.x, y: destination.y};

        for(let coord of coords) {
            let hash = PowerNetwork.hashCoordinate(coord);
            if(this.lineCoords[hash] == null){
                this.lineCoords[hash] = [];
            }
            this.lineCoords[hash].push({from: sourceCoord, to: destinationCoord});
        }

        this.powerNetwork.addLine(sourceCoord, destinationCoord);
        this.notify();
    }

    deleteLine(line: PowerLine){
        this.powerNetwork.deleteLine(line.from, line.to);

        let coords: SimplePoint[] = [];
        bresenhamLine(line.from.x, line.from.y, line.to.x, line.to.y, function(x: number, y:number):void{
            coords.push({x:x, y:y});
        });

        for (let coord of coords) {
            if(this.powerLineAt(coord)){
                let lineCoords: PowerLine[] = this.removeAndUpdateLineCoords(line, coord);
                if(lineCoords.length === 0) {
                    this.clearCoord(coord);
                }
            }
        }
    }

    private clearCoord(coord: SimplePoint) {
        this.map.putTile(null, coord.x, coord.y, Facilities.POWER_LAYER);
    }

    private powerLineAt(coord: SimplePoint) {
        return this.map.getTile(coord.x, coord.y, Facilities.POWER_LAYER, true).index === FacilityTypes.PowerLine;
    }

    setInventory(inventory: Inventory) {
        this.inventory = inventory;
    }

    areConnectable(source: Phaser.Tile, destination: Phaser.Tile) {
        let sourceType = this.powerNetwork.at({x: source.x, y: source.y});
        let sourceYes = sourceType == "substation" || sourceType == "plant";

        let destinationType = this.powerNetwork.at({x: destination.x, y: destination.y});
        let destinationYes = destinationType == "substation" || destinationType == "plant";

        return sourceYes && destinationYes;
    }

    static coverageArea(substation: SimplePoint){
        let coverage: SimplePoint[] = [];

        let coverageLevel = SUBSTATION_LEVELS[0];
        for (let offset of coverageLevel) {
            let covered: SimplePoint = {x: offset.x + substation.x, y: offset.y + substation.y};
            coverage.push(covered);
        }

        return coverage;
    }

    private removeAndUpdateLineCoords(line: PowerLine, coord: SimplePoint) {
        let hash = PowerNetwork.hashCoordinate(coord);
        let lineReverse = {from: line.to, to: line.from};
        this.lineCoords[hash] = this.lineCoords[hash].filter(function(someLine: PowerLine){
            return !(_.isEqual(someLine, line) || _.isEqual(someLine, lineReverse));
        });
        return this.lineCoords[hash];
    }
}
