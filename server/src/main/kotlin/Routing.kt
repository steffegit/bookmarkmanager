package me.atsteffe

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import me.atsteffe.model.Bookmark
import me.atsteffe.model.BookmarkRequest
import me.atsteffe.model.BookmarkResponse
import me.atsteffe.model.LoginRequest
import me.atsteffe.model.RegisterRequest
import me.atsteffe.model.AuthResponse
import me.atsteffe.model.toResponse
import me.atsteffe.service.JwtService
import me.atsteffe.util.BookmarkNotFoundException
import me.atsteffe.util.DuplicateBookmarkUrlException
import me.atsteffe.util.InvalidUrlException
import java.util.UUID


fun Application.configureRouting() {
    val jwtSecret = environment.config.property("jwt.secret").getString()
    val jwtDomain = environment.config.property("jwt.issuer").getString()
    val jwtAudience = environment.config.property("jwt.audience").getString()

    val jwtService = JwtService(jwtSecret, jwtDomain, jwtAudience)

    routing {
        post("/api/register") {
            try {
                val registerRequest = call.receive<RegisterRequest>()
                val user = userService.registerUser(
                    registerRequest.email,
                    registerRequest.password,
                    registerRequest.displayName
                )
                val token = jwtService.generateToken(user.id.toString())
                call.respond(HttpStatusCode.Created, AuthResponse(token, user))
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Registration failed")))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Registration failed: ${e.message}"))
            }
        }

        post("/api/login") {
            try {
                val loginRequest = call.receive<LoginRequest>()
                val user = userService.authenticateUser(loginRequest.email, loginRequest.password)

                if (user != null) {
                    val token = jwtService.generateToken(user.id.toString())
                    call.respond(HttpStatusCode.OK, AuthResponse(token, user))
                } else {
                    call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid credentials"))
                }
            } catch (e: IllegalArgumentException) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Login failed")))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, mapOf("error" to "Login failed: ${e.message}"))
            }
        }

        authenticate {
            get("/api/bookmarks") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asString()
                val bookmarks = bookmarkService.getAllBookmarks(UUID.fromString(userId))
                call.respond(bookmarks.map { it.toResponse() })
            }

            post("/api/bookmarks") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asString()

                println("User ID is $userId")
                val bookmarkRequest = call.receive<BookmarkRequest>()

                println("bookamrkRequest: $bookmarkRequest")

                try {
                    val newBookmark = bookmarkService.createBookmark(
                        UUID.fromString(userId),
                        bookmarkRequest.url,
                        bookmarkRequest.title,
                        bookmarkRequest.description
                    )
                    call.respond(HttpStatusCode.Created, newBookmark.toResponse())
                } catch (e: InvalidUrlException) {
                    call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Invalid URL")))
                } catch (e: DuplicateBookmarkUrlException) {
                    call.respond(HttpStatusCode.Conflict, mapOf("error" to (e.message ?: "Duplicate URL")))
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        mapOf("error" to "Failed to create bookmark: ${e.message}")
                    )
                }
            }

            put("/api/bookmarks/{id}") {
                val requestId =
                    call.parameters["id"] ?: return@put call.respond(HttpStatusCode.BadRequest, "ID is required.")

                val id = try {
                    UUID.fromString(requestId)
                } catch (e: Exception) {
                    return@put call.respond(HttpStatusCode.BadRequest, "Invalid ID format.")
                }

                val bookmarkUpdate = call.receive<BookmarkRequest>()
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asString()

                try {
                    val updatedBookmark = bookmarkService.updateBookmark(
                        id,
                        UUID.fromString(userId),
                        bookmarkUpdate.url,
                        bookmarkUpdate.title,
                        bookmarkUpdate.description
                    )
                    call.respond(HttpStatusCode.OK, updatedBookmark.toResponse())
                } catch (e: BookmarkNotFoundException) {
                    return@put call.respond(
                        HttpStatusCode.NotFound,
                        mapOf("error" to (e.message ?: "Bookmark not found"))
                    )
                } catch (e: InvalidUrlException) {
                    return@put call.respond(HttpStatusCode.BadRequest, mapOf("error" to (e.message ?: "Invalid URL")))
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        mapOf("error" to "Failed to update bookmark: ${e.message}")
                    )
                }
            }

            delete("/api/bookmarks/{id}") {
                val requestId =
                    call.parameters["id"] ?: return@delete call.respond(HttpStatusCode.BadRequest, "ID is required.")

                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asString()

                val id = try {
                    UUID.fromString(requestId)
                } catch (e: Exception) {
                    return@delete call.respond(HttpStatusCode.BadRequest, "Invalid ID format.")
                }

                try {
                    val isBookmarkDeleted: Boolean = bookmarkService.deleteBookmark(id, UUID.fromString(userId))

                    if (isBookmarkDeleted) {
                        call.respond(HttpStatusCode.NoContent, "Bookmark with ID $id successfully deleted.")
                    } else {
                        call.respond(HttpStatusCode.NotFound, "Bookmark not found or could not be deleted.")
                    }
                } catch (e: BookmarkNotFoundException) {
                    call.respond(HttpStatusCode.NotFound, mapOf("error" to (e.message ?: "Bookmark not found")))
                } catch (e: Exception) {
                    call.respond(
                        HttpStatusCode.InternalServerError,
                        mapOf("error" to "Failed to delete bookmark: ${e.message}")
                    )
                }
            }
        }
    }
}
