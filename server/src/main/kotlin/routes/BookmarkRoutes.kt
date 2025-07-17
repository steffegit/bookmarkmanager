package me.atsteffe.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import me.atsteffe.bookmarkService
import me.atsteffe.model.BookmarkRequest
import me.atsteffe.model.toResponse
import me.atsteffe.util.requireUUID
import me.atsteffe.util.toUUID

fun Route.bookmarkRoutes() {
    route("/bookmarks") {
        createBookmark()
        getBookmarks()
        updateBookmark()
        deleteBookmark()
    }
}

fun Route.createBookmark() {
    post {
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
}

fun Route.getBookmarks() {
    get {
        val principal = call.principal<JWTPrincipal>()
        val userId = principal!!.payload.getClaim("userId").asString().toUUID()
        val bookmarks = bookmarkService.getAllBookmarks(userId)
        call.respond(bookmarks.map { it.toResponse() })
    }
}

fun Route.updateBookmark() {
    put("/{id}") {
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
}

fun Route.deleteBookmark() {
    delete("/{id}") {
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