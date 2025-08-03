package me.atsteffe.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.auth.authenticate
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import me.atsteffe.command.toCommand
import me.atsteffe.model.AuthResponse
import me.atsteffe.model.LoginRequest
import me.atsteffe.model.SignupRequest
import me.atsteffe.model.toResponse
import me.atsteffe.service.AuthenticationService
import me.atsteffe.service.JwtService
import me.atsteffe.service.UserService
import me.atsteffe.util.JwtPrincipalInvalidException
import me.atsteffe.util.extractBearerTokenOrThrow
import me.atsteffe.util.getUserIdFromJWT
import org.koin.ktor.ext.inject

fun Route.authRoutes() {
    route("/auth") {
        loginRoute()
        signupRoute()

        authenticate {
            logoutRoute()
            refreshTokenRoute()
            verifyTokenRoute()
        }
    }
}

fun Route.loginRoute() {
    post("/login") {
        val authenticationService by inject<AuthenticationService>()
        val jwtService by inject<JwtService>()

        val loginRequest = call.receive<LoginRequest>()
        val command = loginRequest.toCommand()
        val user = authenticationService.authenticateUser(command) ?: return@post call.respond(
            HttpStatusCode.Unauthorized,
            mapOf("message" to "Invalid credentials")
        )

        val token = jwtService.generateToken(user.id.toString())
        call.respond(HttpStatusCode.OK, AuthResponse(token, user.toResponse()))
    }
}

fun Route.signupRoute() {
    post("/signup") {
        val userService by inject<UserService>()
        val jwtService by inject<JwtService>()

        val registerRequest = call.receive<SignupRequest>()
        val command = registerRequest.toCommand()
        val user = userService.signupUser(command)
        val token = jwtService.generateToken(user.id.toString())

        call.respond(HttpStatusCode.Created, AuthResponse(token, user.toResponse()))
    }
}

fun Route.logoutRoute() {
    post("/logout") {
        val jwtService by inject<JwtService>()
        val token = call.extractBearerTokenOrThrow()

        jwtService.invalidateToken(token)
        call.respond(HttpStatusCode.OK, mapOf("message" to "Successfully logged out"))
    }
}

fun Route.refreshTokenRoute() {
    post("/refresh") {
        val jwtService by inject<JwtService>()
        val oldToken = call.extractBearerTokenOrThrow()

        val newToken = jwtService.refreshToken(oldToken)
        call.respond(HttpStatusCode.OK, mapOf("token" to newToken))
    }
}

fun Route.verifyTokenRoute() {
    post("/verify") {
        val userService by inject<UserService>()

        // For authenticated routes, we can use the JWT principal directly
        val userId = call.getUserIdFromJWT() ?: throw JwtPrincipalInvalidException()

        val user = userService.findById(userId)
        if (user != null) {
            call.respond(
                HttpStatusCode.OK, mapOf(
                    "valid" to true,
                )
            )
        } else {
            call.respond(
                HttpStatusCode.Unauthorized, mapOf(
                    "valid" to false,
                )
            )
        }
    }
}