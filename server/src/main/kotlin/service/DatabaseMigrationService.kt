package me.atsteffe.service

import me.atsteffe.repository.BookmarksTable
import me.atsteffe.repository.UsersTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import org.slf4j.LoggerFactory

class DatabaseMigrationService(private val database: Database) {
    private val logger = LoggerFactory.getLogger(DatabaseMigrationService::class.java)
    
    fun runMigrations() {
        logger.info("Running database migrations...")
        
        transaction(database) {
            SchemaUtils.create(UsersTable, BookmarksTable)
        }
        
        logger.info("Database migrations completed successfully")
    }
} 