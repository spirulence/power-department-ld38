import {ToggleTogether} from "./ToggleTogether";

export class OnlyOneOpen{
    onAllClosed: Phaser.Signal;
    private panels: ToggleTogether[];

    constructor(panels: ToggleTogether[]){
        this.panels = panels;

        function closeAllBut(dontClose: ToggleTogether){
            for(let panel of panels){
                if(panel !== dontClose){
                    panel.close();
                }
            }
        }

        for(let panel of panels){
            panel.onOpen.add(closeAllBut);
        }

        let onAllClosed = new Phaser.Signal();

        //fire all closed if all panels are closed at the end of closing one of them
        for(let panel of panels){
            panel.onClose.add(function(this: OnlyOneOpen){
                let allClosed = true;
                for(let panel2 of panels){
                    if(panel2.isOpen()){
                        allClosed = false;
                    }
                }
                if(allClosed){
                    onAllClosed.dispatch(this);
                }
            },this);
        }

        this.onAllClosed = onAllClosed;
    }

    closeAll(){
        for(let panel of this.panels){
            panel.close();
        }
    }
}