package me.atsteffe

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.html.respondHtml
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.html.HTML
import kotlinx.html.head
import kotlinx.html.link
import kotlinx.html.script
import kotlinx.html.title
import me.atsteffe.routes.authRoutes
import me.atsteffe.routes.bookmarkRoutes


fun Application.configureRouting() {
    routing {

        // HTML

        get("/") {
            call.respondHtml {
                index()
            }
        }

        // API

        route("/api") {
            authRoutes()

            authenticate {
                bookmarkRoutes()
            }
        }
    }
}

fun HTML.index() {
    head {
        title {
            +"Bookmark Manager"
        }
        // HTMX
        script {
            src = "https://cdn.jsdelivr.net/npm/htmx.org@2.0.6/dist/htmx.min.js"
        }

        // Tailwind CSS
        script {
            src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
        }

        // DaisyUI
        script {
            src = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
        }
        link {
            href = "https://cdn.jsdelivr.net/npm/daisyui@5"
            rel = "stylesheet"
            type = "text/css"
        }
    }
}
