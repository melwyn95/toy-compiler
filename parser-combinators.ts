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
    constructor(public value: T, public source: Source) { }
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

    static zeroOrMore<U>(parser: Parser<U>): Parser<Array<U>> {
        return new Parser(source => {
            let results: Array<U> = []
            let item: ParseResult<U> | null
            while (item = parser.parse(source)) {
                source = item.source
                results.push(item.value)
            }
            return new ParseResult(results, source)
        })
    }

    static mayBe<U>(parser: Parser<U | null>): Parser<U | null> {
        return parser.or(Parser.constant(null))
    }

    or(parser: Parser<T>): Parser<T> {
        return new Parser(source => {
            let result = this.parse(source)
            if (result) return result
            else return parser.parse(source)
        })
    }

    bind<U>(callback: (value: T) => Parser<U>): Parser<U> {
        return new Parser(source => {
            let result = this.parse(source)
            if (result) {
                let { value, source } = result
                return callback(value).parse(source)
            } else return null
        })
    }

    and<U>(parser: Parser<U>): Parser<U> {
        return this.bind(_ => parser)
    }

    map<U>(callback: (t: T) => U): Parser<U> {
        return this.bind(value => Parser.constant(callback(value)))
    }
}

let source = new Source("hello1 bye2", 0)
let result = Parser.regexp(/hello[0-9]/y).parse(source)
console.log(result)
console.assert(result?.value === "hello1")
console.assert(result?.source.index === 6)

// TODO: read about commit messages feat:, fix:, refactor:, etc.    