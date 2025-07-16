package me.atsteffe

import io.ktor.server.application.*
import me.atsteffe.repository.BookmarkRepository
import me.atsteffe.repository.UserRepository
import me.atsteffe.service.BookmarkService
import me.atsteffe.service.UserService
import org.jetbrains.exposed.sql.*

lateinit var bookmarkRepository: BookmarkRepository
lateinit var bookmarkService: BookmarkService

lateinit var userRepository: UserRepository
lateinit var userService: UserService

fun Application.configureDatabases() {
    val database = Database.connect(
        url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1",
        user = "root",
        driver = "org.h2.Driver",
        password = "",
    )

    bookmarkRepository = BookmarkRepository(database)
    bookmarkService = BookmarkService(bookmarkRepository)
    
    userRepository = UserRepository(database)
    userService = UserService(userRepository)
}
