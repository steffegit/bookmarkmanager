package me.atsteffe

import io.ktor.server.application.*
import io.ktor.server.auth.authenticate
import io.ktor.server.routing.*
import me.atsteffe.routes.authRoutes
import me.atsteffe.routes.bookmarkRoutes
import me.atsteffe.routes.profileRoutes


fun Application.configureRouting() {
    routing {
        route("/api") {
            authRoutes()

            authenticate {
                bookmarkRoutes()
                profileRoutes()
            }
        }
    }
}
