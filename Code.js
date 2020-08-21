/**
 * @fileoverview Canvas LMS Community Connector
 * @author Marcos Alcozer <marcos@alozer.dev>
 */


var cc = DataStudioApp.createCommunityConnector();
var DEFAULT_SUBDOMAIN = 'k12'; // subdomain used free accounts


/**
 * Returns the authentication method required by the
 * connector to authorize the third-party service.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {

    var AuthTypes = cc.AuthType;

    return cc.newAuthTypeResponse()
        .setAuthType(AuthTypes.KEY)
        .build();

}


/**
 * @return {boolean} `true` if the user has successfully
 * authenticated and false otherwise.
 */
function isAuthValid() {

    var userProperties = PropertiesService.getUserProperties();
    var key = userProperties.getProperty('dscc.key');
    console.log(`Validating key ${key}`);
    return validateKey(key);

}


/**
 * @param {string} key Canvas LMS API token
 * @return {boolean} `true` if the user has successfully
 * authenticated and false otherwise.
 */
function validateKey(key) {

    var url = `https://${DEFAULT_SUBDOMAIN}.instructure.com/api/v1/accounts`;

    var options = {
        'method': 'GET',
        'headers': { 'Authorization': `Bearer ${key}` },
        'muteHttpExceptions': true
    };

    var response = UrlFetchApp.fetch(url, options);

    if (response.getResponseCode() === 200) {
        console.log('Successfully authenticated with accounts API endpoint');
        return true;
    } else {
        console.log('Could not authenticate with accounts API endpoint');
        return false;
    }

}

/**
 * Sets user property for API key
 *
 * @param {Object} request Config request parameters.
 * @returns {Object}
 */
function setCredentials(request) {
    var key = request.key;

    var userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('dscc.key', key);
    return {
        errorCode: 'NONE'
    };

}


/**
 * Resets the auth service. This will allow the user
 * to reauthenticate.
 */
function resetAuth() {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('dscc.key');
}

/**
 * This checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
function isAdminUser() {
    return false;
}
