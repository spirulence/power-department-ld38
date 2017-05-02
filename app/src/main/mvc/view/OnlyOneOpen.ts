import {ToggleTogether} from "./ToggleTogether";

export class OnlyOneOpen{

    constructor(panels: ToggleTogether[]){

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
    }
}