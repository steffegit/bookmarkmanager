package me.atsteffe

import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import me.atsteffe.config.SecurityConfig
import me.atsteffe.service.JwtService
import org.koin.ktor.ext.inject


fun Application.configureSecurity() {
    val securityConfig by inject<SecurityConfig>()
    val jwtService by inject<JwtService>()

    authentication {
        jwt {
            realm = securityConfig.jwtRealm
            verifier(jwtService.jwtVerifier)
            validate { credential ->
                val jwtId = credential.payload.id

                if (jwtId != null &&
                    !jwtService.isTokenBlacklistedByJwtId(jwtId) &&
                    credential.payload.audience.contains(securityConfig.jwtAudience)
                ) {
                    JWTPrincipal(credential.payload)
                } else {
                    null
                }
            }
        }
    }
}
