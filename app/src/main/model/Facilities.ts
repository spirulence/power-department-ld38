import {Network} from "./Network";
import {TerrainLayerModel} from "./TerrainLayerModel";
import {Events} from "../Events";

export interface SimplePoint{
    x: number
    y: number
}

export class Line{
    source: SimplePoint;
    destination: SimplePoint;

    constructor(source: SimplePoint, destination: SimplePoint){
        this.source = source;
        this.destination = destination;
    }
}

export class Substation{
    location: SimplePoint;

    constructor(location: SimplePoint){
        this.location = location;
    }
}

export class Plant{
    location: SimplePoint;

    constructor(location: SimplePoint){
        this.location = location;
    }
}

export class Facilities{
    network: Network;

    lines: Line[];
    substations: Substation[];
    plants: Plant[];

    private terrain: TerrainLayerModel;

    constructor(terrain: TerrainLayerModel){
        this.network = new Network();
        this.terrain = terrain;

        this.lines = [];
        this.substations = [];
        this.plants = [];
    }

    // addLine(line: Line){
    //
    // }
    //
    // disableLine(line: Line){
    //
    // }

    addSubstation(substation: Substation){
        this.substations.push(substation);
        Events.substationAdded.post(substation);
    }

    addPlant(plant: Plant){
        this.plants.push(plant);
        Events.plantAdded.post(plant);
    }
}