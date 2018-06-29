/**
 * Created by championswimmer on 11/03/17.
 */

const BearerStrategy = require('passport-http-bearer').Strategy

const models = require('../../db/models').models
const debug = require('debug')('oauth:strategies:api')


const bearerStrategy = new BearerStrategy(
    {passReqToCallback: true},
    function (req, token, done) {
        models.AuthToken.findOne({
            where: {token: token},
            include: [models.User, models.Client]
        }).then(function (authToken) {
            // No such token exists
            if (!authToken) {
                return done(null, false)
            }
            let info = {
                scope: authToken.scope,
                explicit: authToken.explicit
            }
            // Attach client to request
            req.client = authToken.client

            // When authtoken has both user and client
            if (authToken.user) {
                info.clientOnly = false
                return done(null, authToken.user.get(), info)
            }

            // When it is a client-only token
            if (authToken.client.trusted) {
                info.clientOnly = true
                return done(null, authToken.client.get(), info)
            }

            return done(null, null, info)
        }).catch((err) => debug(err))
    })

module.exports = {
    bearerStrategy
}
