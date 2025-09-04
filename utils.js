const success = {
    created: (res, data) => {
        return res.status(201).json({
            status: 'OK',
            message: 'Created Successfully',
            data
        })
    },
    fetched: (res, data) => {
        return res.status(200).json({
            status: 'OK',
            message: 'Fetched Successfully',
            data
        })
    },
    updated: (res, data) => {
        return res.status(200).json({
            status: 'OK',
            message: 'Updated Successfully',
            data
        })
    }
}

const error = {
    badRequest: (res, message) => {
        return res.status(400).json({
            status: 'NOT_OK',
            message,
        })
    },
    notFound: (res, message) => {
        return res.status(404).json({
            status: 'NOT_OK',
            message,
        })
    },
    forbidden: (res, message) => {
        return res.status(403).json({
            status: 'NOT_OK',
            message,
        })
    },
    error: (res, message) => {
        return res.status(500).json({
            status: 'NOT_OK',
            message,
        })
    },
}


module.exports = { success, error }