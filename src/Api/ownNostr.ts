import { generatePrivateKey, getPublicKey } from 'nostr-tools'
import { NostrRequest } from './autogenerated/ts/nostr_transport'
import NewNostrClient from './autogenerated/ts/nostr_client'
import NostrHandler from './nostrHandler'
import { Buffer } from 'buffer'
import { NOSTR_PRIVATE_KEY_STORAGE_KEY } from '../constants'

interface Profile {
    pubkey: string
    relays: [string]
}

export default (profile: Profile) => {
    const privateKey = localStorage.getItem(NOSTR_PRIVATE_KEY_STORAGE_KEY)||"";
    const nostrPublicKey = getPublicKey(privateKey)
    const clientCbs: Record<string, (res: any) => void> = {}
    const handler = new NostrHandler({
        privateKey: privateKey,
        publicKey: nostrPublicKey,
        relays: profile.relays
    }, e => {
        const res = JSON.parse(e.content) as { requestId: string }
        if (clientCbs[res.requestId]) {
            console.log("cb found")
            const cb = clientCbs[res.requestId]
            cb(res)
            delete clientCbs[res.requestId]
        } else {
            console.log("cb not found")
        }
    })
    const clientSend = (to: string, message: NostrRequest): Promise<any> => {
        console.log("sending to", to, message)
        if (!message.requestId) {
            message.requestId = makeId(16)
        }
        const reqId = message.requestId
        if (clientCbs[reqId]) {
            throw new Error("request was already sent")
        }
        handler.Send(to, JSON.stringify(message))
        return new Promise(res => {
            clientCbs[reqId] = (response: any) => {
                res(response)
            }
        })
    }
    
    function makeId(length: number) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    
    return NewNostrClient({
        retrieveNostrUserAuth: async () => { return nostrPublicKey },
        pubDestination: profile.pubkey,
    }, clientSend)
}

//@ts-ignore use this to have access to the client from the console
// global.nostr = nostr // TODO: remove,DEV ONLY