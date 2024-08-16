//  .catch will catch the error and call the next function, 
// passing the error to Express's error handling middleware

module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(next);
    }
}

