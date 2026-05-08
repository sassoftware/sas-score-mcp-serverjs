function baseUrl(appContext) {
    const protocol = appContext.HTTPS === "TRUE" ? "https" : "http";
    //const host = "localhost";
    const host = appContext.VIYA_SERVER;
    return host;
    return `${protocol}://${host}:${appContext.PORT}`;
}
export default baseUrl;