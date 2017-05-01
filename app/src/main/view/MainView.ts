import {MainModel} from "../model/MainModel";
import {TileMapView} from "./TileMapView";
import {MainUI} from "./MainUI";

export class MainView{
    private model: MainModel;
    private map: TileMapView;
    private ui: MainUI;

    constructor(game: Phaser.Game, model: MainModel){
        this.model = model;

        this.map = new TileMapView(game, "map1");
        this.ui = new MainUI(game);
    }


}