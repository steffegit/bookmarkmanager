package me.atsteffe.config

import io.ktor.server.application.*

data class SecurityConfig(
    val jwtSecret: String,
    val jwtIssuer: String,
    val jwtAudience: String,
    val jwtRealm: String
) {
    init {
        require(jwtSecret.isNotBlank()) { "JWT secret cannot be blank" }
        require(jwtIssuer.isNotBlank()) { "JWT issuer cannot be blank" }
        require(jwtAudience.isNotBlank()) { "JWT audience cannot be blank" }
        require(jwtRealm.isNotBlank()) { "JWT realm cannot be blank" }
    }

    companion object {
        fun fromEnvironment(application: Application): SecurityConfig {
            val jwtSecret = application.environment.config.property("jwt.secret").getString()
            val jwtIssuer = application.environment.config.property("jwt.issuer").getString()
            val jwtAudience = application.environment.config.property("jwt.audience").getString()
            val jwtRealm = application.environment.config.property("jwt.realm").getString()

            return SecurityConfig(
                jwtSecret = jwtSecret,
                jwtIssuer = jwtIssuer,
                jwtAudience = jwtAudience,
                jwtRealm = jwtRealm
            )
        }
    }
} 