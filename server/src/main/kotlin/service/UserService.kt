package me.atsteffe.service

import me.atsteffe.command.RegisterCommand
import me.atsteffe.model.User
import me.atsteffe.repository.UserRepository
import me.atsteffe.util.PasswordUtils
import me.atsteffe.util.UserAlreadyExists
import java.util.UUID

class UserService(private val userRepository: UserRepository) {
    fun findById(id: UUID): User? = userRepository.findById(id)

    fun findByEmail(email: String): User? = userRepository.findByEmail(email)

    fun registerUser(command: RegisterCommand): User {

        val existingUser = userRepository.findByEmail(command.email.toString())

        if (existingUser != null) {
            throw UserAlreadyExists("User with email ${command.email} already exists.")
        }

        val passwordHash = PasswordUtils.hashPassword(command.password)
        val user = User(
            email = command.email.toString(),
            passwordHash = passwordHash,
            displayName = command.displayName
        )

        return userRepository.save(user)
    }


}