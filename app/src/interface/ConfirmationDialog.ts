
import {MapTile} from "../mainstate/GameMap";
import {Builder} from "../mainstate/Builders";

export class ConfirmationDialog{
    private yes: Phaser.Button;
    private no: Phaser.Button;
    private game: Phaser.Game;
    private alpha: number;
    private builder: Builder;

    constructor(game: Phaser.Game, builder: Builder){
        this.alpha = 0.5;
        this.builder = builder;

        let yes = game.add.button(100, 100,
            "buttons",
            null, null,
            9, 8, 8, 8
        );
        yes.visible = false;
        let no = game.add.button(100, 200,
            "buttons",
            null, null,
            11, 10, 10, 10
        );
        no.visible = false;

        this.yes = yes;
        this.no = no;

        this.game = game;
    }

    private completeYes(){
        this.builder.completeYes();
        this.close();
        this.removeCallbacks();
    }

    private completeNo(){
        this.builder.completeNo();
        this.close();
        this.removeCallbacks();
    }

    close(){
        this.game.add.tween(this.yes).to({alpha:0}, 100, Phaser.Easing.Quadratic.InOut, true);
        this.game.add.tween(this.yes.position).to({
            x: this.yes.position.x - 12,
        }, 100, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function(this: ConfirmationDialog){
            this.yes.visible = false;
        }, this);

        this.game.add.tween(this.no).to({alpha:0}, 100, Phaser.Easing.Quadratic.InOut, true);
        this.game.add.tween(this.no.position).to({
            x: this.no.position.x - 32,
        }, 100, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function(this: ConfirmationDialog){
            this.no.visible = false;
        }, this);
    }

    setLocation(tile: MapTile) {
        if(!tile.map.extraGroup.contains(this.yes)) {
            tile.map.extraGroup.add(this.yes);
            tile.map.extraGroup.add(this.no);
        }

        this.yes.position = new Phaser.Point(tile.location.x, tile.location.y);
        this.yes.position.multiply(tile.map.tileSize, tile.map.tileSize);
        this.yes.position.x -= 24;
        this.yes.position.y -= 12;
        this.yes.alpha = 0;
        this.yes.visible = true;

        this.game.add.tween(this.yes).to({alpha:this.alpha}, 100, Phaser.Easing.Quadratic.InOut, true);
        this.game.add.tween(this.yes.position).to({
            x: this.yes.position.x + 12,
        }, 100, Phaser.Easing.Quadratic.InOut, true).onComplete.add(this.addCallbacks, this);

        this.no.position = new Phaser.Point(tile.location.x, tile.location.y);
        this.no.position.multiply(tile.map.tileSize, tile.map.tileSize);
        this.no.position.x -= 12;
        this.no.position.y -= 12;
        this.no.alpha = 0;
        this.no.visible = true;

        this.game.add.tween(this.no).to({alpha:this.alpha}, 100, Phaser.Easing.Quadratic.InOut, true);
        this.game.add.tween(this.no.position).to({
            x: this.no.position.x + 32,
        }, 100, Phaser.Easing.Quadratic.InOut, true);
    }

    private removeCallbacks() {
        this.yes.events.onInputUp.remove(this.completeYes, this);
        this.no.events.onInputUp.remove(this.completeNo, this);
    }

    private addCallbacks() {
        this.yes.events.onInputUp.add(this.completeYes, this);
        this.no.events.onInputUp.add(this.completeNo, this);
    }
}
