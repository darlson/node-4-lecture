const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        const {email, password} = req.body
        const db = req.app.get('db')
        
        // check if user already exists
        const existingUser = await db.get_user_by_email(email)
        if(existingUser[0]){
            return res.status(409).send('User already exists')
        }

        // if they do not, we can carry on
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)
        
        // create new user
        const newUser = await db.create_user([email, hash])

        // set user on session
        req.session.user = newUser[0]

        //send back new user
        res.status(200).send(req.session.user)
    },
    login: async (req, res) => {
        if (req.session.attemptCount >= 5){
            req.session.attemptCount++
            return res.status(403).send('Too many attempts')
        }
        
        const {email, password} = req.body
        const db = req.app.get('db')

        // make sure user exists
        const existingUser = await db.get_user_by_email(email)

        if(!existingUser[0]){
            return res.status(404).send('User does not exist')
        }

        // if they do exist, we need to authenticate them
        const authenticated = bcrypt.compareSync(password, existingUser[0].hash)

        // if password does not match, increment how many times they have tried

        if(!authenticated){
            if(!req.session.attemptCount){
                req.session.attemptCount = 1
            } else {
                req.session.attemptCount++
            }
            return res.status(403).send('Incorrect password')
        }

        // remove hash from our user object
        delete existingUser[0].hash

        // set our user on session
        req.session.user = existingUser[0]
        res.status(200).send(req.session)

    },
    logout: (req, res) => {
        // save their history/any info you want and then destroy
        req.session.destroy()

        res.sendStatus(200)
    },

}