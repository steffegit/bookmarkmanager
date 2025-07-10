package me.atsteffe

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import me.atsteffe.model.Bookmark
import me.atsteffe.util.BookmarkNotFoundException
import me.atsteffe.util.DuplicateBookmarkUrlException
import me.atsteffe.util.InvalidUrlException
import java.util.UUID


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

        put("/api/bookmarks/{id}") {
            val requestId =
                call.parameters["id"] ?: return@put call.respond(HttpStatusCode.BadRequest, "ID is required.")

            val id = try {
                UUID.fromString(requestId)
            } catch (e: Exception) {
                return@put call.respond(HttpStatusCode.BadRequest, "Invalid ID format.")
            }

            val bookmarkUpdate = call.receive<Bookmark>()

            try {
                val updatedBookmark = bookmarkService.updateBookmark(
                    id,
                    bookmarkUpdate.url,
                    bookmarkUpdate.title,
                    bookmarkUpdate.description
                )
                call.respond(HttpStatusCode.OK, updatedBookmark)
            } catch (e: BookmarkNotFoundException) {
                return@put call.respond(HttpStatusCode.NotFound, mapOf("error" to (e.message ?: "Bookmark not found")))
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

            val id = try {
                UUID.fromString(requestId)
            } catch (e: Exception) {
                return@delete call.respond(HttpStatusCode.BadRequest, "Invalid ID format.")
            }

            try {
                val isBookmarkDeleted: Boolean = bookmarkService.deleteBookmark(id)

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
