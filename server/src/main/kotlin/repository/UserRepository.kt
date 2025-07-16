package me.atsteffe.repository

import me.atsteffe.model.User
import me.atsteffe.util.MAX_VARCHAR_LENGTH
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.insert
import java.util.UUID

object UsersTable : UUIDTable("users") {
    val email = varchar("email", MAX_VARCHAR_LENGTH).uniqueIndex()
    val displayName = varchar("displayName", MAX_VARCHAR_LENGTH).nullable()
    val googleId = varchar("googleId", MAX_VARCHAR_LENGTH).uniqueIndex().nullable()
    val githubId = varchar("githubId", MAX_VARCHAR_LENGTH).uniqueIndex().nullable()
    val passwordHash = varchar("passwordHash", MAX_VARCHAR_LENGTH).nullable()
}

class UserRepository(private val database: Database) {
    init {
        transaction(database) {
            SchemaUtils.create(UsersTable)
        }
    }

    fun findById(id: UUID): User? = transaction(database) {
        UsersTable.selectAll().where { UsersTable.id eq id }.map {
            toUser(it)
        }.singleOrNull()
    }

    fun findByEmail(email: String): User? = transaction(database) {
        UsersTable.selectAll().where { UsersTable.email eq email }.map {
            toUser(it)
        }.singleOrNull()
    }

    fun findByGoogleId(googleId: String): User? = transaction(database) {
        UsersTable.selectAll().where { UsersTable.googleId eq googleId }.map {
            toUser(it)
        }.singleOrNull()
    }

    fun findByGithubId(githubId: String): User? = transaction(database) {
        UsersTable.selectAll().where { UsersTable.githubId eq githubId }.map {
            toUser(it)
        }.singleOrNull()
    }

    fun save(user: User): User = transaction(database) {
        val existingUser = findById(user.id)

        if (existingUser != null) {
            UsersTable.update({ UsersTable.id eq user.id }) {
                it[email] = user.email
                it[displayName] = user.displayName
                it[googleId] = user.googleId
                it[githubId] = user.githubId
                it[passwordHash] = user.passwordHash
            }
        } else {
            UsersTable.insert {
                it[id] = user.id
                it[email] = user.email
                it[displayName] = user.displayName
                it[googleId] = user.googleId
                it[githubId] = user.githubId
                it[passwordHash] = user.passwordHash
            }
        }

        findById(user.id) ?: throw IllegalStateException("User not found after save operation")
    }

    private fun toUser(row: ResultRow) = User(
        id = row[UsersTable.id].value,
        email = row[UsersTable.email],
        displayName = row[UsersTable.displayName],
        googleId = row[UsersTable.googleId],
        githubId = row[UsersTable.githubId],
        passwordHash = row[UsersTable.passwordHash]
    )
}