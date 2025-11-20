class EngineObject {
    static _nextId = 0;

    constructor(name = 'Object') {
        this.id = EngineObject._nextId++;
        this.name = name;
    }

    toString() {
        return `${this.name} (${this.id})`;
    }
}
