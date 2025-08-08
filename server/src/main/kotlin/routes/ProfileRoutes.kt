package me.atsteffe.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.route
import me.atsteffe.command.toCommand
import me.atsteffe.model.ChangePasswordRequest
import me.atsteffe.model.toResponse
import me.atsteffe.service.UserProfileService
import me.atsteffe.util.getUserIdFromJWT
import me.atsteffe.util.JwtPrincipalInvalidException
import org.koin.ktor.ext.inject

fun Route.profileRoutes() {
    route("/profile") {
        changePasswordRoute()
    }
}

fun Route.changePasswordRoute() {
    post("/change-password") {
        val userProfileService by inject<UserProfileService>()
        val userId = call.getUserIdFromJWT() ?: throw JwtPrincipalInvalidException()

        val changePasswordRequest = call.receive<ChangePasswordRequest>()
        val command = changePasswordRequest.toCommand(userId)
        val updatedUser = userProfileService.updatePassword(command)

        call.respond(HttpStatusCode.OK, updatedUser.toResponse())
    }
}