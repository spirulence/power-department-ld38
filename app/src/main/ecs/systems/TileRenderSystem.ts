import {System} from "./System";
import {EntityManager} from "tiny-ecs";
import {TileRender} from "../components/TileRender";
import {TilePosition} from "../components/TilePosition";
import {Built} from "../components/Built";
import {Dragging} from "../components/Dragging";

export class TileRenderSystem implements System{
    private game: Phaser.Game;
    private sprites: Phaser.Sprite[];
    private group: Phaser.Group;
    public dragSprites: Phaser.Sprite[];

    constructor(game: Phaser.Game){
        this.game = game;
        this.sprites = [];
        this.group = game.add.group();
    }

    process(entities: EntityManager): void {
        let allSpeculative = entities.queryComponents([Built, TileRender, TilePosition]);

        while(allSpeculative.length * 2 > this.sprites.length){
            this.sprites.push(this.game.add.sprite(-100, -100, "overlay-tiles"));
        }

        if(allSpeculative.length * 2 < this.sprites.length){
            for(let sprite of this.sprites){
                sprite.position.set(-1000, -1000);
            }
        }

        let index = 0;
        for(let speculative of allSpeculative){
            let position = speculative.tilePosition;

            let regularSprite = this.sprites[index];
            regularSprite.x = position.x * 8;
            regularSprite.y = position.y * 8;
            regularSprite.frame = speculative.tileRender.tile;
            index++;

            let dragSprite = this.sprites[index];
            if(!dragSprite.inputEnabled){
                dragSprite.inputEnabled = true;
                dragSprite.frame = 8;
                dragSprite.input.enableDrag();
                dragSprite.alpha = 0.0;
                dragSprite.events.onDragStart.add(function(sprite: any, pointer: Phaser.Pointer){
                    let entity = entities.createEntity().addComponent(Dragging);
                    entity.dragging.start = pointer.position.clone();
                    entity.dragging.current = pointer.position;
                    let dragStop = function(){
                        entity.dragging.ended = true;
                        sprite.events.onDragStop.remove(dragStop);
                    };
                    sprite.events.onDragStop.add(dragStop);
                })
            }
            if(!dragSprite.input.isDragged) {
                dragSprite.x = position.x * 8;
                dragSprite.y = position.y * 8;
            }
            index++;
        }
    }

}