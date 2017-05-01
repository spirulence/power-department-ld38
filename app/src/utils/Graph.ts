/*  Graph.ts
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

export class Components{
    private marked: boolean[];
    private componentIds: number[];
    private count: number;

    constructor(graph: Graph){
        this.initialize(graph);
        this.findComponents(graph);
    }

    private initialize(graph: Graph) {
        this.marked = [];
        this.componentIds = [];
        for (let index = 0; index < graph.numberVertices(); index++) {
            this.marked.push(false);
            this.componentIds.push(0);
        }
        this.count = 0;
    }

    private findComponents(graph: Graph) {
        for(let vertex = 0; vertex < graph.numberVertices(); vertex++){
            if(!this.marked[vertex]){
                this.depthFirstSearch(graph, vertex);
                this.count++;
            }
        }
    }

    private depthFirstSearch(graph: Graph, vertex: number) {
        this.marked[vertex] = true;
        this.componentIds[vertex] = this.count;
        for(let peer of graph.adjacent(vertex)){
            if(!this.marked[peer])
                this.depthFirstSearch(graph, peer);
        }
    }

    connected(vertex1: number, vertex2: number){
        return this.component(vertex1) === this.component(vertex2);
    }

    component(vertex: number){
        return this.componentIds[vertex];
    }

    wholeComponent(component: number){
        let wholeComponent: number[] = [];

        for (let vertex = 0; vertex < this.marked.length; vertex++)
            if(this.component(vertex) === component)
                wholeComponent.push(vertex);

        return wholeComponent;
    }

    size(){
        return this.count;
    }
}

export class Graph{
    private adjacency: number[][];

    components: Components;

    constructor(){
        this.adjacency = [];
        this.recomputeComponents();
    }

    addVertex(){
        this.adjacency.push([]);

        this.recomputeComponents();

        return this.adjacency.length - 1;
    }

    addEdge(v1: number, v2: number){
        this.adjacency[v1].push(v2);
        this.adjacency[v2].push(v1);

        this.recomputeComponents();
    }

    numberVertices(){
        return this.adjacency.length;
    }

    private recomputeComponents() {
        this.components = new Components(this);
    }

    adjacent(vertex: number) {
        return this.adjacency[vertex];
    }

    removeEdge(v1: number, v2: number) {
        this.adjacency[v1] = this.adjacency[v1].filter((value: number) =>{
            return value !== v2;
        });
        this.adjacency[v2] = this.adjacency[v2].filter((value: number) =>{
            return value !== v1;
        });

        this.recomputeComponents();
    }
}
