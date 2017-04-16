import {ContextDialog} from "./ContextDialog";

export const enum PowerTiles {
    Nothing = -1,
    Plant = 5,
    Substation = 6
}

export const enum DialogButtons {
    NewSubstation = 4,
    NewPlant = 2,
    NewTransmissionLine = 6,
    AddDistributionNetwork = 0
}

export interface DialogAction {
    image: number;
    callback: (tile: Phaser.Tile)=>void;
}

export class Dialogs{
    activeDialog: ContextDialog;
    game: Phaser.Game;
    actions: DialogAction[];

    constructor(game: Phaser.Game, actions: DialogAction[]){
        this.game = game;
        this.actions = actions;
    }

    powerTileClicked(tile: Phaser.Tile, pointer: Phaser.Pointer){
        this.closeActiveDialog();
        this.activeDialog = this.createDialog(tile);
        this.activeDialog.setPosition(pointer.position.clone());
    }

    private createDialog(tile: Phaser.Tile): ContextDialog {
        switch (tile.index) {
            case PowerTiles.Substation:
                return this.createNewSubstationDialog(tile);
            default:
                return this.createNewBuildingDialog(tile);
        }
    }

    private closeActiveDialog() {
        if (this.activeDialog != null) {
            this.activeDialog.close();
        }
    }

    private createButton(image: DialogButtons){
        return {hover: image+1, normal: image, onPress: this.findAction(image)}
    }

    private createNewBuildingDialog(tile: Phaser.Tile){
        let buttons = [
            this.createButton(DialogButtons.NewSubstation),
            this.createButton(DialogButtons.NewPlant),
        ];

        return new ContextDialog(buttons, this.game, tile);
    }

    private createNewSubstationDialog(tile: Phaser.Tile){
        let buttons = [
            this.createButton(DialogButtons.AddDistributionNetwork),
            this.createButton(DialogButtons.NewTransmissionLine),
        ];

        return new ContextDialog(buttons, this.game, tile);
    }

    private findAction(image: number) {
        for(let action of this.actions){
            if(action.image == image){
                return action.callback;
            }
        }
        return function(){};
    }
}
