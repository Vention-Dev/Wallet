// This file was autogenerated from a .proto file, DO NOT EDIT!
import axios from 'axios'
import * as Types from './types'
export type ResultError = { status: 'ERROR', reason: string }

export type ClientParams = {
    baseUrl: string
    retrieveGuestAuth: () => Promise<string | null>
    retrieveUserAuth: () => Promise<string | null>
    retrieveAdminAuth: () => Promise<string | null>
    retrieveAppAuth: () => Promise<string | null>
    encryptCallback: (plain: any) => Promise<any>
    decryptCallback: (encrypted: any) => Promise<any>
    deviceId: string
    checkResult?: true
}
export default (params: ClientParams) => ({
    LndGetInfo: async (request: Types.LndGetInfoRequest): Promise<ResultError | ({ status: 'OK' } & Types.LndGetInfoResponse)> => {
        const auth = await params.retrieveAdminAuth()
        if (auth === null) throw new Error('retrieveAdminAuth() returned null')
        let finalRoute = '/api/admin/lnd/getinfo'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LndGetInfoResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    AddApp: async (request: Types.AddAppRequest): Promise<ResultError | ({ status: 'OK' } & Types.AuthApp)> => {
        const auth = await params.retrieveAdminAuth()
        if (auth === null) throw new Error('retrieveAdminAuth() returned null')
        let finalRoute = '/api/admin/app/add'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.AuthAppValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    AuthApp: async (request: Types.AuthAppRequest): Promise<ResultError | ({ status: 'OK' } & Types.AuthApp)> => {
        const auth = await params.retrieveAdminAuth()
        if (auth === null) throw new Error('retrieveAdminAuth() returned null')
        let finalRoute = '/api/admin/app/auth'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.AuthAppValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    Health: async (): Promise<ResultError | ({ status: 'OK' })> => {
        const auth = await params.retrieveGuestAuth()
        if (auth === null) throw new Error('retrieveGuestAuth() returned null')
        let finalRoute = '/api/health'
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return data
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    EncryptionExchange: async (request: Types.EncryptionExchangeRequest): Promise<ResultError | ({ status: 'OK' })> => {
        const auth = await params.retrieveGuestAuth()
        if (auth === null) throw new Error('retrieveGuestAuth() returned null')
        let finalRoute = '/api/encryption/exchange'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return data
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    SetMockInvoiceAsPaid: async (request: Types.SetMockInvoiceAsPaidRequest): Promise<ResultError | ({ status: 'OK' })> => {
        const auth = await params.retrieveGuestAuth()
        if (auth === null) throw new Error('retrieveGuestAuth() returned null')
        let finalRoute = '/api/lnd/mock/invoice/paid'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return data
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetLnurlWithdrawInfo: async (query: Types.GetLnurlWithdrawInfo_Query): Promise<ResultError | ({ status: 'OK' } & Types.LnurlWithdrawInfoResponse)> => {
        const auth = await params.retrieveGuestAuth()
        if (auth === null) throw new Error('retrieveGuestAuth() returned null')
        let finalRoute = '/api/guest/lnurl_withdraw/info'
        const q = (new URLSearchParams(query)).toString()
        finalRoute = finalRoute + (q === '' ? '' : '?' + q)
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlWithdrawInfoResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    HandleLnurlWithdraw: async (query: Types.HandleLnurlWithdraw_Query): Promise<ResultError | ({ status: 'OK' })> => {
        const auth = await params.retrieveGuestAuth()
        if (auth === null) throw new Error('retrieveGuestAuth() returned null')
        let finalRoute = '/api/guest/lnurl_withdraw/handle'
        const q = (new URLSearchParams(query)).toString()
        finalRoute = finalRoute + (q === '' ? '' : '?' + q)
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return data
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetLnurlPayInfo: async (query: Types.GetLnurlPayInfo_Query): Promise<ResultError | ({ status: 'OK' } & Types.LnurlPayInfoResponse)> => {
        const auth = await params.retrieveGuestAuth()
        if (auth === null) throw new Error('retrieveGuestAuth() returned null')
        let finalRoute = '/api/guest/lnurl_pay/info'
        const q = (new URLSearchParams(query)).toString()
        finalRoute = finalRoute + (q === '' ? '' : '?' + q)
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlPayInfoResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    HandleLnurlPay: async (query: Types.HandleLnurlPay_Query): Promise<ResultError | ({ status: 'OK' } & Types.HandleLnurlPayResponse)> => {
        const auth = await params.retrieveGuestAuth()
        if (auth === null) throw new Error('retrieveGuestAuth() returned null')
        let finalRoute = '/api/guest/lnurl_pay/handle'
        const q = (new URLSearchParams(query)).toString()
        finalRoute = finalRoute + (q === '' ? '' : '?' + q)
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.HandleLnurlPayResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    HandleLnurlAddress: async (routeParams: Types.HandleLnurlAddress_RouteParams): Promise<ResultError | ({ status: 'OK' } & Types.LnurlPayInfoResponse)> => {
        const auth = await params.retrieveGuestAuth()
        if (auth === null) throw new Error('retrieveGuestAuth() returned null')
        let finalRoute = '/.well-known/lnurlp/:address_name'
        finalRoute = finalRoute.replace(':address_name', routeParams['address_name'])
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlPayInfoResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetApp: async (): Promise<ResultError | ({ status: 'OK' } & Types.Application)> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/get'
        const { data } = await axios.post(params.baseUrl + finalRoute, {}, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.ApplicationValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    AddAppUser: async (request: Types.AddAppUserRequest): Promise<ResultError | ({ status: 'OK' } & Types.AppUser)> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/user/add'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.AppUserValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    AddAppInvoice: async (request: Types.AddAppInvoiceRequest): Promise<ResultError | ({ status: 'OK' } & Types.NewInvoiceResponse)> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/add/invoice'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.NewInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    AddAppUserInvoice: async (request: Types.AddAppUserInvoiceRequest): Promise<ResultError | ({ status: 'OK' } & Types.NewInvoiceResponse)> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/user/add/invoice'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.NewInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetAppUser: async (request: Types.GetAppUserRequest): Promise<ResultError | ({ status: 'OK' } & Types.AppUser)> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/user/get'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.AppUserValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    PayAppUserInvoice: async (request: Types.PayAppUserInvoiceRequest): Promise<ResultError | ({ status: 'OK' } & Types.PayInvoiceResponse)> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/invoice/pay'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.PayInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    SendAppUserToAppUserPayment: async (request: Types.SendAppUserToAppUserPaymentRequest): Promise<ResultError | ({ status: 'OK' })> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/user/internal/pay'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return data
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    SendAppUserToAppPayment: async (request: Types.SendAppUserToAppPaymentRequest): Promise<ResultError | ({ status: 'OK' })> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/internal/pay'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return data
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetAppUserLNURLInfo: async (request: Types.GetAppUserLNURLInfoRequest): Promise<ResultError | ({ status: 'OK' } & Types.LnurlPayInfoResponse)> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/user/lnurl/pay/info'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlPayInfoResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    SetMockAppUserBalance: async (request: Types.SetMockAppUserBalanceRequest): Promise<ResultError | ({ status: 'OK' })> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/mock/user/blance/set'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return data
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    SetMockAppBalance: async (request: Types.SetMockAppBalanceRequest): Promise<ResultError | ({ status: 'OK' })> => {
        const auth = await params.retrieveAppAuth()
        if (auth === null) throw new Error('retrieveAppAuth() returned null')
        let finalRoute = '/api/app/mock/blance/set'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return data
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetUserInfo: async (): Promise<ResultError | ({ status: 'OK' } & Types.UserInfo)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/info'
        const { data } = await axios.post(params.baseUrl + finalRoute, {}, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.UserInfoValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    AddProduct: async (request: Types.AddProductRequest): Promise<ResultError | ({ status: 'OK' } & Types.Product)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/product/add'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.ProductValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    NewProductInvoice: async (query: Types.NewProductInvoice_Query): Promise<ResultError | ({ status: 'OK' } & Types.NewInvoiceResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/product/get/invoice'
        const q = (new URLSearchParams(query)).toString()
        finalRoute = finalRoute + (q === '' ? '' : '?' + q)
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.NewInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetUserOperations: async (request: Types.GetUserOperationsRequest): Promise<ResultError | ({ status: 'OK' } & Types.GetUserOperationsResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/operations'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.GetUserOperationsResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    NewAddress: async (request: Types.NewAddressRequest): Promise<ResultError | ({ status: 'OK' } & Types.NewAddressResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/chain/new'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.NewAddressResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    PayAddress: async (request: Types.PayAddressRequest): Promise<ResultError | ({ status: 'OK' } & Types.PayAddressResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/chain/pay'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.PayAddressResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    NewInvoice: async (request: Types.NewInvoiceRequest): Promise<ResultError | ({ status: 'OK' } & Types.NewInvoiceResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/invoice/new'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.NewInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    DecodeInvoice: async (request: Types.DecodeInvoiceRequest): Promise<ResultError | ({ status: 'OK' } & Types.DecodeInvoiceResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/invoice/decode'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.DecodeInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    PayInvoice: async (request: Types.PayInvoiceRequest): Promise<ResultError | ({ status: 'OK' } & Types.PayInvoiceResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/invoice/pay'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.PayInvoiceResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    OpenChannel: async (request: Types.OpenChannelRequest): Promise<ResultError | ({ status: 'OK' } & Types.OpenChannelResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/open/channel'
        const { data } = await axios.post(params.baseUrl + finalRoute, request, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.OpenChannelResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetLnurlWithdrawLink: async (): Promise<ResultError | ({ status: 'OK' } & Types.LnurlLinkResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/lnurl_withdraw/link'
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlLinkResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetLnurlPayLink: async (): Promise<ResultError | ({ status: 'OK' } & Types.LnurlLinkResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/lnurl_pay/link'
        const { data } = await axios.get(params.baseUrl + finalRoute, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlLinkResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetLNURLChannelLink: async (): Promise<ResultError | ({ status: 'OK' } & Types.LnurlLinkResponse)> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/lnurl_channel/url'
        const { data } = await axios.post(params.baseUrl + finalRoute, {}, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            const result = data
            if (!params.checkResult) return { status: 'OK', ...result }
            const error = Types.LnurlLinkResponseValidate(result)
            if (error === null) { return { status: 'OK', ...result } } else return { status: 'ERROR', reason: error.message }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    },
    GetLiveUserOperations: async (cb: (v: ResultError | ({ status: 'OK' } & Types.LiveUserOperation)) => void): Promise<void> => { throw new Error('http streams are not supported') },
    GetMigrationUpdate: async (cb: (v: ResultError | ({ status: 'OK' } & Types.MigrationUpdate)) => void): Promise<void> => { throw new Error('http streams are not supported') },
    BatchUser: async (requests: Types.UserMethodInputs[]): Promise<ResultError | ({ status: 'OK', responses: (Types.UserMethodOutputs)[] })> => {
        const auth = await params.retrieveUserAuth()
        if (auth === null) throw new Error('retrieveUserAuth() returned null')
        let finalRoute = '/api/user/batch'
        const { data } = await axios.post(params.baseUrl + finalRoute, { requests }, { headers: { 'authorization': auth } })
        if (data.status === 'ERROR' && typeof data.reason === 'string') return data
        if (data.status === 'OK') {
            return { status: 'OK', ...data }
        }
        return { status: 'ERROR', reason: 'invalid response' }
    }
})
