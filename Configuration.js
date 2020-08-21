/**
 * Returns the user configurable options for the connector.
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig() {

    var config = cc.getConfig();

    config
        .newTextInput()
        .setId('subdomain')
        .setName(
            'Canvas subdomain'
        )
        .setHelpText(`Enter k12 if you're on the free tier`)
        .setPlaceholder(DEFAULT_SUBDOMAIN)
        .setAllowOverride(true);

    return config.build();

}


/**
 * Returns the fields for the given request.
 *
 * @returns {Object} fields for the given request
 */
function getFields() {

    var fields = cc.getFields();
    var types = cc.FieldType;
    var aggregations = cc.AggregationType;

    fields.newDimension()
        .setId('courseCode')
        .setName('Course Code')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('courseName')
        .setName('Course Name')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('studentName')
        .setName('Student Name')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('studentEmail')
        .setName('Student Email')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('assignmentGroup')
        .setName('Assignment Group')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('assignmentName')
        .setName('Assignment Name')
        .setType(types.TEXT);

    fields.newDimension()
        .setId('assignmentIsLate')
        .setName('Assignment is Late')
        .setType(types.BOOLEAN);

    fields.newDimension()
        .setId('assignmentIsMissing')
        .setName('Assignment is Missing')
        .setType(types.BOOLEAN);

    fields.newDimension()
        .setId('assignmentIsExcused')
        .setName('Assignment is Excused')
        .setType(types.BOOLEAN);

    fields.newMetric()
        .setId('assignmentPointsPossible')
        .setName('Assignment Points Possible')
        .setType(types.NUMBER)
        .setAggregation(aggregations.AVG);

    fields.newMetric()
        .setId('studentAssignmentScore')
        .setName('Student Assignment Score')
        .setType(types.NUMBER)
        .setAggregation(aggregations.AVG);

    fields.newMetric()
        .setId('studentOverallScore')
        .setName('Student Overall Score')
        .setType(types.NUMBER)
        .setAggregation(aggregations.AVG);

    fields.newDimension()
        .setId('studentOverallGrade')
        .setName('Student Overall Grade')
        .setType(types.TEXT);

    return fields;

}


/**
 * Returns the schema for the given request.
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {

    return { schema: getFields().build() };

}
