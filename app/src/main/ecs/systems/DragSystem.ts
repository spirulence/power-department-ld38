import {SpriteForEachTileRenderSystem} from "./SpriteForEachTileRenderSystem";
import {Dragging} from "../components/Dragging";

export class DragSystem extends SpriteForEachTileRenderSystem{

    protected renderHook(renderable: any, sprite: Phaser.Sprite) {
        if(!sprite.inputEnabled){
            sprite.inputEnabled = true;
            sprite.input.enableDrag();
            sprite.alpha = 0;
            sprite.events.onDragStart.add(function(sprite: any, pointer: Phaser.Pointer){
                renderable.addComponent(Dragging);
                let dragging: Dragging = renderable.dragging;

                dragging.start = pointer.position.clone();
                dragging.current = pointer.position;

                let dragStop = function(){
                    dragging.current = pointer.position.clone();
                    dragging.ended = true;

                    sprite.events.onDragStop.remove(dragStop);
                };
                sprite.events.onDragStop.add(dragStop);
            })
        }
    }
}