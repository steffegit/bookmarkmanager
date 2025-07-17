package me.atsteffe.service

import me.atsteffe.model.User
import me.atsteffe.repository.UserRepository
import me.atsteffe.util.PasswordUtils
import me.atsteffe.util.UserAlreadyExists
import me.atsteffe.util.InvalidCredentials
import me.atsteffe.util.UnsupportedAuthenticationMethod
import java.util.UUID

class UserService(private val userRepository: UserRepository) {
    fun findById(id: UUID): User? = userRepository.findById(id)

    fun findByEmail(email: String): User? = userRepository.findByEmail(email)

    fun registerUser(email: String, password: String, displayName: String?): User {

        val existingUser = userRepository.findByEmail(email)

        if (existingUser != null) {
            throw UserAlreadyExists("User with email $email already exists.")
        }

        val passwordHash = PasswordUtils.hashPassword(password)
        val user = User(
            email = email,
            passwordHash = passwordHash,
            displayName = displayName
        )

        return userRepository.save(user)
    }

    fun authenticateUser(email: String, password: String): User? {

        val user = userRepository.findByEmail(email)
        if (user == null) {
            throw InvalidCredentials("Invalid credentials.")
        }

        val storedHash = user.passwordHash
        if (storedHash == null) {
            // User was created using OAuth
            throw UnsupportedAuthenticationMethod("User $email was registered through OAuth and cannot authenticate with password.")
        }

        val isValid = PasswordUtils.validatePassword(storedHash, password)

        return if (isValid) {
            user
        } else {
            null
        }
    }
}