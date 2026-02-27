import getLogonPayload from "./getLogonPayload.js";

async function tlogon(_appContext) {
    console.error('[Info] Starting tlogon...');
    let r = await getLogonPayload(_appContext);
    console.error('[Info] tlogon completed');
    return r;
}
export default tlogon;