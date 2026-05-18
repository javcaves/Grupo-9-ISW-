export const handleSuccess = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

export const handleErrorClient = (res, statusCode, message, errorDetails = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errorDetails
    });
};

export const handleErrorServer = (res, statusCode = 500, message, errorDetails = null) => {
    console.error(`[SERVER ERROR] ${message}:`, errorDetails);
    
    return res.status(statusCode).json({
        success: false,
        message: "Error interno del servidor.",
        errorDetails
    });
};