package me.atsteffe.service

import me.atsteffe.command.LoginCommand
import me.atsteffe.model.User
import me.atsteffe.repository.UserRepository
import me.atsteffe.util.InvalidCredentials
import me.atsteffe.util.PasswordUtils
import me.atsteffe.util.UnsupportedAuthenticationMethod

class AuthenticationService(
    private val userRepository: UserRepository
) {
    fun authenticateUser(command: LoginCommand): User? {
        val user = userRepository.findByEmail(command.email.toString()) ?: return null

        val storedHash = user.passwordHash
            ?: throw UnsupportedAuthenticationMethod("User ${command.email} was registered through OAuth and cannot authenticate with password.")

        val isValid = PasswordUtils.validatePassword(storedHash, command.password)

        return if (isValid) {
            user
        } else {
            null
        }
    }
} 