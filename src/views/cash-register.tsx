import React, {useEffect, useState} from "react";
import axios from "axios";
import {Article} from "../types/article";
import {Transaction} from "../types/transaction";
import {CashRegister as Register} from "../types/cash-register";
import {toast} from "bulma-toast";
import {useTranslation} from "react-i18next";
import {Icon} from "@iconify/react";


export default function CashRegister() {
    /*
    get some hooks
     */
    const {t} = useTranslation()
    /*
    define some constants which manage the state of the register page
     */
    const [callingAPI, setCallingAPI] = useState(true);
    const [cashRegisters, setCashRegisters] = useState<Register[]>([]);
    const [loadedRegisters, setLoadedRegisters] = useState(false);
    const [currentRegister, setCurrentRegister] = useState("");
    const [articles, setArticles] = useState<Article[]>([]);
    const [loadedArticles, setLoadedArticles] = useState(false);
    const [billItems, setBillItems] = useState<Article[]>([]);
    const [billTotal, setBillTotal] = useState(0.00);

    /*
    now write some functions to pull data from the server
     */

    /**
     * This function pulls all available articles from the database
     */
    function pullArticles() {
        setCallingAPI(true)
        if (!loadedArticles) {
            axios
                .get(`/api/items`)
                .then(response => {
                    switch (response.status) {
                        case 200:
                            let articles: Article[] = response.data
                            setArticles(articles)
                            break
                        case 204:
                            console.warn("no items setup on server")
                            toast({
                                message: t(`cash-register.errors.no-items`),
                                type: "is-warning",
                                position: "center",
                                dismissible: true,
                                single: true,
                                closeOnClick: true,
                                animate: {
                                    in: 'fadeIn',
                                    out: 'fadeOut'
                                }
                            })
                            break
                        default:
                            console.error("unexpected response code received", response)
                            toast({
                                message: t(`cash-register.errors.unexpected-response`),
                                type: "is-warning",
                                position: "center",
                                dismissible: true,
                                single: true,
                                closeOnClick: true,
                                animate: {
                                    in: 'fadeIn',
                                    out: 'fadeOut'
                                }
                            })
                    }
                })
                .catch(error => {
                    console.error(error)
                    toast({
                        message: t(`cash-register.errors.general`),
                        type: "is-danger",
                        position: "center",
                        dismissible: true,
                        single: true,
                        closeOnClick: true,
                        animate: {
                            in: 'fadeIn',
                            out: 'fadeOut'
                        }
                    })
                })
                .finally(() => {
                    setCallingAPI(false)
                    setLoadedArticles(true)
                })
        }

    }

    function pullRegisters() {
        setCallingAPI(true)
        if (!loadedRegisters) {
            axios
                .get(`/api/registers`)
                .then(response => {
                    switch (response.status) {
                        case 200:
                            let registers: Register[] = response.data
                            setCashRegisters(registers)
                            break
                        case 204:
                            console.warn("no items setup on server")
                            toast({
                                message: t(`cash-register.errors.no-items`),
                                type: "is-warning",
                                position: "center",
                                dismissible: true,
                                single: true,
                                closeOnClick: true,
                                animate: {
                                    in: 'fadeIn',
                                    out: 'fadeOut'
                                }
                            })
                            break
                        default:
                            console.error("unexpected response code received", response)
                            toast({
                                message: t(`cash-register.errors.unexpected-response`),
                                type: "is-warning",
                                position: "center",
                                dismissible: true,
                                single: true,
                                closeOnClick: true,
                                animate: {
                                    in: 'fadeIn',
                                    out: 'fadeOut'
                                }
                            })
                    }
                })
                .catch(error => {
                    console.error(error)
                    toast({
                        message: t(`cash-register.errors.general`),
                        type: "is-danger",
                        position: "center",
                        dismissible: true,
                        single: true,
                        closeOnClick: true,
                        animate: {
                            in: 'fadeIn',
                            out: 'fadeOut'
                        }
                    })
                })
                .finally(() => {
                    setCallingAPI(false)
                    setLoadedRegisters(true)
                })
        }

    }

    useEffect(() => {
        if (!loadedArticles) {
            pullArticles()

        }
        if (!loadedRegisters) {
            pullRegisters()

        }
    })

    function addItemToBill(article: Article) {
        let i = billItems.slice()
        i.push(article)
        setBillItems(i)
    }

    function removeItemFromBill(idx: number) {
        if (!billItems) {
            console.warn("unable to delete item from empty bill")
            return
        }
        let i = billItems.slice()
        i.splice(idx, 1)
        setBillItems(i)
        toast({
            message: t(`cash-register.bill.item-removed`),
            type: "is-info",
            position: "center",
            dismissible: false,
            single: true,
            closeOnClick: true,
            duration: 750,
            animate: {
                in: 'fadeIn',
                out: 'fadeOut'
            }
        })
    }

    function getBillTotal(): number {
        let sum = 0.00
        billItems.forEach(({price}) => {
            sum += price
        })
        return sum
    }

    function processTransaction() {
        if (!billItems || !billItems.length) {
            console.warn("unable to process empty bill")
            return
        }
        setCallingAPI(true)
        // build some article statistics
        let stats = new Map<Article, { name: string, count: number }>()
        billItems.forEach((billItem, idx, billItems) => {
            stats.set(billItem, {
                name: billItem.name,
                count: (billItems.filter((article) => article.id === billItem.id)).length
            })
        })
        // build a description string
        let description = "";
        stats.forEach(({name, count}, article) => {
            description += `${count}x ${name} à ${article.price.toFixed(2)} €\n`
        })
        // now calculate the bill amount once
        let billAmount: number = 0.00
        stats.forEach(({name, count}, article) => {
            billAmount += count * article.price
        })
        // now build the transaction
        let t: Transaction = {
            amount: billAmount,
            at: new Date().toISOString(),
            title: "Verkauf",
            description: description,
            register: currentRegister
        }
        // now send the transaction to the backend
        axios
            .post("/api/transactions", t)
            .then((res) => {
                switch (res.status) {
                    case 200:
                    case 201:
                        toast({
                            message: 'Transaktion gespeichert',
                            type: 'is-success',
                            dismissible: false,
                            position: "center",
                            animate: {in: 'fadeIn', out: 'fadeOut'},
                        })
                        break
                }
            })
            .finally(() => {
                setCallingAPI(false)
                setBillItems([])
            })
    }

    function updateRegister(event: React.ChangeEvent<HTMLSelectElement>) {
        let selectedRegister = event.target.value
        setCurrentRegister(selectedRegister)
    }

    return (
        <div>
            <div className={"mt-1 px-1"}>
                <div className={"buttons is-centered has-addons mb-1"}>
                    <button className={`button is-rounded is-link ${callingAPI ? 'is-loading' : ''}`}
                            style={{width: '49%'}}
                            disabled>
                        Reservierungen (Work In Progress)
                    </button>
                    <button className={`button is-rounded is-link ${callingAPI ? 'is-loading' : ''}`}
                            style={{width: '49%'}}
                            disabled>
                        Statistiken (Work In Progress)
                    </button>
                </div>
                {/* Now render the selection menu for the current register*/}
                <div className={"select is-rounded is-fullwidth"}>
                    <select required onChange={(event) => updateRegister(event)}>
                        <option disabled selected>{t(`cash-register.select-register`)}</option>
                        {cashRegisters.map(({id, name, description}) => {
                            return <option value={id}>{name} - {description}</option>;
                        })}
                    </select>
                </div>
                {/* Now render the article list/buttons*/}
                <h1 className={"title my-2 is-size-4 has-text-centered"}>
                    {t(`cash-register.articles`)}
                </h1>
                <div className={"buttons is-centered mt-0"}>
                    {
                        articles.map((article) => {
                            let {name, icon} = article
                            return (
                                <button className={"button is-info is-fullheight is-5 has-text-centered"}
                                        onClick={() => addItemToBill(article)}
                                        disabled={currentRegister === ""}>
                                    <span className={"icon-text is-align-items-center"}>
                                        <span className={"icon"}>
                                            <Icon icon={icon} height={64}></Icon>
                                        </span>
                                        <span>{name}</span>
                                    </span>
                                </button>
                            );
                        })
                    }
                </div>
                <div>
                    <h2 className={"subtitle is-size-4 has-text-centered my-1"}>
                        {t(`cash-register.bill.title`)}
                    </h2>
                    <h3 className={"heading is-size-5 has-text-centered my-1"}>
                        {t(`cash-register.bill.total`)}: {getBillTotal().toFixed(2)} €
                    </h3>
                    <div className={"buttons is-centered has-addons"}>
                        <button className={`button is-success is-rounded ${callingAPI ? 'is-loading' : ''}`}
                                disabled={currentRegister === ""}
                                style={{width: "49%"}}
                                onClick={() => processTransaction()}>
                            {t(`cash-register.bill.paid`)}
                        </button>
                        <button className={`button is-warning is-rounded ${callingAPI ? 'is-loading' : ''}`}
                                disabled={currentRegister === ""}
                                style={{width: "49%"}}
                                onClick={() => setBillItems([])}>
                            {t(`cash-register.bill.clear`)}
                        </button>
                    </div>
                    <div style={{overflowX: "hidden", overflowY: "auto"}}>
                        {
                            billItems.map(({name, price, icon}, idx) => {
                                return (
                                    <div className={"columns is-mobile is-gapless is-multiline my-2"}>
                                        <div className={"column is-2 is-align-content-center has-text-centered"}>
                                            <Icon width={48} icon={icon}></Icon>
                                        </div>
                                        <div className={"column is-8 is-6-mobile is-align-items-center"}>
                                            <p className={"is-align-self-center"}>
                                                <span className={"title is-size-5"}>{name}</span><br/>
                                                <span className={"heading is-size-6"}>{price.toFixed(2)} €</span>
                                            </p>
                                        </div>
                                        <div className={"column is-1 ml-2 is-align-content-center has-text-centered"}>
                                            <button className={"button is-fullheight is-danger is-rounded"}
                                                    onClick={() => removeItemFromBill(idx)}>
                                                <Icon height={36} icon={"iwwa:delete"}></Icon>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}