package me.atsteffe

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import me.atsteffe.model.BookmarkRequest
import me.atsteffe.model.LoginRequest
import me.atsteffe.model.RegisterRequest
import me.atsteffe.model.AuthResponse
import me.atsteffe.model.toResponse
import java.util.UUID


fun Application.configureRouting() {
    routing {
        post("/api/register") {
            val registerRequest = call.receive<RegisterRequest>()
            val user = userService.registerUser(
                registerRequest.email,
                registerRequest.password,
                registerRequest.displayName
            )
            val token = jwtService.generateToken(user.id.toString())
            call.respond(HttpStatusCode.Created, AuthResponse(token, user.toResponse()))
        }

        post("/api/login") {
            val loginRequest = call.receive<LoginRequest>()
            val user = userService.authenticateUser(loginRequest.email, loginRequest.password)

            if (user != null) {
                val token = jwtService.generateToken(user.id.toString())
                call.respond(HttpStatusCode.OK, AuthResponse(token, user.toResponse()))
            } else {
                call.respond(HttpStatusCode.Unauthorized, mapOf("error" to "Invalid credentials"))
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

                val bookmarkRequest = call.receive<BookmarkRequest>()
                val newBookmark = bookmarkService.createBookmark(
                    UUID.fromString(userId),
                    bookmarkRequest.url,
                    bookmarkRequest.title,
                    bookmarkRequest.description
                )
                call.respond(HttpStatusCode.Created, newBookmark.toResponse())
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

                val updatedBookmark = bookmarkService.updateBookmark(
                    id,
                    UUID.fromString(userId),
                    bookmarkUpdate.url,
                    bookmarkUpdate.title,
                    bookmarkUpdate.description
                )
                call.respond(HttpStatusCode.OK, updatedBookmark.toResponse())
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

                val isBookmarkDeleted: Boolean = bookmarkService.deleteBookmark(id, UUID.fromString(userId))

                if (isBookmarkDeleted) {
                    call.respond(HttpStatusCode.NoContent, "Bookmark with ID $id successfully deleted.")
                } else {
                    call.respond(HttpStatusCode.NotFound, "Bookmark not found or could not be deleted.")
                }
            }
        }
    }
}
