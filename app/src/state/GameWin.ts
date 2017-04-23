export class GameWin extends Phaser.State {
    private slickUI: any;

    init(slickUI: any){
        this.slickUI = slickUI;
    }

    create(){
        this.add.image(0, 0, "you_win");
    }
}