import React, {useEffect, useRef, useState} from "react";
import {useSearchParams} from "react-router-dom";
import axios from "axios";
import {Article} from "../types/article";
import {Transaction} from "../types/transaction";
import {CashRegister as Register} from "../types/cash-register";
import {toast} from "bulma-toast";
import {useTranslation} from "react-i18next";
import {Icon} from "@iconify/react";
import validator from "validator";


export default function CashRegister() {
    /*
    create some variables used for accessing the SumUp App
     */
    let sumUpAffiliateKey = process.env.REACT_APP_SUMUP_AFFILIATE_KEY
    let sumUpAppID = process.env.REACT_APP_SUMUP_APP_ID
    /*
    access some hooks that are used on this page
     */
    // this hook is used to access the translations
    const {t} = useTranslation();
    // this hook is used to read the query parameters of the page to allow
    // reading the result of card payments
    const [queryParameters, setQueryParameters] = useSearchParams();

    /*
    now define some state variables which are needed for the page to work
     */
    // this state allows keeping track of active api calls
    const [accessingAPI, setAccessingAPI] = useState(false);
    // this state stores the cash registers that are available for making transactions in
    const [registers, setRegisters] = useState<Register[] | undefined>(undefined);
    // this state stores the currently active register
    const [currentRegister, setCurrentRegister] = useState<Register | undefined>(undefined);
    // this states store all articles
    const [articles, setArticles] = useState<Article[] | undefined>(undefined);
    const [localArticles, setLocalArticles] = useState<Article[] | undefined>(undefined);
    // this state stores all current items that are listed on the bill
    const [billItems, setBillItems] = useState<Article[]>([]);
    // this state stores the current bill ID which is used to identify the bill in card payments
    const [billID, setBillID] = useState<string | undefined>(undefined);
    // this state stores the current bill amount
    const [billAmount, setBillAmount] = useState(0.00);
    // this state stores if the error modal of the page shall be enabled or not
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorModalContent, setErrorModalContent] = useState<JSX.Element>();
    const cardPaymentButton = useRef<HTMLAnchorElement>(null);

    /*
    now use React effects to pull some data from the server
     */

    /**
     * This effect loads the available registers from the server
     */
    useEffect(() => {
        // now access the api and load the registers from the server if they are still undefined
        if (registers === undefined) {
            setAccessingAPI(true)
            axios
                .get("/api/registers")
                .then((response) => {
                    // now check the response code of the server
                    switch (response.status) {
                        case 200:
                            // the request returned a list of registers
                            setRegisters(response.data)
                            break
                        case 204:
                            // the server has no registers configured. create a warning message
                            console.warn("no registers found on backend")
                            toast({
                                message: t("cash-register.errors.no-registers"),
                                type: "is-danger",
                                position: "center",
                                dismissible: true,
                                single: true,
                                closeOnClick: true,
                                duration: 5000,
                                animate: {
                                    in: 'fadeIn',
                                    out: 'fadeOut'
                                }
                            })
                            break
                        default:
                            // the server responded with an unexpected response code
                            console.error("unexpected response code received while pulling registers")
                            toast({
                                message: t("errors.unexpected-response-code"),
                                type: "is-danger",
                                position: "center",
                                dismissible: false,
                                single: true,
                                closeOnClick: false,
                                duration: 5000,
                                animate: {
                                    in: 'fadeIn',
                                    out: 'fadeOut'
                                }
                            })
                    }
                })
                .catch((reason) => {
                    console.error("failed to get registers from server", reason)
                    toast({
                        message: t("errors.request-failure") + `<br>${reason.message}`,
                        type: "is-danger",
                        position: "center",
                        dismissible: false,
                        single: true,
                        closeOnClick: false,
                        duration: 5000,
                        animate: {
                            in: 'fadeIn',
                            out: 'fadeOut'
                        }
                    })
                })
                .finally(() => {
                    setAccessingAPI(false)
                })
        }
    }, [setRegisters]);

    /**
     * This effect loads the available articles from the server
     */
    useEffect(() => {
        // now access the api and load the registers from the server if they are still undefined
        if (articles === undefined) {
            setAccessingAPI(true)
            axios
                .get("/api/items")
                .then((response) => {
                    // now check the response code of the server
                    switch (response.status) {
                        case 200:
                            // the request returned a list of registers
                            setArticles(response.data)
                            break
                        case 204:
                            // the server has no registers configured. create a warning message
                            console.warn("no articles found on backend")
                            toast({
                                message: t("cash-register.errors.no-articles"),
                                type: "is-warning",
                                position: "center",
                                dismissible: true,
                                single: true,
                                closeOnClick: true,
                                duration: 5000,
                                animate: {
                                    in: 'fadeIn',
                                    out: 'fadeOut'
                                }
                            })
                            break
                        default:
                            // the server responded with an unexpected response code
                            console.error("unexpected response code received while pulling articles")
                            toast({
                                message: t("errors.unexpected-response-code"),
                                type: "is-danger",
                                position: "center",
                                dismissible: false,
                                single: true,
                                closeOnClick: false,
                                duration: 5000,
                                animate: {
                                    in: 'fadeIn',
                                    out: 'fadeOut'
                                }
                            })
                    }
                })
                .catch((reason) => {
                    console.error("failed to get articles from server", reason)
                    toast({
                        message: t("errors.request-failure") + `<br>${reason.message}`,
                        type: "is-danger",
                        position: "center",
                        dismissible: false,
                        single: true,
                        closeOnClick: false,
                        duration: 5000,
                        animate: {
                            in: 'fadeIn',
                            out: 'fadeOut'
                        }
                    })
                })
                .finally(() => {
                    setAccessingAPI(false)
                })
        }
    }, [setArticles]);

    /**
     * This effect loads the available local articles from the server
     */
    useEffect(() => {
        // get the articles stored in the local storage
        let rawArticles = localStorage.getItem("localItems")
        if (rawArticles === null) {
            setLocalArticles([])
            return
        }
        // now parse the json and put it into the articles
        let tmpArticles: Article[] = JSON.parse(rawArticles)
        // now set the local articles
        setLocalArticles(tmpArticles)

    }, [setLocalArticles])

    /**
     * This effect loads the bill ID on startup
     */
    useEffect(() => {
        startTransaction()
    })

    /**
     * This effect updates the total bill amount every time the bill items change
     */
    useEffect(() => {
        let amount = 0.00;
        billItems.forEach(({price}) => {
            amount += price
        })
        setBillAmount(amount)
    }, [billItems]);

    useEffect(() => {
        console.log(`accessing api ${accessingAPI}`)
    }, [accessingAPI])

    useEffect(() => {
        if (!queryParameters.has("smp-status")) {
            return
        }
        switch (queryParameters.get("smp-status")) {
            case "failed":
                // since the transaction has failed, open up a popup message in the webapp and report the error
                let failureCause = queryParameters.get("smp-failure-cause")
                let sumUpTransactionID = queryParameters.get("smp-tx-code")
                let modalContent: JSX.Element = (
                    <div>
                        <p className={"has-text-centered has-text-weight-bold"}>
                            {t('sumup.errors.payment-failed.title')}
                        </p>
                        <p className={"has-text-centered has-text-weight-bold"}>
                            {t('sumup.errors.payment-failed.description')}
                        </p>
                        <p>
                            <span>Code:</span><span className={"is-family-code"}>{failureCause}</span><br/>
                            <span>TxID:</span><span className={"is-family-code"}>{sumUpTransactionID}</span>
                        </p>
                    </div>
                )
                setErrorModalContent(modalContent)
                setShowErrorModal(true)

                // now reload all stored data from the local storage
                let rawItems = localStorage.getItem("current-bill")
                if (rawItems === null) {
                    console.error("unable to restore local data")
                    alert("unable to restore local data")
                    return;
                }
                let items: Article[] = JSON.parse(rawItems)
                setBillItems(items)

                let rawRegister = localStorage.getItem("current-register")
                if (rawRegister === null) {
                    console.error("unable to restore local data")
                    alert("unable to restore local data")
                    return;
                }
                let register: Register = JSON.parse(rawRegister)
                setCurrentRegister(register)
                break
            case "success":
                // the handling of the transaction was successful.
                // TODO: Issue notification about successful handling
                break
        }
        return () => {
            setQueryParameters(new URLSearchParams())
        }
    }, [queryParameters, setQueryParameters, t]);

    /*
    now define some functions that are used for handling actions
     */

    /**
     * This function makes a request to the backend and creates a new and
     * empty transaction in the database.
     * Afterward, it returns the bill id in the response body.
     * This bill id is then set to the current bill id.
     *
     * To minimize the number of empty transactions in the database, the function
     * will check if a bill id is currently available in the session storage before
     * requesting a new one
     */
    function startTransaction() {
        // check if a bill id is already available in the session storage
        let localBillID = sessionStorage.getItem("billID")
        if (localBillID !== null) {
            setBillID(localBillID)
            return
        }

        // since there is no locally stored bill ID, request a new one
        setAccessingAPI(true)
        axios
            .post("/api/transactions/start", null, {responseType: "text"})
            .then((response) => {
                // now check the response code
                switch (response.status) {
                    case 200:
                    case 201:
                        // since the request was successful, store the bill id
                        let bID: string = response.data
                        sessionStorage.setItem("billID", bID)
                        setBillID(bID)
                        break
                    default:
                        // the server responded with an unexpected response code
                        console.error("unexpected response code received while starting new transaction")
                        toast({
                            message: t("errors.unexpected-response-code"),
                            type: "is-danger",
                            position: "center",
                            dismissible: false,
                            single: true,
                            closeOnClick: false,
                            duration: 5000,
                            animate: {
                                in: 'fadeIn',
                                out: 'fadeOut'
                            }
                        })
                }
            })
            .catch((reason) => {
                console.error("failed to start new transaction", reason)
                toast({
                    message: t("errors.request-failure") + `<br>${reason.message}`,
                    type: "is-danger",
                    position: "center",
                    dismissible: false,
                    single: true,
                    closeOnClick: false,
                    duration: 5000,
                    animate: {
                        in: 'fadeIn',
                        out: 'fadeOut'
                    }
                })
            })
            .finally(() => {
                setAccessingAPI(false)
            })
    }

    /**
     * This function takes an article and adds it to the bill
     */
    function addBillItem(article: Article) {
        let items = billItems.slice()
        items.push(article)
        setBillItems(items)
    }

    /**
     * This function removes an article from the bill
     */
    function removeBillItem(idx: number) {
        if (!billItems) {
            console.warn("unable to remove article from empty bill")
            return
        }

        let items = billItems.slice()
        items.splice(idx, 1)
        setBillItems(items)
        toast({
            message: t(`cash-register.bill.item-removed`),
            type: "is-info",
            position: "top-center",
            dismissible: false,
            single: true,
            closeOnClick: true,
            duration: 633,
            animate: {
                in: 'fadeIn',
                out: 'fadeOut'
            }
        })
    }

    /**
     * This function prepares the bill to create a transaction which then is returned
     */
    function prepareTransaction(): Transaction | undefined {
        if (!billItems) {
            console.warn("unable to create transaction from empty bill")
            return
        }

        if (!currentRegister) {
            console.warn("every transaction needs a register assigned to it")
            return
        }

        if (!billID) {
            console.warn("every transaction needs a bill id assigned to it")
            return
        }

        // start building a map for the article statistics
        let articleStatistics = new Map<Article, number>();
        billItems.forEach((item, _, items) => {
            articleStatistics.set(
                item,
                (items.filter((article) => article.id === item.id)).length
            )
        })

        // now build a description text
        let descriptionText = "";
        articleStatistics.forEach(
            (count, article) => {
                descriptionText += `${count}× ${article.name} á ${article.price.toFixed(2)} €\n`
            }
        )
        descriptionText = descriptionText.trim()

        // now build the transaction
        return {
            ID: billID,
            amount: billAmount,
            title: "Verkauf",
            description: descriptionText,
            register: currentRegister.id,
            items: billItems.filter((article) => !article.isLocal).map(({id}) => id),
            customItems: billItems.filter((article) => article.isLocal),
            at: new Date().toISOString()
        }
    }

    /**
     * This function handles the actual payment process
     */
    function handlePayment(paymentType: "cash" | "card") {
        let transaction = prepareTransaction()
        if (!transaction) {
            return
        }
        // since the transaction is now prepared, set the payment type on the transaction
        transaction.paymentType = paymentType
        // if the payment type is a card payment, try to open up the SumUp application
        // to let it handle the rest of the payment process
        if (transaction.paymentType === "card") {
            // now check if the affiliate key and the app id are set
            if (!sumUpAffiliateKey || !sumUpAppID) {
                setErrorModalContent(
                    <div>
                        <p className={"has-text-centered has-text-weight-bold"}>{t("sumup.missing-data.title")}</p>
                        <p>{t("sumup.missing-data.description")}</p>
                    </div>
                )
                setShowErrorModal(true);
                return;
            }
            let sumUpBaseUri = "sumupmerchant://pay/1.0"
            let sumUpParameter = new URLSearchParams()
            sumUpParameter.set("affiliate-key", sumUpAffiliateKey)
            sumUpParameter.set("app-id", sumUpAppID)
            sumUpParameter.set("total", billAmount.toFixed(2))
            sumUpParameter.set("amount", billAmount.toFixed(2))
            sumUpParameter.set("currency", "EUR")
            sumUpParameter.set("title", "Unikino GEGENLICHT")
            sumUpParameter.set("skip-screen-success", "true")
            sumUpParameter.set("foreign-tx-id", transaction.ID)
            sumUpParameter.set("callback", `${window.location.toString()}`)
            sumUpParameter.set("callbackfail", `${window.location.toString()}`)
            sumUpParameter.set("callbacksuccess", `${window.location.toString()}`)

            let userEmail = prompt(t("sumup.email-prompt"), "")
            if (userEmail !== null && validator.isEmail(userEmail)) {
                sumUpParameter.set("receipt-email", userEmail)
            }
            if (cardPaymentButton.current !== null) {
                cardPaymentButton.current.href = `${sumUpBaseUri}?${sumUpParameter.toString()}`
            }
            // now write the complete transaction into the local storage
            localStorage.setItem("current-bill", JSON.stringify(billItems))
            localStorage.setItem("current-register", JSON.stringify(currentRegister))
        }


    }


    return (
        <div>
            <div id={"modalContainer"}>
                <div className={`modal ${showErrorModal ? 'is-active' : ''}`} id={"errorModal"}>
                    <div className={"modal-background"}></div>
                    <div className={"modal-card"}>
                        <header className={"modal-card-head"}>
                            <p className={"modal-card-title"}>
                                {t("errors.modal.title")}
                            </p>
                        </header>
                        <section className={"modal-card-body"}>
                            {errorModalContent}
                        </section>
                        <footer className={"modal-card-foot"}>
                            <button className={"button is-info is-fullwidth"} onClick={() => setShowErrorModal(false)}>Schließen</button>
                        </footer>
                    </div>
                </div>
            </div>
            <div className={"has-navbar-fixed-top"}>
                <div className={"mt-2 px-1"}>
                    <div className={"buttons is-centered has-addons mb-1"}>
                        <button className={`button is-rounded is-link ${accessingAPI ? 'is-loading' : ''}`}
                                style={{width: '49%'}}
                                disabled>
                            Reservierungen (Work In Progress)
                        </button>
                        <button className={`button is-rounded is-link ${accessingAPI ? 'is-loading' : ''}`}
                                style={{width: '49%'}}
                                disabled>
                            Statistiken (Work In Progress)
                        </button>
                    </div>
                    {/* Now render the selection menu for the current register*/}
                    <div className={"select is-rounded is-fullwidth"}>
                        <select required onChange={(event) => setCurrentRegister(registers?.find(({id}) => {
                            return id === event.target.value
                        }))}>
                            <option disabled selected={currentRegister === undefined}>{t(`cash-register.select-register`)}</option>
                            {registers?.map(({id, name, description}) => {
                                return <option value={id} selected={currentRegister?.id === id}>{name} - {description}</option>;
                            })}
                        </select>
                    </div>
                    <div className={currentRegister ? ' ' : 'is-hidden'}>
                        {/* Now render the article list/buttons*/}
                        <h1 className={"title my-2 is-size-4 has-text-centered"}>
                            {t(`cash-register.articles`)}
                        </h1>
                        <div className={"field is-grouped"} style={{overflowX: "scroll", overflowY: "hidden"}}>
                            {
                                articles?.map((article) => {
                                    let {name, icon} = article
                                    return (
                                        <p className={"control"}>
                                            <button className={"button is-info is-fullheight is-5 has-text-centered"}
                                                    onClick={() => addBillItem(article)}
                                                    disabled={currentRegister === undefined}>
                                            <span className={"icon-text is-align-items-center"}>
                                                <span className={"icon"}>
                                                    <Icon icon={icon} height={64}></Icon>
                                                </span>
                                                <span>{name}</span>
                                            </span>
                                            </button>
                                        </p>
                                    );
                                })
                            }
                        </div>
                        <div>
                            <h2 className={"subtitle is-size-4 has-text-centered my-1"}>
                                {t(`cash-register.bill.title`)}
                            </h2>
                            <h3 className={"heading is-size-5 has-text-centered my-1"}>
                                {t(`cash-register.bill.total`)}: {billAmount.toFixed(2)} €
                            </h3>
                            <h4 className={"is-size-7 has-text-centered my-1"}>
                                {t(`cash-register.bill.id`)}: {billID}
                            </h4>
                            <div className={"buttons is-centered has-addons"}>
                                <button className={`button is-success is-rounded ${accessingAPI ? 'is-loading' : ''}`}
                                        disabled={currentRegister === undefined}
                                        style={{backgroundColor: "#8134cf", width: "45%"}}
                                        onClick={() => handlePayment("cash")}>
                                <span className={"icon is-medium"}>
                                    <Icon height={"2rem"} width={"2rem"} icon={"la:money-bill-wave-alt"}></Icon>
                                </span>
                                    <span>{t(`cash-register.bill.cash-payment`)}</span>
                                </button>
                                <a className={`button is-success is-rounded ${accessingAPI ? 'is-loading' : ''} ${currentRegister === undefined ? 'is-disabled' : ''}`}
                                        style={{backgroundColor: "#3063E9", width: "45%"}}
                                        ref={cardPaymentButton}
                                        onClick={() => handlePayment("card")}>
                                <span className={"icon is-medium"}>
                                    <Icon icon={"entypo:credit-card"} height={"2rem"} width={"2rem"}/>
                                </span>
                                    <span>{t(`cash-register.bill.card-payment`)}</span>
                                </a>
                            </div>
                            <div style={{overflowX: "hidden", overflowY: "auto"}}>
                                {
                                    billItems.map(({name, price, icon}, idx) => {
                                        return (
                                            <div className={"columns is-mobile is-gapless is-multiline my-2"}>
                                                <div
                                                    className={"column is-2 is-align-content-center has-text-centered"}>
                                                    <Icon width={48} icon={icon}></Icon>
                                                </div>
                                                <div className={"column is-8 is-6-mobile is-align-items-center"}>
                                                    <p className={"is-align-self-center"}>
                                                        <span className={"title is-size-5"}>{name}</span><br/>
                                                        <span
                                                            className={"heading is-size-6"}>{price.toFixed(2)} €</span>
                                                    </p>
                                                </div>
                                                <div
                                                    className={"column is-1 ml-2 is-align-content-center has-text-centered"}>
                                                    <button className={"button is-fullheight is-danger is-rounded"}
                                                            onClick={() => removeBillItem(idx)}>
                                                        <Icon width={24} icon={"iwwa:delete"}></Icon>
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
            </div>
        </div>
    )
}