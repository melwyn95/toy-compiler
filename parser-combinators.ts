interface Parser<T> {
    parse(source: Source): ParseResult<T> | null
}

class Source {
    constructor(public string: string, public index: number) { }

    match(regexp: RegExp): ParseResult<string> | null {
        console.assert(regexp.sticky)
        regexp.lastIndex = this.index
        let match = this.string.match(regexp)
        if (match) {
            let value = match[0]
            let newIndex = this.index + value.length
            let souce = new Source(this.string, newIndex)
            return new ParseResult(value, souce)
        }
        return null
    }
}

class ParseResult<T> {
    constructor(public value: T, public souce: Source) { }
}

class Parser<T> {
    constructor(public parse: (source: Source) => ParseResult<T> | null) { }

    static regexp(regexp: RegExp): Parser<string> {
        return new Parser(source => source.match(regexp))
    }

    static constant<U>(value: U): Parser<U> {
        return new Parser(souce => new ParseResult(value, souce))
    }

    // TODO: better implementation would be to convert souce.index to
    // line-column pair and display the snippet in souce
    static error<U>(message: string): Parser<U> {
        return new Parser(source => {
            throw Error(message)
        })
    }
}

let souce = new Source("hello1 bye2", 0)
let result = Parser.regexp(/hello[0-9]/y).parse(souce)
console.log(result)
console.assert(result?.value === "hello1")
console.assert(result?.souce.index === 6)