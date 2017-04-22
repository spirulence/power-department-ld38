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
        this.adjacency[v1] = this.adjacency[v1].filter((value: number, _index: number, _array:number[]) =>{
            return value !== v2;
        });
        this.adjacency[v2] = this.adjacency[v2].filter((value: number, _index: number, _array:number[]) =>{
            return value !== v1;
        });

        this.recomputeComponents();
    }
}