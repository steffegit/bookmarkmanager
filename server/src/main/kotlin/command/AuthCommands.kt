package me.atsteffe.command

import me.atsteffe.model.LoginRequest
import me.atsteffe.model.RegisterRequest
import me.atsteffe.util.Email

data class LoginCommand(
    val email: Email,
    val password: String
)

data class RegisterCommand(
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

fun RegisterRequest.toCommand(): RegisterCommand {
    return RegisterCommand(
        email = Email(this.email),
        password = this.password,
        displayName = this.displayName
    )
} 