export type Transaction = {
    ID?: string,
    at: string,
    amount: number,
    title: string,
    description: string,
    register: string,
    items?: string[]
}