package me.atsteffe.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import me.atsteffe.service.BookmarkService
import me.atsteffe.service.CategorizeService
import me.atsteffe.util.JwtPrincipalInvalidException
import me.atsteffe.util.getUserIdFromJWT
import org.koin.ktor.ext.inject

fun Route.categorizeRoutes() {
    post("/bookmarks/categorize") {
        val bookmarkService by inject<BookmarkService>()
        val categorizeService by inject<CategorizeService>()
        val userId = call.getUserIdFromJWT() ?: throw JwtPrincipalInvalidException()

        val bookmarks = bookmarkService.getAllBookmarks(userId)
        val result = categorizeService.categorize(bookmarks)
        call.respond(HttpStatusCode.OK, result)
    }
}
