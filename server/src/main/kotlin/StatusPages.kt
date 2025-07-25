package me.atsteffe

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import me.atsteffe.util.BookmarkNotFoundException
import me.atsteffe.util.DuplicateBookmarkUrlException
import me.atsteffe.util.InvalidCredentials
import me.atsteffe.util.InvalidEmailException
import me.atsteffe.util.InvalidUrlException
import me.atsteffe.util.JwtException
import me.atsteffe.util.JwtPrincipalInvalidException
import me.atsteffe.util.JwtTokenBlacklistedException
import me.atsteffe.util.JwtTokenInvalidException
import me.atsteffe.util.JwtTokenInvalidFormatException
import me.atsteffe.util.JwtTokenMissingException
import me.atsteffe.util.JwtTokenMissingClaimsException
import me.atsteffe.util.JwtTokenRefreshFailedException
import me.atsteffe.util.UnsupportedAuthenticationMethod
import me.atsteffe.util.UserAlreadyExists

fun Application.configureStatusPages() {
    install(StatusPages) {

        // Authentication and authorization exceptions

        exception<InvalidCredentials> { call, cause ->
            call.respond(HttpStatusCode.Unauthorized, mapOf("message" to (cause.message ?: "Invalid credentials")))
        }

        exception<UnsupportedAuthenticationMethod> { call, cause ->
            call.respond(
                HttpStatusCode.BadRequest,
                mapOf("message" to (cause.message ?: "Unsupported authentication method"))
            )
        }

        exception<UserAlreadyExists> { call, cause ->
            call.respond(HttpStatusCode.Conflict, mapOf("message" to (cause.message ?: "User already exists")))
        }

        // JWT exceptions

        exception<JwtTokenMissingException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, mapOf("message" to cause.message))
        }

        exception<JwtTokenInvalidFormatException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, mapOf("message" to cause.message))
        }

        exception<JwtTokenBlacklistedException> { call, cause ->
            call.respond(HttpStatusCode.Unauthorized, mapOf("message" to cause.message))
        }

        exception<JwtTokenInvalidException> { call, cause ->
            call.respond(HttpStatusCode.Unauthorized, mapOf("message" to cause.message))
        }

        exception<JwtTokenMissingClaimsException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, mapOf("message" to cause.message))
        }

        exception<JwtTokenRefreshFailedException> { call, cause ->
            call.respond(HttpStatusCode.Unauthorized, mapOf("message" to cause.message))
        }

        exception<JwtPrincipalInvalidException> { call, cause ->
            call.respond(HttpStatusCode.Unauthorized, mapOf("message" to cause.message))
        }

        // Generic JWT exception fallback
        exception<JwtException> { call, cause ->
            call.respond(HttpStatusCode.Unauthorized, mapOf("message" to (cause.message ?: "JWT authentication error")))
        }

        // Bookmark-related exceptions

        exception<BookmarkNotFoundException> { call, cause ->
            call.respond(HttpStatusCode.NotFound, mapOf("message" to (cause.message ?: "Bookmark not found")))
        }

        exception<DuplicateBookmarkUrlException> { call, cause ->
            call.respond(HttpStatusCode.Conflict, mapOf("message" to (cause.message ?: "Duplicate URL")))
        }

        exception<InvalidUrlException> { call, cause ->
            call.respond(HttpStatusCode.UnprocessableEntity, mapOf("message" to (cause.message ?: "Invalid URL")))
        }

        exception<InvalidEmailException> { call, cause ->
            call.respond(HttpStatusCode.UnprocessableEntity, mapOf("message" to (cause.message ?: "Invalid email")))
        }

        // General exceptions

        exception<IllegalArgumentException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, mapOf("message" to (cause.message ?: "Bad request")))
        }

        exception<IllegalStateException> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                mapOf("message" to (cause.message ?: "Internal server error"))
            )
        }

        // Catch-all exception

        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                mapOf("message" to "Internal server error: ${cause.message}")
            )
        }
    }
} 