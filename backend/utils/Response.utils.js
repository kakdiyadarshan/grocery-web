const sendResponse = (res, statusCode, success, message, result = null) => {
    return res.status(statusCode).json({
        success,
        message,
        result
    });
};

const sendSuccessResponse = (res, message, result = []) => {
    return res.status(200).json({
        success: true,
        message,
        result: result || []
    });
};

const sendErrorResponse = (res, statusCode = 500, message = "Server error", error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error: error ? error.message || error : undefined
    });
};


const sendCreatedResponse = (res, message, result = []) => {
    return res.status(201).json({
        success: true,
        message,
        result: result || []
    });
};

const sendNotFoundResponse = (res, message) => {
    return res.status(404).json({
        success: false,
        message,
        result: []
    });
};

const sendBadRequestResponse = (res, message) => {
    return res.status(400).json({
        success: false,
        message,
        result: []
    });
};

const sendUnauthorizedResponse = (res, message) => {
    return res.status(401).json({
        success: false,
        message,
        result: []
    });
};

const sendForbiddenResponse = (res, message) => {
    return res.status(403).json({
        success: false,
        message,
        result: []
    });
};

module.exports = {
    sendResponse,
    sendSuccessResponse,
    sendErrorResponse,
    sendCreatedResponse,
    sendNotFoundResponse,
    sendBadRequestResponse,
    sendUnauthorizedResponse,
    sendForbiddenResponse
};