import Entity from "./entity";

export interface IActor {
    name: string;
    mini: Mini;
    size: number;
}
export default class Actor extends Entity {
    name: string;
    mini: Mini;
    size: number;

    constructor({ name, mini, size }: IActor) {
        super();
        this.name = name;
        this.mini = mini
        this.size = size;
    }
}