/// <reference path="../../../node_modules/phaser-ce/typescript/phaser.comments.d.ts"/>

declare namespace SlickUI{
    class Container{
        displayGroup: Phaser.Group;
    }
    class Element {
        events: Phaser.Events;
        container: SlickUI.Container;
        visible: boolean;

        constructor(x: number, y:number, width: number, height: number);

        add<T extends Element>(element: T): T;
    }
    namespace Element{
        export class Panel extends Element{

        }
        export class Button extends Element{

        }
        export class Text extends Element{
            value: string;
            constructor(x: number, y: number, text: string);
            center(): void;
            centerHorizontally(): void;
        }
    }
}

declare namespace Phaser{
    namespace Plugin{
        export class SlickUI extends Phaser.Plugin{
            load(theme: string): void;
        }
    }
}

declare module "tiny-ecs"{
    class EntityManager{
        create(): any;

        createEntity(): any;

        queryComponents(list: any[]): any[];
    }


}

