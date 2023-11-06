import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import {Article} from "../types/article";
import axios from "axios";
import {SaleStatistics} from "../types/statistics";
import {Chart as ChartJS, registerables} from "chart.js";
import {Bar} from "react-chartjs-2";
import {toast} from "bulma-toast";
import {CashRegister as Register} from "../types/cash-register";
import moment from "moment-timezone";


export default function Statistics() {
    ChartJS.register(...registerables);
    /**
     * Get the translation hook
     */
    const {t} = useTranslation()

    /**
     * Create some state variables
     */
    const [accessingAPI, setAccessingAPI] = useState(false);
    const [articles, setArticles] = useState<Article[] | undefined>(undefined);
    const [statistics, setStatistics] = useState<{labels: string[],datasets: { label: string, data: number[], backgroundColor: string }[]} | null>(null);
    // this state stores the cash registers that are available for making transactions in
    const [registers, setRegisters] = useState<Register[] | undefined>(undefined);
    const [loadedStatistics, setLoadedStatistics] = useState(false)

    /**
     * create some references to html inputs to use their values in requests
     */
    const registerSelection = useRef<HTMLSelectElement|null>(null);
    const fromFilterInput = useRef<HTMLInputElement|null>(null)
    const untilFilterInput = useRef<HTMLInputElement|null>(null)

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
    }, [setArticles, articles, t]);

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
    }, [setRegisters, registers, t]);

    /**
     * Now use effects to pull the statistics if any of the filters change
     */
    function updateStatistics() {
        let fromDateUnix = fromFilterInput.current?.valueAsNumber
        let fromDateFilter: string|undefined = undefined;
        let timezone = moment.tz.guess(true);
        if (fromDateUnix) {
            let d = moment.tz(fromDateUnix, 'UTC')
            d = d.tz(timezone, true)
            fromDateFilter = d.toISOString()

        }
        let untilDateUnix = untilFilterInput.current?.valueAsNumber
        let untilDateFilter: string|undefined = undefined;
        if (untilDateUnix) {
            let d = moment.tz(untilDateUnix, 'UTC')
            d = d.tz(timezone, true)
            untilDateFilter =  moment(d).toISOString()
        }
        axios
            .get("/api/statistics/sales", {
                params: {
                    register: registerSelection.current?.value,
                    from: fromDateFilter,
                    until: untilDateFilter
                }
            })
            .then((response) => {
                let {knownArticles, customArticles}: SaleStatistics = response.data
                let labels: string[] = []
                Array.from(Object.keys(knownArticles)).forEach((label) => {
                    if (articles) {
                        let article = articles.find(({id}) => id === label)
                        if (article) {
                            console.log(article.name)
                            labels.push(article.name)
                            return
                        } else {
                            labels.push(label)
                            return;
                        }
                    } else {
                        labels.push(label)
                        return;
                    }
                })
                console.log(labels)
                let knownObjects = {
                    label: 'Standard-Artikel',
                    data: Array.from(Object.values(knownArticles)),
                    backgroundColor: 'rgba(255,221,0,0.75)',
                }
                let customObjects = {
                    label: 'Benutzerdefinierte Artikel',
                    data: [labels.map(() => null), Array.from(Object.values(customArticles))].flat(),
                    backgroundColor: 'rgba(146,255,99,0.75)',
                }
                Array.from(Object.keys(customArticles)).forEach((label) => {
                    labels.push(label)
                })
                setStatistics({labels, datasets: [knownObjects, customObjects]})
                setLoadedStatistics(true)
            })
    }


    useEffect(() => {
        if (!loadedStatistics && articles) {
            axios
                .get("/api/statistics/sales", )
                .then((response) => {
                    let {knownArticles, customArticles}: SaleStatistics = response.data
                    let labels: string[] = []
                    Array.from(Object.keys(knownArticles)).forEach((label) => {
                        if (articles) {
                            let article = articles.find(({id}) => id === label)
                            if (article) {
                                console.log(article.name)
                                labels.push(article.name)
                                return
                            } else {
                                labels.push(label)
                                return;
                            }
                        } else {
                            labels.push(label)
                            return;
                        }
                    })
                    console.log(labels)
                    let knownObjects = {
                        label: 'Standard-Artikel',
                        data: Array.from(Object.values(knownArticles)),
                        backgroundColor: 'rgba(255,221,0,0.75)',
                    }
                    let customObjects = {
                        label: 'Benutzerdefinierte Artikel',
                        data: [labels.map(() => null), Array.from(Object.values(customArticles))].flat(),
                        backgroundColor: 'rgba(146,255,99,0.75)',
                    }
                    Array.from(Object.keys(customArticles)).forEach((label) => {
                        labels.push(label)
                    })
                    setStatistics({labels, datasets: [knownObjects, customObjects]})
                    setLoadedStatistics(true)
                })
        }

    }, [articles])

    if (!statistics) {
        return <div></div>;
    }
    return (<div className={"m-1"}>
        <h1 className={"title is-size-3 has-text-centered"}>{t(`statistics.title`)}</h1>
        <div className={"field is-horizontal p-1"}>
            <div className={"field-label is-normal"}>
                <label className={"label"}>Kasse</label>
            </div>
            <div className={"field-body"}>
                <div className={"field"}>
                    <div className={"control is-expanded"}>
                        <div className={"select is-fullwidth"}>
                            <select ref={registerSelection}>
                                <option value={""}>Alle</option>
                                {
                                    registers?.map(({id, name}) => {
                                        return <option value={id}>{name}</option>;
                                    })
                                }
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <div className={"field-label is-normal"}>
                <label className={"label"}>Von</label>
            </div>
            <div className={"field-body"}>
                <div className={"field"}>
                    <p className={"control is-expanded"}>
                        <input className={"input"} ref={fromFilterInput} type={"datetime-local"}/>
                    </p>
                </div>
            </div>
            <div className={"field-label is-normal"}>
                <label className={"label"}>Bis</label>
            </div>
            <div className={"field-body"}>
                <div className={"field"}>
                    <p className={"control is-expanded"}>
                        <input className={"input"} ref={untilFilterInput} type={"datetime-local"}/>
                    </p>
                </div>
            </div>
        </div>
        <button className={"button is-info is-fullwidth"} onClick={() => updateStatistics()}>
            Statistik aktualisieren
        </button>
        <div>
            <Bar options={{"responsive": true, skipNull: true}} data={statistics}/>
        </div>
    </div>);
}