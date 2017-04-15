import {Button, ContextDialog} from "../interface/ContextDialog";

export class Main extends Phaser.State {
    map: Phaser.Tilemap;

    create() {
        this.setupMap();
    }

    setupMap() {
        this.map = this.add.tilemap("map1");
        this.map.addTilesetImage("tileset", "tileset");

        let baseLayer = this.map.createLayer("base");
        baseLayer.resizeWorld();
        baseLayer.inputEnabled = true;
        baseLayer.events.onInputDown.add(this.clickBaseLayer.bind(this));

        this.map.createBlankLayer("power", 125, 75, 8, 8);
        this.map.createBlankLayer("temporary", 125, 75, 8, 8);
    }

    clickBaseLayer(mapLayer: Phaser.TilemapLayer, pointer: Phaser.Pointer){
        let powerTile = this.map.getTileWorldXY(
            pointer.position.x, pointer.position.y,
            undefined, undefined, "power", true);

        if (powerTile.index === -1){
            //no power structure at that tile
            this.createNewBuildingDialog(pointer.position.clone());
            console.log("popping up dialog");
        }else{
            console.log("not popping up dialog");
        }

        // else if powerTile.index is 6
        //   #substation at that tile
        // @interface.activeContextDialog = @interface.substationContextDialog
        // else if powerTile.index is 5
        //   #plant at that tile
        // @interface.activeContextDialog = @interface.plantContextDialog
    }

    createNewBuildingDialog(position: Phaser.Point){
        let empty = function(){console.log("clicked a button!")};
        let buttons = [
            {hover: 5, normal: 4, onPress: empty},
            {hover: 3, normal: 2, onPress: empty}
        ];
        new ContextDialog(position, buttons, this.game);
    }

    update() {

    }
}
