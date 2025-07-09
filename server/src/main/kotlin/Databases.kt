package me.atsteffe

import io.ktor.server.application.*
import me.atsteffe.repository.BookmarkRepository
import me.atsteffe.service.BookmarkService
import org.jetbrains.exposed.sql.*

lateinit var bookmarkRepository: BookmarkRepository
lateinit var bookmarkService: BookmarkService

fun Application.configureDatabases() {
    val database = Database.connect(
        url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1",
        user = "root",
        driver = "org.h2.Driver",
        password = "",
    )

    bookmarkRepository = BookmarkRepository(database)
    bookmarkService = BookmarkService(bookmarkRepository)
}
