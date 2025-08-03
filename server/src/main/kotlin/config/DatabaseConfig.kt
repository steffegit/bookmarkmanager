package me.atsteffe.config

import io.ktor.server.application.*

data class DatabaseConfig(
    val url: String,
    val user: String,
    val password: String,
    val driver: String
) {
    init {
        require(url.isNotBlank()) { "Database URL cannot be blank" }
        require(user.isNotBlank()) { "Database user cannot be blank" }
        require(driver.isNotBlank()) { "Database driver cannot be blank" }
    }

    companion object {
        fun fromConfig(application: Application): DatabaseConfig {
            val config = application.environment.config
            val url = config.property("storage.jdbcURL").getString()
            val user = config.property("storage.user").getString()
            val password = config.property("storage.password").getString()
            val driver = config.property("storage.driverClassName").getString()

            return DatabaseConfig(
                url = url,
                user = user,
                password = password,
                driver = driver
            )
        }
    }
} 