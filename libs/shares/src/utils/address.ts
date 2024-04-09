export const compareAddress = (...args: string[]) => {
    let isTheSame = true
    for (let i = 1; i < args.length; i++) {
        if (args[0].toLowerCase() !== args[i].toLowerCase()) {
            isTheSame = false
            break
        }
    }
    return isTheSame
}
