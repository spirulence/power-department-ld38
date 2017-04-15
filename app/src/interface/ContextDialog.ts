export interface Button{
    normal: number;
    hover: number;
    onPress: ()=>void;
}

export class ContextDialog{
    private group: Phaser.Group;

    constructor(position: Phaser.Point, buttons: Array<Button>, game: Phaser.Game){
        this.group = game.add.group(undefined, "contextDialog", true);
        game.world.bringToTop(this.group);
        this.group.position = position;


        this.addButtons(buttons, game);
    }

    addButtons(buttons: Array<Button>, game: Phaser.Game){
        let x = (buttons.length / 2) * -32;
        let y = -32/2;

        let group = this.group;

        for (let button of buttons){
            let closeAndFire = function(){
                group.removeAll(true);
                game.world.remove(group, true);
                button.onPress();
            };
            game.add.button(x, y,
                "buttons", closeAndFire, undefined,
                button.hover, button.normal, button.normal, button.normal,
                this.group);
            x = 32 + x;
        }
    }


}
