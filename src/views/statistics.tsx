import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {Article} from "../types/article";
import axios from "axios";
import {SaleStatistics} from "../types/statistics";

export default function Statistics() {
    /**
     * Get the translation hook
     */
    const {t} = useTranslation()

    /**
     * Create some state variables
     */
    const [accessingAPI, setAccessingAPI] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [statistics, setStatistics] = useState<SaleStatistics|undefined>(undefined);
    const [registerFilter, setRegisterFilter] = useState<string|undefined>(undefined);
    const [fromFilter, setFromFilter] = useState<Date|undefined>(undefined);
    const [untilFilter, setUntilFilter] = useState<Date|undefined>(undefined);

    /**
     * Now use effects to pull the statistics if any of the filters change
     */
    useEffect(() => {
        axios
            .get("/api/statistics/sales", {
                params: {
                    register: registerFilter,
                    from: fromFilter?.toISOString(),
                    until: fromFilter?.toISOString()
                }
            })
            .then((response) => {
                setStatistics(response.data)
            })
    }, [registerFilter, fromFilter, untilFilter])

    return (<div className={"mt-1"}>
        <h1 className={"title is-size-3 has-text-centered"}>{t(`statistics.title`)}</h1>
        <div className={"field is-horizontal p-1"}>
            <div className={"field-label is-normal"}>
                <label className={"label"}>Kasse</label>
            </div>
            <div className={"field-body"}>
                <div className={"field"}>
                    <p className={"control is-expanded"}>
                        <div className={"select is-fullwidth"}>
                            <select>
                                <option value={""}>Alle</option>
                            </select>
                        </div>
                    </p>
                </div>
            </div>
            <div className={"field-label is-normal"}>
                <label className={"label"}>Von</label>
            </div>
            <div className={"field-body"}>
                <div className={"field"}>
                    <p className={"control is-expanded"}>
                        <input className={"input"} type={"datetime-local"}/>
                    </p>
                </div>
            </div>
            <div className={"field-label is-normal"}>
                <label className={"label"}>Bis</label>
            </div>
            <div className={"field-body"}>
                <div className={"field"}>
                    <p className={"control is-expanded"}>
                        <input className={"input"} type={"datetime-local"}/>
                    </p>
                </div>
            </div>
        </div>
    </div>);
}