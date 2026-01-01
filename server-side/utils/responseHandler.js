const sendResponse = (res, err, data) => {
    if (err) {
        console.error("System Error:", err);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error", 
            error: err 
        });
    }

    return res.status(200).json({ 
        success: true, 
        data: data 
    });
};

module.exports = { sendResponse };