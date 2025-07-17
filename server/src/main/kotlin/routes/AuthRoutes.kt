package me.atsteffe.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import io.ktor.server.routing.routing
import me.atsteffe.jwtService
import me.atsteffe.model.AuthResponse
import me.atsteffe.model.LoginRequest
import me.atsteffe.model.RegisterRequest
import me.atsteffe.model.toResponse
import me.atsteffe.userService

fun Route.authRoutes() {
    route("/auth") {
        loginRoute()
        registerRoute()
    }
}

fun Route.loginRoute() {
    post("/login") {
        val loginRequest = call.receive<LoginRequest>()
        val user = userService.authenticateUser(loginRequest.email, loginRequest.password)

        if (user != null) {
            val token = jwtService.generateToken(user.id.toString())
            call.respond(HttpStatusCode.OK, AuthResponse(token, user.toResponse()))
        } else {
            call.respond(HttpStatusCode.Unauthorized, mapOf("message" to "Invalid credentials"))
        }
    }
}

fun Route.registerRoute() {
    post("/register") {
        val registerRequest = call.receive<RegisterRequest>()
        val user = userService.registerUser(
            registerRequest.email,
            registerRequest.password,
            registerRequest.displayName
        )
        val token = jwtService.generateToken(user.id.toString())
        call.respond(HttpStatusCode.Created, AuthResponse(token, user.toResponse()))
    }
}