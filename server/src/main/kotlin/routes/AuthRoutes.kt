package me.atsteffe.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import me.atsteffe.command.toCommand
import me.atsteffe.model.AuthResponse
import me.atsteffe.model.LoginRequest
import me.atsteffe.model.RegisterRequest
import me.atsteffe.model.toResponse
import me.atsteffe.service.AuthenticationService
import me.atsteffe.service.JwtService
import me.atsteffe.service.UserService
import org.koin.ktor.ext.inject

fun Route.authRoutes() {
    route("/auth") {
        loginRoute()
        registerRoute()
    }
}

fun Route.loginRoute() {
    post("/login") {
        val authenticationService by inject<AuthenticationService>()
        val jwtService by inject<JwtService>()

        val loginRequest = call.receive<LoginRequest>()
        val command = loginRequest.toCommand()
        val user = authenticationService.authenticateUser(command)

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
        val userService by inject<UserService>()
        val jwtService by inject<JwtService>()
        
        val registerRequest = call.receive<RegisterRequest>()
        val command = registerRequest.toCommand()
        val user = userService.registerUser(command)
        val token = jwtService.generateToken(user.id.toString())
        call.respond(HttpStatusCode.Created, AuthResponse(token, user.toResponse()))
    }
}