package me.atsteffe.model

import java.util.UUID
import kotlinx.serialization.Serializable
import me.atsteffe.util.UUIDSerializer

data class User(
    val id: UUID = UUID.randomUUID(),
    val email: String,
    val displayName: String?,
    val googleId: String? = null,
    val githubId: String? = null,
    val passwordHash: String? = null
)

@Serializable
data class LoginRequest(val email: String, val password: String)

@Serializable
data class SignupRequest(val email: String, val password: String, val displayName: String?)

@Serializable
data class UserResponse(
    @Serializable(with = UUIDSerializer::class) val id: UUID,
    val email: String,
    val displayName: String?,
)

@Serializable
data class AuthResponse(val token: String, val user: UserResponse)

fun User.toResponse(): UserResponse = UserResponse(id, email, displayName)
