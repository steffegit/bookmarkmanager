package me.atsteffe.repository

import me.atsteffe.model.BlacklistedToken
import me.atsteffe.model.JwtToken
import org.jetbrains.exposed.dao.id.UUIDTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.less
import org.jetbrains.exposed.sql.javatime.CurrentDateTime
import org.jetbrains.exposed.sql.javatime.datetime
import org.jetbrains.exposed.sql.transactions.transaction
import java.time.LocalDateTime

// Used to store invalidated JWT's (usually I should've used a KV like Redis)
object JwtStorage : UUIDTable("jwt_blacklist") {
    val tokenId = text("token_id").uniqueIndex()
    val userId = uuid("user_id").references(UsersTable.id, onDelete = ReferenceOption.CASCADE)
    val invalidatedAt = datetime("invalidated_at").defaultExpression(CurrentDateTime)
    val expiresAt = datetime("expires_at") // When the original token would have expired
}

class JwtRepository(private val database: Database) {

    fun invalidateToken(jwtToken: JwtToken) = transaction(database) {
        JwtStorage.insert {
            it[tokenId] = jwtToken.tokenId
            it[userId] = jwtToken.userId
            it[expiresAt] = jwtToken.expiresAt
        }
    }


    fun isTokenBlacklisted(tokenId: String): Boolean = transaction(database) {
        JwtStorage.selectAll().where { JwtStorage.tokenId eq tokenId }.count() > 0
    }

    fun cleanupExpiredTokens(): Int = transaction(database) {
        val now = LocalDateTime.now()
        JwtStorage.deleteWhere { JwtStorage.expiresAt less now }
    }

    private fun toBlacklistedToken(row: ResultRow) = BlacklistedToken(
        tokenId = row[JwtStorage.tokenId],
        userId = row[JwtStorage.userId],
        expiresAt = row[JwtStorage.expiresAt],
        invalidatedAt = row[JwtStorage.invalidatedAt]
    )
}