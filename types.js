/** 
 * logonPayload
 * @typedef {Object} logonPayload
 * @property {string} host - the SAS VIya URL 
 * @property {string} auth_type - The authentication type (for restaf users).
 * @property {string} token - The authentication token.
 * @property {string} tokenType - The type of the token (e.g., Bearer). 
 */

/**
 * _appContext
 * @typedef {Object} _appContext
 * @property {Object} store - restaf store instance.(for restaf users)
 * @property {Object} storeConfig - Configuration for the restaf store.
 * @property {Object} casSession - restaf cas session instance.(for restaf users)
 * @property {Object} computeSession - restaf compute session instance.(for restaf users)
 * @property {Object} viyaCert - SSL/TSL certificate information.
 * @property {logonPayload} logonPayload - kogonPayload object 
 * @property {string|null} casServerId - cas server id. Default is null.(future)
 * @property {string|null} computeServerId - compute server id. Default is null(future).
 * @property {string|null} sas - SAS compute context
 * @property {Object|null} cas - cas server name(useful if multiple cas servers are used).
 * @property {Object} ext - Additional extensions that a developer may want to add.
 */

