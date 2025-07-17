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
import me.atsteffe.util.toUUID
import me.atsteffe.util.requireUUID
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
                val userId = principal!!.payload.getClaim("userId").asString().toUUID()
                val bookmarks = bookmarkService.getAllBookmarks(userId)
                call.respond(bookmarks.map { it.toResponse() })
            }

            post("/api/bookmarks") {
                val principal = call.principal<JWTPrincipal>()
                val userId = principal!!.payload.getClaim("userId").asString().toUUID()

                val bookmarkRequest = call.receive<BookmarkRequest>()
                val newBookmark = bookmarkService.createBookmark(
                    userId,
                    bookmarkRequest.url,
                    bookmarkRequest.title,
                    bookmarkRequest.description
                )
                call.respond(HttpStatusCode.Created, newBookmark.toResponse())
            }

            put("/api/bookmarks/{id}") {
                val id = call.parameters.requireUUID("id")
                val userId = call.principal<JWTPrincipal>()!!.payload.getClaim("userId").asString().toUUID()
                val bookmarkUpdate = call.receive<BookmarkRequest>()

                val updatedBookmark = bookmarkService.updateBookmark(
                    id,
                    userId,
                    bookmarkUpdate.url,
                    bookmarkUpdate.title,
                    bookmarkUpdate.description
                )
                call.respond(HttpStatusCode.OK, updatedBookmark.toResponse())
            }

            delete("/api/bookmarks/{id}") {
                val id = call.parameters.requireUUID("id")
                val userId = call.principal<JWTPrincipal>()!!.payload.getClaim("userId").asString().toUUID()

                val isBookmarkDeleted = bookmarkService.deleteBookmark(id, userId)

                if (isBookmarkDeleted) {
                    call.respond(HttpStatusCode.NoContent, "Bookmark with ID $id successfully deleted.")
                } else {
                    call.respond(HttpStatusCode.NotFound, "Bookmark not found or could not be deleted.")
                }
            }
        }
    }
}
