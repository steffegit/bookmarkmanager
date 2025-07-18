package me.atsteffe.util

import java.util.regex.Pattern

@JvmInline
value class Email(private val value: String) {
    companion object {
        private val EMAIL_REGEX = Pattern.compile(
            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
        )
    }

    init {
        if (value.isBlank()) throw InvalidEmailException("Email cannot be empty")
        if (!EMAIL_REGEX.matcher(value).matches()) throw InvalidEmailException("Invalid email format: $value")
    }

    override fun toString(): String = value.lowercase()

    fun getValue(): String = value.lowercase()
}