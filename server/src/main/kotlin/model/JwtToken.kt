package me.atsteffe.model

import java.time.LocalDateTime
import java.util.UUID

data class JwtToken(
    val tokenId: String,        // JWT ID (jti claim)
    val userId: UUID,           // User ID from JWT claims
    val expiresAt: LocalDateTime, // When the token expires
    val issuedAt: LocalDateTime? = null, // When the token was issued (optional)
    val subject: String? = null  // JWT subject (optional)
)

data class BlacklistedToken(
    val tokenId: String,
    val userId: UUID,
    val expiresAt: LocalDateTime,
    val invalidatedAt: LocalDateTime
) 

sealed class TokenResult {
    data class Success(val token: String) : TokenResult()
    data object Missing : TokenResult()
    data object Invalid : TokenResult()
}