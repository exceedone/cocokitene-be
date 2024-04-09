export const groupObject = (arrayOfObjects, groupSize) => {
    const result = []

    for (let i = 0; i < arrayOfObjects.length; i += groupSize) {
        result.push(arrayOfObjects.slice(i, i + groupSize))
    }

    return result
}
