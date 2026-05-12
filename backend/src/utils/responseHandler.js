export const sendSuccess = (res, data, message = "Success", statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const sendError = (res, error, statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error: error.message || error || "Internal Server Error"
    });
};