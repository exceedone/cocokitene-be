export const dateTimeToEpochTime = (dateTime): number => {
    if (!(dateTime instanceof Date)) {
        throw new Error('Invalid input. Please provide a valid Date object.')
    }

    const epochTime = Math.floor(dateTime.getTime() / 1000)
    return epochTime
}
