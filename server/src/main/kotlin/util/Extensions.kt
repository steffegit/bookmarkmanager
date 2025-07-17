package me.atsteffe.util

import io.ktor.http.Parameters
import io.ktor.server.plugins.*
import java.util.UUID

/**
 * Safely converts a string to UUID, returning null if invalid
 */
fun String.toUUIDOrNull(): UUID? = try {
    UUID.fromString(this)
} catch (e: IllegalArgumentException) {
    null
}

/**
 * Converts a string to UUID, throwing meaningful exception if invalid
 */
fun String.toUUID(): UUID = try {
    UUID.fromString(this)
} catch (e: IllegalArgumentException) {
    throw IllegalArgumentException("Invalid UUID format: $this")
}

/**
 * Extension for path parameters that should be UUIDs
 */
fun String?.requireUUID(paramName: String): UUID {
    if (this == null) throw IllegalArgumentException("$paramName is required")
    return this.toUUID()
}

/**
 * Extension for Ktor Parameters to extract UUID path parameters
 */
fun Parameters.requireUUID(paramName: String): UUID {
    val value = this[paramName] ?: throw BadRequestException("Parameter $paramName is required")
    return value.toUUID()
} 