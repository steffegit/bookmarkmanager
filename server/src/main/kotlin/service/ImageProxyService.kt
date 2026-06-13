package me.atsteffe.service

import org.slf4j.LoggerFactory
import java.net.InetAddress
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

data class ProxiedImage(val bytes: ByteArray, val contentType: String)

/**
 * Fetches remote images (favicons, Open Graph previews) once, caches the bytes
 * in Redis, and serves them back quickly on subsequent requests. This avoids
 * the browser hitting slow / unreliable third-party hosts on every page load.
 */
class ImageProxyService(private val cache: CacheService) {
    private val logger = LoggerFactory.getLogger(ImageProxyService::class.java)
    private val httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build()

    private val ttlSeconds = 30L * 24 * 3600 // 30 days
    private val maxBytes = 5 * 1024 * 1024 // 5 MB

    fun fetch(url: String): ProxiedImage? {
        if (!isSafeUrl(url)) {
            logger.warn("Rejected image proxy for unsafe url: $url")
            return null
        }

        val dataKey = "img:data:$url"
        val typeKey = "img:type:$url"

        val cachedBytes = cache.getBytes(dataKey)
        val cachedType = cache.getBytes(typeKey)
        if (cachedBytes != null && cachedType != null) {
            return ProxiedImage(cachedBytes, String(cachedType))
        }

        return try {
            val request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Mozilla/5.0 (compatible; Bookmarkr/1.0)")
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build()

            val response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray())
            if (response.statusCode() !in 200..299) return null

            val bytes = response.body()
            if (bytes.isEmpty() || bytes.size > maxBytes) return null

            val contentType = response.headers()
                .firstValue("content-type")
                .orElse("application/octet-stream")
                .takeIf { it.startsWith("image/") }
                ?: return null

            cache.setBytes(dataKey, bytes, ttlSeconds)
            cache.setBytes(typeKey, contentType.toByteArray(), ttlSeconds)

            ProxiedImage(bytes, contentType)
        } catch (e: Exception) {
            logger.warn("Failed to proxy image $url: ${e.message}")
            null
        }
    }

    // Basic SSRF protection: only http(s), and never internal / loopback hosts.
    private fun isSafeUrl(url: String): Boolean {
        return try {
            val uri = URI.create(url)
            val scheme = uri.scheme?.lowercase()
            if (scheme != "http" && scheme != "https") return false
            val host = uri.host ?: return false

            val addresses = InetAddress.getAllByName(host)
            addresses.none {
                it.isLoopbackAddress || it.isAnyLocalAddress ||
                    it.isSiteLocalAddress || it.isLinkLocalAddress
            }
        } catch (e: Exception) {
            false
        }
    }
}
