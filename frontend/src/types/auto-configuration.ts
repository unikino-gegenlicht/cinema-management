type AutoconfigurationResponse = {
    Server: {
        Version: string
    },
    Authentication: {
        Type: 'plain' | 'oidc'
        Issuer?: string
        ClientID?: string
    }
}