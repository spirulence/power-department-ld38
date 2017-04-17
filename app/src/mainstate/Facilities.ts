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

// type SubstationCoverage = SimplePoint[];

//@formatter:off
// let substationCoverageLevels: SubstationCoverage[] = [
//     [
//         {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},
//         {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},
//         {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}
//     ],
//     [
//                       {x:-1, y:2},  {x:0,y:2},  {x:1,y:2},
//         {x:-2, y:1},  {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},  {x:2, y:1},
//         {x:-2, y:0},  {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},  {x:2, y:0},
//         {x:-2, y:-1}, {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}, {x:2, y:-1},
//                       {x:-1, y:-2}, {x:0,y:-2}, {x:1,y:-2},
//     ],
//     [
//                                                   {x:0,y:3},
//                                     {x:-1, y:2},  {x:0,y:2},  {x:1,y:2},
//                       {x:-2, y:1},  {x:-1, y:1},  {x:0,y:1},  {x:1,y:1},  {x:2, y:1},
//         {x:-3, y:0},  {x:-2, y:0},  {x:-1, y:0},  {x:0,y:0},  {x:1,y:0},  {x:2, y:0}, {x:3, y:0},
//                       {x:-2, y:-1}, {x:-1, y:-1}, {x:0,y:-1}, {x:1,y:-1}, {x:2, y:-1},
//                                     {x:-1, y:-2}, {x:0,y:-2}, {x:1,y:-2},
//                                                   {x:0,y:-3}
//     ]
// ];
//@formatter:on

class PowerNetwork {
    private graph: Graph;

    private coordToVertex: { [id: string]: FacilityVertex } = {};

    constructor() {
        this.graph = new Graph();
        this.coordToVertex = {};
    }

    addSubstation(coord: SimplePoint) {
        let vertex = this.graph.addVertex();
        this.coordToVertex[PowerNetwork.hashCoord(coord)] = {vertex: vertex, facilityType: "substation"};
    }

    addPlant(coord: SimplePoint) {
        let vertex = this.graph.addVertex();
        this.coordToVertex[PowerNetwork.hashCoord(coord)] = {vertex: vertex, facilityType: "plant"};
    }

    addLine(source: SimplePoint, destination: SimplePoint) {
        let sourceVertex = this.coordToVertex[PowerNetwork.hashCoord(source)];
        let destinationVertex = this.coordToVertex[PowerNetwork.hashCoord(destination)];
        this.graph.addEdge(sourceVertex.vertex, destinationVertex.vertex);
    }

    private static hashCoord(coord: SimplePoint) {
        return coord.x.toString() + "-" + coord.y.toString();
    }

    at(coord: SimplePoint) {
        let result = this.coordToVertex[PowerNetwork.hashCoord(coord)];
        if (result != null) {
            return this.coordToVertex[PowerNetwork.hashCoord(coord)].facilityType;
        } else {
            return "";
        }
    }
}


export class Facilities {
    private map: Phaser.Tilemap;
    private inventory: Inventory;
    private powerNetwork: PowerNetwork;

    constructor(map: Phaser.Tilemap) {
        this.map = map;
        this.powerNetwork = new PowerNetwork();
    }

    addSubstation(baseTile: Phaser.Tile) {
        let location = {x: baseTile.x, y: baseTile.y};
        let facilityAtTile = this.powerNetwork.at(location) === "substation";
        if (this.inventory.enoughDollars(2) && !facilityAtTile) {
            this.map.putTile(6, baseTile.x, baseTile.y, "power");
            this.inventory.deductDollars(2);
            this.powerNetwork.addSubstation(location);
        }
    }

    addPlant(baseTile: Phaser.Tile) {
        let location = {x: baseTile.x, y: baseTile.y};
        let facilityAtTile = this.powerNetwork.at(location) === "plant";
        if (this.inventory.enoughDollars(5) && !facilityAtTile) {
            this.map.putTile(5, baseTile.x, baseTile.y, "power");
            this.inventory.deductDollars(5);
            this.powerNetwork.addPlant(location);
        }
    }

    addLine(source: Phaser.Tile, destination: Phaser.Tile) {
        let sourceCoord = {x: source.x, y: source.y};
        let destinationCoord = {x: destination.x, y: destination.y};
        this.powerNetwork.addLine(sourceCoord, destinationCoord);
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
}
