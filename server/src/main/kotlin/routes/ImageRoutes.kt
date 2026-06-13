package me.atsteffe.routes

import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.response.respond
import io.ktor.server.response.respondBytes
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import me.atsteffe.service.ImageProxyService
import org.koin.ktor.ext.inject

fun Route.imageRoutes() {
    get("/image") {
        val imageProxy by inject<ImageProxyService>()
        val url = call.request.queryParameters["url"]

        if (url.isNullOrBlank()) {
            call.respond(HttpStatusCode.BadRequest, "Missing url parameter")
            return@get
        }

        val image = imageProxy.fetch(url)
        if (image == null) {
            call.respond(HttpStatusCode.NotFound)
            return@get
        }

        // Long-lived caching: images are immutable for our purposes.
        call.response.headers.append(
            HttpHeaders.CacheControl,
            "public, max-age=2592000, immutable",
        )
        call.respondBytes(
            bytes = image.bytes,
            contentType = ContentType.parse(image.contentType),
        )
    }
}
