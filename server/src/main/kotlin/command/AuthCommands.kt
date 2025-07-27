package me.atsteffe.command

import me.atsteffe.model.LoginRequest
import me.atsteffe.model.SignupRequest
import me.atsteffe.util.Email

data class LoginCommand(
    val email: Email,
    val password: String
)

data class SignupCommand(
    val email: Email,
    val password: String,
    val displayName: String?
)

fun LoginRequest.toCommand(): LoginCommand {
    return LoginCommand(
        email = Email(this.email),
        password = this.password
    )
}

fun SignupRequest.toCommand(): SignupCommand {
    return SignupCommand(
        email = Email(this.email),
        password = this.password,
        displayName = this.displayName
    )
} 