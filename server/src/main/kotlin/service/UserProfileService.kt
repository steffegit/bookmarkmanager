package me.atsteffe.service

import me.atsteffe.command.ChangePasswordCommand
import me.atsteffe.model.User
import me.atsteffe.util.InvalidCredentials
import me.atsteffe.util.PasswordUtils

class UserProfileService(private val userService: UserService) {
    fun updatePassword(changePasswordCommand: ChangePasswordCommand): User {
        val user = userService.findById(changePasswordCommand.userId)
            ?: throw IllegalArgumentException("User with ID ${changePasswordCommand.userId} not found.")

        if (!PasswordUtils.validatePassword(user.passwordHash!!, changePasswordCommand.oldPassword)) {
            throw InvalidCredentials("Old password is incorrect.")
        }

        val updatedUser = user.copy(passwordHash = PasswordUtils.hashPassword(changePasswordCommand.newPassword))
        return userService.updateUser(updatedUser)
    }
}