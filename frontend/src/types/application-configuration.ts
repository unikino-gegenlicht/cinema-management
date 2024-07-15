type LocalConfiguration = {
    BackendHost?: string | undefined,
    SharedDevice?: boolean | undefined,
    OIDC?: {
        ClientID?: string,
        Issuer?: string
    }
}

type RemoteConfiguration = {
    enableCardPayments?: boolean,
    locked?: boolean
}