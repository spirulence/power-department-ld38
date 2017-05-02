/*  definitions.d.ts
 *  Copyright (C) 2017 Cameron B Seebach
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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

