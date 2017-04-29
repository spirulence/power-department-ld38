import {EventedQuantity} from "../mainstate/EventedQuantity";
export class BoundTextLabel{
    group: Phaser.Group;
    constructor(game: Phaser.Game, prepend: string, prependWidth: number, boundTo: EventedQuantity, boundToWidth: number){
        this.group = game.add.group();

        let prependStyle = {font: "15px monospace", fill: "#000", boundsAlignV:"bottom", boundsAlignH:"right"};
        let prependText = game.add.text(0, 0, prepend, prependStyle, this.group);
        prependText.setTextBounds(0, 0, prependWidth, 16);

        let boundToStyle = {font: "15px monospace", fill: "#000", boundsAlignV:"bottom", boundsAlignH:"left"};
        let boundToText = game.add.text(0, 0, boundTo.toString(), boundToStyle, this.group);
        boundToText.setTextBounds(prependWidth+5, 0, boundToWidth, 16);
        boundTo.addCallback(function(){
            boundToText.text = ""+boundTo.toString();
        });
    }
}