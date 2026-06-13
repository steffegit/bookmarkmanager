package me.atsteffe.service

import kotlinx.serialization.DeserializationStrategy
import kotlinx.serialization.SerializationStrategy
import kotlinx.serialization.json.Json
import org.slf4j.LoggerFactory
import redis.clients.jedis.JedisPool

/**
 * Thin Redis-backed cache. Every operation fails open: if Redis is not
 * configured or is unreachable, reads return null and writes are no-ops, so
 * the application keeps working (just without caching).
 */
class CacheService(private val pool: JedisPool?) {
    private val logger = LoggerFactory.getLogger(CacheService::class.java)
    private val json = Json { ignoreUnknownKeys = true }

    val enabled: Boolean get() = pool != null

    fun <T> get(key: String, deserializer: DeserializationStrategy<T>): T? {
        val pool = pool ?: return null
        return try {
            pool.resource.use { jedis ->
                jedis.get(key)?.let { json.decodeFromString(deserializer, it) }
            }
        } catch (e: Exception) {
            logger.warn("Cache get failed for key '$key': ${e.message}")
            null
        }
    }

    fun <T> set(
        key: String,
        value: T,
        serializer: SerializationStrategy<T>,
        ttlSeconds: Long? = null,
    ) {
        val pool = pool ?: return
        try {
            pool.resource.use { jedis ->
                val payload = json.encodeToString(serializer, value)
                if (ttlSeconds != null) jedis.setex(key, ttlSeconds, payload)
                else jedis.set(key, payload)
            }
        } catch (e: Exception) {
            logger.warn("Cache set failed for key '$key': ${e.message}")
        }
    }

    fun delete(key: String) {
        val pool = pool ?: return
        try {
            pool.resource.use { it.del(key) }
        } catch (e: Exception) {
            logger.warn("Cache delete failed for key '$key': ${e.message}")
        }
    }

    fun getBytes(key: String): ByteArray? {
        val pool = pool ?: return null
        return try {
            pool.resource.use { it.get(key.toByteArray()) }
        } catch (e: Exception) {
            logger.warn("Cache getBytes failed for key '$key': ${e.message}")
            null
        }
    }

    fun setBytes(key: String, value: ByteArray, ttlSeconds: Long) {
        val pool = pool ?: return
        try {
            pool.resource.use { it.setex(key.toByteArray(), ttlSeconds, value) }
        } catch (e: Exception) {
            logger.warn("Cache setBytes failed for key '$key': ${e.message}")
        }
    }
}
