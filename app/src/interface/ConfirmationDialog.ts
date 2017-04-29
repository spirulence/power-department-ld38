
import {MapTile} from "../mainstate/GameMap";
import {Builder} from "../mainstate/Builders";

export class ConfirmationDialog{
    yes: Phaser.Button;
    no: Phaser.Button;

    constructor(game: Phaser.Game, builder: Builder){
        let alpha = 0.5;

        let yes = game.add.button(100, 100,
            "buttons",
            null, null,
            9, 8, 8, 8
        );
        yes.alpha = alpha;
        yes.visible = false;
        let no = game.add.button(100, 200,
            "buttons",
            null, null,
            11, 10, 10, 10
        );
        no.alpha = alpha;
        no.visible = false;

        let complete = function(){
            builder.completeAffirmative();
            yes.visible = false;
            no.visible = false;
        };
        yes.onInputUp.add(complete);

        let complete2 = function(){
            builder.completeNegative();
            yes.visible = false;
            no.visible = false;
        };
        no.onInputUp.add(complete2, this);

        this.yes = yes;
        this.no = no;
    }

    close(){
        this.yes.visible = false;
        this.no.visible = false;
    }

    setLocation(tile: MapTile) {
        if(!tile.map.extraGroup.contains(this.yes)) {
            tile.map.extraGroup.add(this.yes);
            tile.map.extraGroup.add(this.no);
        }

        this.yes.position = new Phaser.Point(tile.location.x, tile.location.y);
        this.yes.position.multiply(tile.map.tileSize, tile.map.tileSize);
        this.yes.position.y -= 12;
        this.yes.position.x -= 12;
        this.yes.visible = true;

        this.no.position = new Phaser.Point(tile.location.x, tile.location.y);
        this.no.position.multiply(tile.map.tileSize, tile.map.tileSize);
        this.no.position.y -= 12;
        this.no.position.x += 20;
        this.no.visible = true;
    }
}
