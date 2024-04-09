export const getTotalVoter = (arr: number[]): number => {
    let voterList: number[] = []
    voterList = arr.filter(function (item) {
        return voterList.includes(item) ? '' : voterList.push(item)
    })
    return voterList.length
}
