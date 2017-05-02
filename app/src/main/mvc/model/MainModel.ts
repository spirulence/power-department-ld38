import {TerrainLayerModel} from "./TerrainLayerModel";
import {Facilities} from "./Facilities";

export class MainModel{
    terrain: TerrainLayerModel;
    facilities: Facilities;

    constructor(game: Phaser.Game, mapID: string){
        this.terrain = new TerrainLayerModel(game, mapID+"-json");

        this.facilities = new Facilities(this.terrain);
    }
}