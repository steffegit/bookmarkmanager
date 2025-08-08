package me.atsteffe.service

import me.atsteffe.command.SignupCommand
import me.atsteffe.model.User
import me.atsteffe.repository.UserRepository
import me.atsteffe.util.PasswordUtils
import me.atsteffe.util.UserAlreadyExists
import java.util.UUID

class UserService(private val userRepository: UserRepository) {
    fun findById(id: UUID): User? = userRepository.findById(id)

    fun findByEmail(email: String): User? = userRepository.findByEmail(email)

    fun signupUser(command: SignupCommand): User {

        userRepository.findByEmail(command.email.toString())
            ?.let { throw UserAlreadyExists("User with email ${command.email} already exists.") }

        val passwordHash = PasswordUtils.hashPassword(command.password)
        val emailPrefix = command.email.toString().substringBefore("@")
        val user = User(
            email = command.email.toString(),
            passwordHash = passwordHash,
            displayName = command.displayName ?: emailPrefix
        )

        return userRepository.save(user)
    }

    fun updateUser(user: User): User {
        return userRepository.save(user)
    }

}