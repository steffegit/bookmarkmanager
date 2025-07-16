package me.atsteffe.service

import me.atsteffe.model.User
import me.atsteffe.repository.UserRepository
import me.atsteffe.util.PasswordUtils
import java.util.UUID

class UserService(private val userRepository: UserRepository) {
    fun findById(id: UUID): User? = userRepository.findById(id)

    fun findByEmail(email: String): User? = userRepository.findByEmail(email)

    fun registerUser(email: String, password: String, displayName: String?): User {
        println("DEBUG: Attempting to register user with email: $email")
        
        val existingUser = userRepository.findByEmail(email)

        if (existingUser != null) {
            println("DEBUG: User with email $email already exists")
            throw IllegalArgumentException("User with email $email already exists.")
        }

        val passwordHash = PasswordUtils.hashPassword(password)
        val user = User(
            email = email,
            passwordHash = passwordHash,
            displayName = displayName
        )

        println("DEBUG: Saving user with email: $email")
        return userRepository.save(user)
    }

    fun authenticateUser(email: String, password: String): User? {
        println("DEBUG: Attempting to authenticate user with email: $email")
        
        val user = userRepository.findByEmail(email)
        if (user == null) {
            println("DEBUG: User not found with email: $email")
            throw IllegalArgumentException("Could not find user with $email.")
        }
        
        val storedHash = user.passwordHash
        if (storedHash == null) {
            println("DEBUG: User found but no password hash for email: $email")
            throw IllegalArgumentException("Something went wrong.")
        }

        println("DEBUG: Found user with email: $email, validating password...")
        val isValid = PasswordUtils.validatePassword(storedHash, password)
        
        return if (isValid) {
            println("DEBUG: Password validation successful for email: $email")
            user
        } else {
            println("DEBUG: Password validation failed for email: $email")
            null
        }
    }
}