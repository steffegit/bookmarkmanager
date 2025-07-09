package me.atsteffe

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.html.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.html.*
import me.atsteffe.model.Bookmark
import me.atsteffe.util.DuplicateBookmarkUrlException
import me.atsteffe.util.InvalidUrlException
import org.jetbrains.exposed.sql.*


fun Application.configureRouting() {
    routing {
        get("/api/bookmarks") {
            val bookmarks = bookmarkService.getAllBookmarks()
            call.respond(bookmarks)
        }

        post("/api/bookmarks") {
            val bookmarkRequest = call.receive<Bookmark>()

            try {
                val newBookmark = bookmarkService.createBookmark(
                    bookmarkRequest.url,
                    bookmarkRequest.title,
                    bookmarkRequest.description
                )
                call.respond(HttpStatusCode.Created, newBookmark)
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
    }
}
