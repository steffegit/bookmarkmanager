package me.atsteffe.util

import de.mkammerer.argon2.Argon2
import de.mkammerer.argon2.Argon2Factory

object PasswordUtils {
    private val argon2: Argon2 = Argon2Factory.create()
    private const val NUM_OF_ITERATIONS: Int = 3
    private const val MEMORY_KB: Int = 65536
    private const val THREAD_COUNT: Int = 1

    // Using Byte Arrays because String format is deprecated.

    fun hashPassword(password: String): String =
        argon2.hash(NUM_OF_ITERATIONS, MEMORY_KB, THREAD_COUNT, password.toByteArray())

    fun validatePassword(storedHash: String, password: String): Boolean =
        argon2.verify(storedHash, password.toByteArray())
}