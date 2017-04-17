import {Inventory} from "./Inventory";
import {Graph} from "../utils/Graph";

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

export interface SubNetwork {
    substations: SimplePoint[];
    plants: SimplePoint[];
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

    private static hashCoordinate(coordinate: SimplePoint) {
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

        let result: SubNetwork = {substations: [], plants: []};
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
    private inventory: Inventory;
    private notifiers: FacilitiesNotifier[];

    powerNetwork: PowerNetwork;


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

    addLine(source: Phaser.Tile, destination: Phaser.Tile) {
        let sourceCoord = {x: source.x, y: source.y};
        let destinationCoord = {x: destination.x, y: destination.y};
        this.powerNetwork.addLine(sourceCoord, destinationCoord);
        this.notify();
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

    coverageArea(substation: SimplePoint){
        let coverage: SimplePoint[] = [];

        let coverageLevel = SUBSTATION_LEVELS[0];
        for (let offset of coverageLevel) {
            let covered: SimplePoint = {x: offset.x + substation.x, y: offset.y + substation.y};
            coverage.push(covered);
        }

        return coverage;
    }
}
