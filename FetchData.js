/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {

    var requestedFields = getFields().forIds(
        request.fields.map(function (field) {
            return field.name;
        })
    );

    var courseData = fetchCourseDataFromApi();
    var normalizedResponse = normalizeResponse(courseData);
    var data = getFormattedData(normalizedResponse, requestedFields);

    return {
        schema: requestedFields.build(),
        rows: data
    };

}

/**
 * Fetches data from Canvas' GraphQL endpoint
 *
 * @returns {Object} JSON object containing course data
 */
function fetchCourseDataFromApi() {

    var userProperties = PropertiesService.getUserProperties();
    var key = userProperties.getProperty('dscc.key');
    var url = `https://${DEFAULT_SUBDOMAIN}.instructure.com/api/graphql`;

    var query = `
        query MyQuery {
            allCourses {
            name
            _id
            state
            usersConnection(filter: {enrollmentStates: active}) {
                nodes {
                name
                email
                _id
                enrollments {
                    state
                    type
                    grades {
                    currentScore
                    currentGrade
                    state
                    }
                }
                }
            }
            assignmentGroupsConnection {
                nodes {
                _id
                name
                state
                assignmentsConnection {
                    nodes {
                    _id
                    name
                    pointsPossible
                    state
                    submissionsConnection(filter: {enrollmentTypes: StudentEnrollment}) {
                        nodes {
                        _id
                        score
                        user {
                            _id
                            name
                            email
                        }
                        state
                        late
                        missing
                        excused
                        }
                    }
                    }
                }
                }
            }
            courseCode
            }
        }      
  `;

    var payload = {
        "query": query
    };

    var options = {
        'method': 'POST',
        'headers': {
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip'
        },
        'muteHttpExceptions': true,
        'payload': JSON.stringify(payload)
    };

    var response = UrlFetchApp.fetch(url, options);

    var responseCode = response.getResponseCode();
    if (responseCode != 200) {
        console.error(`Request failed with error code ${responseCode}`);
        return [];
    }

    var responseJson = JSON.parse(response);
    return responseJson['data']['allCourses'];

}

/**
 * Returns tabular data usable by Data Studio
 *
 * @param {Object} JSON object containing course data
 * @returns {Object} Contains the schema and data for the given request.
 */
function normalizeResponse(courseData) {

    var output = [];
    var userScores = {};

    courseData.forEach((course) => {

        var courseCode = course['courseCode'];
        var courseName = course['name'];

        var users = course['usersConnection']['nodes'];

        // users and enrollments
        users.forEach((user) => {

            var studentId = user['_id'];

            var enrollments = user['enrollments'];
            enrollments.forEach((enrollment) => {

                var currentScore = enrollment['grades']['currentScore'];
                var currentGrade = enrollment['grades']['currentGrade'];

                if (enrollment['type'] === 'StudentEnrollment' &&
                    enrollment['state'] === 'active') {

                    userScores[studentId] = {
                        'currentScore': currentScore,
                        'currentGrade': currentGrade
                    };

                }

            });

        });

        // assignment groups, assignments, and submissions
        var assignmentGroups = course['assignmentGroupsConnection']['nodes'];
        assignmentGroups.forEach((assignmentGroup) => {

            var assignmentGroupName = assignmentGroup['name'];
            var assignmentGroupState = assignmentGroup['state'];

            if (assignmentGroupState === 'available') {

                var assignments = assignmentGroup['assignmentsConnection']['nodes'];

                assignments.forEach((assignment) => {

                    var assignmentName = assignment['name'];
                    var assignmentPointsPossible = assignment['pointsPossible'];
                    var assignmentState = assignment['state'];

                    if (assignmentState === 'published') {

                        var submissions = assignment['submissionsConnection']['nodes'];
                        submissions.forEach((submission) => {

                            var studentName = submission['user']['name'];
                            var studentEmail = submission['user']['email'];
                            var studentId = submission['user']['_id'];
                            var assignmentIsLate = submission['late'];
                            var assignmentIsMissing = submission['missing'];
                            var assignmentIsExcused = submission['excused'];
                            var studentAssignmentScore = submission['score'];

                            var record = {
                                "courseCode": courseCode,
                                "courseName": courseName,
                                "studentName": studentName,
                                "studentEmail": studentEmail,
                                "assignmentGroup": assignmentGroupName,
                                "assignmentName": assignmentName,
                                "assignmentIsLate": assignmentIsLate,
                                "assignmentIsMissing": assignmentIsMissing,
                                "assignmentIsExcused": assignmentIsExcused,
                                "assignmentPointsPossible": assignmentPointsPossible,
                                "studentAssignmentScore": studentAssignmentScore,
                                "studentOverallScore": userScores[studentId]['currentScore'],
                                "studentOverallGrade": userScores[studentId]['currentGrade']
                            };

                            output.push(record);

                        });
                    }
                });
            }
        });
    });

    return output;

}

/**
 * Formats the parsed response from external data source into correct tabular
 * format and returns only the requestedFields
 *
 * @param {Object} parsedResponse The response string from external data source
 *     parsed into an object in a standard format.
 * @param {Array} requestedFields The fields requested in the getData request.
 * @returns {Array} Array containing rows of data in key-value pairs for each
 *     field.
*/
/**
 * Formats a single row of data into the required format.
 *
 * @param {Object} requestedFields Fields requested in the getData request.
 * @param {string} packageName Name of the package who's download data is being
 *    processed.
 * @param {Object} dailyDownload Contains the download data for a certain day.
 * @returns {Object} Contains values for requested fields in predefined format.
 */
function getFormattedData(response, requestedFields) {

    return response.map(function (record) {

        var row = requestedFields.asArray().map(function (requestedField) {

            return record[requestedField.getId()];

        });

        return { values: row };

    });

}
