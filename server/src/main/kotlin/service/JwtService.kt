package me.atsteffe.service

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.JWTVerifier
import java.util.*

class JwtService(
    private val secret: String,
    private val issuer: String,
    private val audience: String
) {
    private val algorithm = Algorithm.HMAC256(secret)

    val jwtVerifier: JWTVerifier = JWT.require(algorithm)
        .withIssuer(issuer)
        .withAudience(audience)
        .build()

    fun generateToken(userId: String): String =
        JWT.create()
            .withSubject("Authentication")
            .withIssuer(issuer)
            .withAudience(audience)
            .withClaim("userId", userId)
            .withExpiresAt(Date(System.currentTimeMillis() + 36_000_00 * 24)) // 24 hours
            .sign(algorithm)
}