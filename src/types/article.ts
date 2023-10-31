export type Article = {
    // ID contains the object id of the item used in the MongoDB in the backend
    id: string,

    // Name contains the name of the article
    name: string,
    price: number,
    icon: string,
    isLocal?: boolean
}