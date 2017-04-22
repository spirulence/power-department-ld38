export class GameOver extends Phaser.State {
    private slickUI: any;
    private reason: string;

    init(slickUI: any, reason: string){
        this.slickUI = slickUI;
        this.reason = reason;
    }

    create(){
        this.add.image(0, 0, "game_over");
        this.slickUI.add(new SlickUI.Element.Text(0, 500, this.reason)).centerHorizontally();
    }
}