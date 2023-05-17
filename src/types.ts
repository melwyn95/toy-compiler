interface Type {
    equals(other: Type): boolean;
    toString(): string;
}

class BooleanType implements Type {
    equals(other: Type): boolean {
        return other instanceof BooleanType
    }

    toString(): string {
        return "boolean"
    }
}

class NumberType implements Type {
    equals(other: Type): boolean {
        return other instanceof NumberType
    }

    toString(): string {
        return "number"
    }
}

class VoidType implements Type {
    equals(other: Type): boolean {
        return other instanceof VoidType
    }

    toString(): string {
        return "void"
    }
}

class NullType implements Type {
    equals(other: Type): boolean {
        return other instanceof NullType
    }

    toString(): string {
        return "null"
    }
}

class ArrayType implements Type {
    constructor(public element: Type) { }

    equals(other: Type): boolean {
        return other instanceof ArrayType &&
            this.element.equals(other.element)
    }

    toString(): string {
        return `Array<${this.element}>`
    }
}

class FunctionType implements Type {
    constructor(
        public parameters: Map<string, Type>,
        public returnType: Type
    ) { }

    equals(other: Type): boolean {
        if (other instanceof FunctionType) {
            let otherParameterTypes = Array.from(other.parameters.values())
            let thisParameterTypes = Array.from(this.parameters.values())
            return this.parameters.size === other.parameters.size
                && this.returnType.equals(other.returnType)
                && thisParameterTypes.every(
                    (p, i) => p.equals(otherParameterTypes[i]))
        } else {
            return false
        }
    }

    toString(): string {
        let parameters = Array.from(this.parameters).map(
            ([name, type]) => `${name}: ${type}`
        )
        return `(${parameters.join(", ")}) => ${this.returnType}`
    }
}

export {
    Type,
    BooleanType,
    NumberType,
    VoidType,
    NullType,
    ArrayType,
    FunctionType,
}