export const baseUrlFe = (
    port: number,
    ipAddress: string,
    language?: string,
): string => {
    return `http://${ipAddress}:${port}/${language}`
}
