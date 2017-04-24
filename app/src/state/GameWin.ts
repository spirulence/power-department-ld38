export class GameWin extends Phaser.State {
    private slickUI: any;
    private nextCutscene: string;

    init(slickUI: any, nextCutscene: string){
        this.slickUI = slickUI;
        this.nextCutscene = nextCutscene;
    }

    create(){
        this.add.image(0, 0, "you_win");
        let cutscene = this.nextCutscene;
        setTimeout(function(){
            window.open(cutscene, "_self", "", false);
        }, 5000);
    }
}