export interface Point{
    x: number,
    y: number
}

export interface PanelDescription{
    panelKey: string

    openPosition: Point
    closedPosition: Point
    animationTime: number

    slots: PIXI.DisplayObject[]
    slotStart: Point
    slotSpacing: Point
}

export class OpenablePanel{
    public group: Phaser.Group;
    public isOpen: boolean;

    private description: PanelDescription;
    private panelImage: Phaser.Image;
    private game: Phaser.Game;

    constructor(description: PanelDescription, game: Phaser.Game){
        this.game = game;
        this.group = game.add.group();
        this.group.position.set(description.closedPosition.x, description.closedPosition.y);
        this.description = description;

        this.panelImage = game.add.image(0, 0, description.panelKey, null, this.group);
        this.panelImage.inputEnabled = true;

        this.isOpen = false;

        this.setupSlots();
    }

    open(){
        let tween = this.game.add.tween(this.group);
        let newX = this.description.openPosition.x;
        let newY = this.description.openPosition.y;
        tween.to({x: newX, y: newY}, this.description.animationTime, Phaser.Easing.Quadratic.InOut);
        tween.start();
        this.isOpen = true;
    }

    close(){
        let tween = this.game.add.tween(this.group);
        let newX = this.description.closedPosition.x;
        let newY = this.description.closedPosition.y;
        tween.to({x: newX, y: newY}, this.description.animationTime, Phaser.Easing.Quadratic.InOut);
        tween.start();
        this.isOpen = false;
    }

    toggle(){
        if(this.isOpen){
            this.close();
        }else{
            this.open();
        }
    }

    private setupSlots() {
        let x = this.description.slotStart.x;
        let y = this.description.slotStart.y;

        for(let slot of this.description.slots){
            this.group.add(slot);
            slot.x = x;
            slot.y = y;

            x += this.description.slotSpacing.x;
            y += this.description.slotSpacing.y;
        }
    }
}
