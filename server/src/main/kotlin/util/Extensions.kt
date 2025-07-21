package me.atsteffe.util

import io.ktor.http.Parameters
import io.ktor.server.application.ApplicationCall
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.plugins.*
import io.ktor.server.request.header
import me.atsteffe.model.TokenResult
import java.util.UUID

fun String.toUUIDOrNull(): UUID? = try {
    UUID.fromString(this)
} catch (e: IllegalArgumentException) {
    null
}

fun String.toUUID(): UUID = try {
    UUID.fromString(this)
} catch (e: IllegalArgumentException) {
    throw IllegalArgumentException("Invalid UUID format: $this")
}

fun String?.requireUUID(paramName: String): UUID {
    if (this == null) throw IllegalArgumentException("$paramName is required")
    return this.toUUID()
}

fun Parameters.requireUUID(paramName: String): UUID {
    val value = this[paramName] ?: throw BadRequestException("Parameter $paramName is required")
    return value.toUUID()
}

fun ApplicationCall.extractBearerToken(): TokenResult {
    val authHeader = request.header("Authorization")
        ?: return TokenResult.Missing

    if (!authHeader.startsWith("Bearer ", ignoreCase = true)) {
        return TokenResult.Invalid
    }

    val token = authHeader.removePrefix("Bearer ").trim()
    return if (token.isNotEmpty()) {
        TokenResult.Success(token)
    } else {
        TokenResult.Invalid
    }
}

fun ApplicationCall.extractBearerTokenOrThrow(): String {
    return when (val result = extractBearerToken()) {
        is TokenResult.Success -> result.token
        is TokenResult.Missing -> throw JwtTokenMissingException()
        is TokenResult.Invalid -> throw JwtTokenInvalidFormatException()
    }
}

fun ApplicationCall.getUserIdFromJWT(): UUID? {
    return principal<JWTPrincipal>()
        ?.payload
        ?.getClaim("userId")
        ?.asString()
        ?.toUUIDOrNull()
} 