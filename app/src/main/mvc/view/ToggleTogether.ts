import {OpenablePanel} from "./OpenablePanel";
export class ToggleTogether{
    toggler: Phaser.Button;

    panel1: OpenablePanel;
    panel2: OpenablePanel;

    onOpen: Phaser.Signal;
    onClose: Phaser.Signal;

    constructor(panel1: OpenablePanel, panel2: OpenablePanel, toggler: Phaser.Button){
        this.onOpen = new Phaser.Signal();
        this.onClose = new Phaser.Signal();

        this.panel1 = panel1;
        this.panel2 = panel2;

        toggler.events.onInputUp.add(function (this: ToggleTogether) {
            if(!this.isOpen()){
                this.onOpen.dispatch(this);
            }else {
                this.onClose.dispatch(this);
            }
            this.toggle();
        }, this);

        this.toggler = toggler;
    }

    isOpen(){
        return this.panel1.isOpen;
    }

    toggle(){
        this.panel1.toggle();
        this.panel2.toggle();
    }

    close(){
        if(this.isOpen()){
            this.onClose.dispatch(this);
        }
        this.panel1.close();
        this.panel2.close();
    }
}