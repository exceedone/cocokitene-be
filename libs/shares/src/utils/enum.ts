export const enumToArray = (enumObject) => {
    const array = []
    for (const key in enumObject) {
        array.push(enumObject[key])
    }
    return array
}

export function enumize<K extends string>(...args: K[]): { [P in K]: P } {
    const ret = {} as { [P in K]: P }
    args.forEach((k) => (ret[k] = k))
    return ret
}
