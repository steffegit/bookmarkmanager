package me.atsteffe.command

import me.atsteffe.model.ChangePasswordRequest
import java.util.UUID

data class ChangePasswordCommand(
    val userId: UUID,
    val oldPassword: String,
    val newPassword: String
)

fun ChangePasswordRequest.toCommand(userId: UUID): ChangePasswordCommand {
    return ChangePasswordCommand(
        userId = userId,
        oldPassword = this.oldPassword,
        newPassword = this.newPassword
    )
}