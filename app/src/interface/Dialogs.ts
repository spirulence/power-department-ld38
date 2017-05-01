/*  Dialogs.ts
 *  Copyright (C) 2017 Cameron B Seebach
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import {ContextDialog} from "./ContextDialog";
import {FacilityTypes} from "../mainstate/Facilities";
import {MapTile} from "../mainstate/GameMap";


export const enum DialogButtons {
    NewTransmissionLine = 0,
    NewPlant = 2,
    NewSubstation = 4,
    AddDistributionNetwork = 6
}

export type TileAction = (tile: MapTile)=>void;

export interface DialogAction {
    image: number;
    callback: TileAction;
}

export class Dialogs{
    activeDialog: ContextDialog;
    game: Phaser.Game;
    actions: DialogAction[];

    constructor(game: Phaser.Game){
        this.game = game;
        this.actions = [];
    }

    addAction(button: DialogButtons, action: TileAction){
        this.actions.push({image: button, callback: action});
    }

    powerTileClicked(tile: MapTile, pointer: {x:number, y:number}){
        this.closeActiveDialog();
        this.activeDialog = this.createDialog(tile);
        if(this.activeDialog != null){
            this.activeDialog.setPosition(new Phaser.Point(pointer.x, pointer.y));
        }
    }

    private createDialog(tile: MapTile): ContextDialog {
        switch (tile.facility) {
            case FacilityTypes.Substation:
                return this.createNewSubstationDialog(tile);
            case FacilityTypes.Nothing:
                return this.createNewBuildingDialog(tile);
            default:
                return null;
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

    private createNewBuildingDialog(tile: MapTile){
        let buttons = [
            this.createButton(DialogButtons.NewSubstation),
            this.createButton(DialogButtons.NewPlant),
        ];

        return new ContextDialog(buttons, this.game, tile);
    }

    private createNewSubstationDialog(tile: MapTile){
        let buttons = [
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
