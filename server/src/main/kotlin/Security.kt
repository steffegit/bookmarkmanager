package me.atsteffe

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import me.atsteffe.service.JwtService

lateinit var jwtService: JwtService

fun Application.configureSecurity() {
    val jwtSecret = environment.config.property("jwt.secret").getString()
    val jwtDomain = environment.config.property("jwt.issuer").getString()
    val jwtAudience = environment.config.property("jwt.audience").getString()
    val jwtRealm = environment.config.property("jwt.realm").getString()

    jwtService = JwtService(jwtSecret, jwtDomain, jwtAudience)

    authentication {
        jwt {
            realm = jwtRealm
            verifier(
                jwtService.jwtVerifier
            )
            validate { credential ->
                if (credential.payload.audience.contains(jwtAudience)) JWTPrincipal(credential.payload) else null
            }
        }
    }

}
