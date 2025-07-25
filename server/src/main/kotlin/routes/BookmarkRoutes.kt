package me.atsteffe.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.route
import me.atsteffe.command.toCreateCommand
import me.atsteffe.command.toUpdateCommand
import me.atsteffe.model.BookmarkRequest
import me.atsteffe.model.toResponse
import me.atsteffe.service.BookmarkService
import me.atsteffe.util.JwtPrincipalInvalidException
import me.atsteffe.util.getUserIdFromJWT
import me.atsteffe.util.requireUUID
import org.koin.ktor.ext.inject

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
        val bookmarkService by inject<BookmarkService>()
        val userId = call.getUserIdFromJWT() ?: throw JwtPrincipalInvalidException()

        val bookmarkRequest = call.receive<BookmarkRequest>()
        val command = bookmarkRequest.toCreateCommand(userId)
        val newBookmark = bookmarkService.createBookmark(command)

        call.respond(HttpStatusCode.Created, newBookmark.toResponse())
    }
}

fun Route.getBookmarks() {
    get {
        val bookmarkService by inject<BookmarkService>()
        val userId = call.getUserIdFromJWT() ?: throw JwtPrincipalInvalidException()
        
        val bookmarks = bookmarkService.getAllBookmarks(userId)
        call.respond(bookmarks.map { it.toResponse() })
    }
}

fun Route.updateBookmark() {
    put("/{id}") {
        val bookmarkService by inject<BookmarkService>()
        val id = call.parameters.requireUUID("id")
        val userId = call.getUserIdFromJWT() ?: throw JwtPrincipalInvalidException()
        
        val bookmarkUpdate = call.receive<BookmarkRequest>()
        val command = bookmarkUpdate.toUpdateCommand(id, userId)
        val updatedBookmark = bookmarkService.updateBookmark(command)
        
        call.respond(HttpStatusCode.OK, updatedBookmark.toResponse())
    }
}

fun Route.deleteBookmark() {
    delete("/{id}") {
        val bookmarkService by inject<BookmarkService>()
        val id = call.parameters.requireUUID("id")
        val userId = call.getUserIdFromJWT() ?: throw JwtPrincipalInvalidException()

        val isBookmarkDeleted = bookmarkService.deleteBookmark(id, userId)

        if (isBookmarkDeleted) {
            call.respond(HttpStatusCode.NoContent, "Bookmark with ID $id successfully deleted.")
        } else {
            call.respond(HttpStatusCode.NotFound, "Bookmark not found or could not be deleted.")
        }
    }
}