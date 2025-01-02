type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

type SerializableConstructor = Function & {
  serializableFields: string[];
};

export function serializable(_: unknown, context: ClassFieldDecoratorContext) {
  const key = context.name.toString();

  return function (this: Entity, value: any) {
    const constructor = this.constructor as SerializableConstructor;

    const hasProperty = Object.prototype.hasOwnProperty.call(
      constructor,
      "serializableKeys"
    );

    if (!hasProperty) {
      Object.defineProperty(constructor, "serializableKeys", {
        value: [],
        writable: true,
      });
    }

    // Add the key to the list of serializable keys
    constructor.serializableFields.push(key);

    return value;
  };
}

export default class Entity {
  id: string = window.crypto.randomUUID();

  static getById(id: string): Entity {
    throw new Error("Method not implemented.");
  }

  serialize() {
    const { serializableFields } = this.constructor as SerializableConstructor;

    if (!serializableFields) {
      return {}; // No serializable fields
    }

    const result: Json = {};

    for (const key of serializableFields) {
      if (this[key] instanceof Entity) {
        result[key] = this[key].id;
      } else {
        result[key] = this[key];
      }
    }
    return result;
  }
}
