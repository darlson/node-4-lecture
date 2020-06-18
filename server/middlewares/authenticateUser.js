module.exports = (req, res, next) => {
    if (req.session.user){
        next()
    } else {
        res.status(403).send(`Can't do it boss`)
    }
}