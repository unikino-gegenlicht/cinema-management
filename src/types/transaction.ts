import {Article} from "./article";

export type Transaction = {
    ID: string,
    at: string,
    amount: number,
    title: string,
    description: string,
    register: string,
    items?: string[],
    customItems?: Article[],
    paymentType?: "cash" | "card"
    externalPaymentID?: string
}