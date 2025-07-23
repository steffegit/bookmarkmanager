package me.atsteffe.service

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.JWTVerifier
import me.atsteffe.model.JwtToken
import me.atsteffe.repository.JwtRepository
import me.atsteffe.util.JwtTokenBlacklistedException
import me.atsteffe.util.JwtTokenInvalidException
import me.atsteffe.util.JwtTokenMissingClaimsException
import me.atsteffe.util.toUUID
import java.time.ZoneId
import java.util.*

class JwtService(
    private val secret: String,
    private val issuer: String,
    private val audience: String,
    private val jwtRepository: JwtRepository
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
            .withJWTId(UUID.randomUUID().toString())
            .withExpiresAt(Date(System.currentTimeMillis() + 36_000_00 * 24)) // 24 hours
            .sign(algorithm)

    fun invalidateToken(token: String) {
        val jwtToken = extractJwtTokenInfo(token)
        jwtRepository.invalidateToken(jwtToken)
    }

    fun isTokenBlacklisted(token: String): Boolean {
        return try {
            val tokenInfo = extractJwtTokenInfo(token)
            jwtRepository.isTokenBlacklisted(tokenInfo.tokenId)
        } catch (e: Exception) {
            false // If we can't parse it, assume it's not blacklisted (will fail validation anyway)
        }
    }

    fun isTokenBlacklistedByJwtId(jwtId: String): Boolean {
        return jwtRepository.isTokenBlacklisted(jwtId)
    }

    fun validateToken(token: String): Boolean {
        if (isTokenBlacklisted(token)) {
            throw JwtTokenBlacklistedException()
        }

        return try {
            jwtVerifier.verify(token)
            true
        } catch (e: Exception) {
            throw JwtTokenInvalidException("Token verification failed: ${e.message}")
        }
    }

    fun refreshToken(oldToken: String): String {
        val tokenInfo = extractJwtTokenInfo(oldToken)

        if (jwtRepository.isTokenBlacklisted(tokenInfo.tokenId)) {
            throw JwtTokenBlacklistedException()
        }

        return try {
            jwtVerifier.verify(oldToken)
            jwtRepository.invalidateToken(tokenInfo)
            generateToken(tokenInfo.userId.toString())
        } catch (e: Exception) {
            throw JwtTokenInvalidException("Token refresh failed: ${e.message}")
        }
    }

    fun cleanupExpiredTokens(): Int {
        return jwtRepository.cleanupExpiredTokens()
    }

    private fun extractJwtTokenInfo(token: String): JwtToken {
        return try {
            val decodedJWT = JWT.decode(token)
            val tokenId = decodedJWT.id
                ?: throw JwtTokenMissingClaimsException("Token missing JWT ID")
            val userIdString = decodedJWT.getClaim("userId").asString()
                ?: throw JwtTokenMissingClaimsException("Token missing user ID")
            val userId = userIdString.toUUID()
            val expiresAt = decodedJWT.expiresAt?.toInstant()
                ?.atZone(ZoneId.systemDefault())
                ?.toLocalDateTime()
                ?: throw JwtTokenMissingClaimsException("Token missing expiration")
            val issuedAt = decodedJWT.issuedAt?.toInstant()
                ?.atZone(ZoneId.systemDefault())
                ?.toLocalDateTime()
            val subject = decodedJWT.subject

            JwtToken(
                tokenId = tokenId,
                userId = userId,
                expiresAt = expiresAt,
                issuedAt = issuedAt,
                subject = subject
            )
        } catch (e: JwtTokenMissingClaimsException) {
            throw e
        } catch (e: Exception) {
            throw JwtTokenInvalidException("Failed to decode JWT: ${e.message}")
        }
    }
}