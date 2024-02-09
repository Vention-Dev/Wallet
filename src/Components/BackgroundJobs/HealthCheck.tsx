import { useEffect } from "react"
import { useDispatch, useSelector } from "../../State/store"
import { openNotification } from "../../constants"
import { disconnectNostrClientCalls, getNostrClient, parseNprofile } from "../../Api/nostr"
import { editPaySources } from "../../State/Slices/paySourcesSlice"
import { editSpendSources } from "../../State/Slices/spendSourcesSlice"
const SubsCheckIntervalSeconds = 10 * 60
export const HealthCheck = () => {
    const paySource = useSelector(({ paySource }) => paySource)
    const spendSource = useSelector(({ spendSource }) => spendSource)
    const dispatch = useDispatch();

    useEffect(() => {
        let unmountCb = () => { }
        const interval = setInterval(() => {
            unmountCb = checkHealth()
        }, SubsCheckIntervalSeconds * 1000)
        checkHealth()
        return () => {
            unmountCb()
            clearInterval(interval)
        }
    }, [])

    const checkHealth = () => {
        console.log("checking sources state...")
        const sourcesToCheckMap: Record<string, boolean> = {}
        const checkFunc = (s: { pasteField: string }) => {
            if (s.pasteField.startsWith("nprofile")) {
                sourcesToCheckMap[s.pasteField] = true
            }
        }
        paySource.forEach(checkFunc)
        spendSource.forEach(checkFunc)
        let mounted = true
        const sourcesToCheck = Object.keys(sourcesToCheckMap)
        sourcesToCheck.map(async s => {
            const { pubkey, relays } = parseNprofile(s)
            const c = await getNostrClient({ pubkey, relays })
            console.log("checking source state...", pubkey)
            const healthPromise = c.UserHealth()
            const timeout = setTimeout(() => {
                if (!mounted) return
                console.log("cannot connect to", pubkey, { relays })
                openNotification("top", "Error", "cannot connect to source: " + pubkey.slice(0, 10))
                disconnectNostrClientCalls(s)
                updateSubState(s, false)
            }, 30 * 1000);
            await healthPromise
            console.log("connected to", pubkey)
            clearTimeout(timeout)
            updateSubState(s, true)
        })
        return () => { mounted = false }
    }

    const updateSubState = (source: string, connected: boolean) => {
        const payEntry = paySource.find(s => s.pasteField === source)
        if (payEntry) {
            dispatch(editPaySources({ ...payEntry, disconnected: !connected }))
        }
        const spendEntry = spendSource.find(s => s.pasteField === source)
        if (spendEntry) {
            dispatch(editSpendSources({ ...spendEntry, disconnected: !connected }))
        }
    }

    return null
}