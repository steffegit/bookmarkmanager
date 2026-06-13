package me.atsteffe.service

import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import me.atsteffe.model.Bookmark
import me.atsteffe.model.CategorizeResult
import org.slf4j.LoggerFactory
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

@Serializable
private data class OAIMessage(val role: String, val content: String)

@Serializable
private data class OAIRequest(
    val model: String,
    val messages: List<OAIMessage>,
    val temperature: Double = 0.2,
)

@Serializable
private data class OAIResponseMessage(val content: String)

@Serializable
private data class OAIChoice(val message: OAIResponseMessage)

@Serializable
private data class OAIResponse(val choices: List<OAIChoice>)

class CategorizeService(private val apiKey: String) {
    private val logger = LoggerFactory.getLogger(CategorizeService::class.java)
    private val json = Json { ignoreUnknownKeys = true }
    private val httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .build()

    // Ordered fallback chain of capable free OpenRouter models. The first that
    // returns valid JSON wins; if a model is rate-limited, errors, or returns
    // unparseable output we move on to the next one. Larger / stronger
    // instruction-following models come first.
    private val models = listOf(
        "meta-llama/llama-3.3-70b-instruct:free",
        "qwen/qwen3-next-80b-a3b-instruct:free",
        "openai/gpt-oss-120b:free",
        "google/gemma-4-31b-it:free",
        "nousresearch/hermes-3-llama-3.1-405b:free",
    )

    fun categorize(bookmarks: List<Bookmark>): CategorizeResult {
        if (bookmarks.isEmpty()) return CategorizeResult(emptyList())

        val validIds = bookmarks.map { it.id.toString() }.toSet()
        val messages = buildMessages(bookmarks)

        val failures = mutableListOf<String>()
        for (model in models) {
            try {
                val result = requestCategorization(model, messages, validIds)
                if (result.folders.isNotEmpty()) {
                    logger.info("Categorized ${bookmarks.size} bookmarks into ${result.folders.size} folders using $model")
                    return result
                }
                failures.add("$model: returned no folders")
            } catch (e: Exception) {
                logger.warn("Model $model failed to categorize: ${e.message}")
                failures.add("$model: ${e.message}")
            }
        }

        error("All categorization models failed. ${failures.joinToString("; ")}")
    }

    private fun buildMessages(bookmarks: List<Bookmark>): List<OAIMessage> {
        val bookmarkList = bookmarks.joinToString("\n---\n") { b ->
            buildString {
                appendLine("ID: ${b.id}")
                appendLine("Title: ${b.title ?: "Untitled"}")
                append("URL: ${b.url}")
                b.description?.takeIf { it.isNotBlank() }?.let {
                    appendLine()
                    append("Description: $it")
                }
            }
        }

        val system =
            "You are an expert bookmark organizer. You analyze bookmarks and group them " +
            "into meaningful, specific folders based on their actual content, domain, and " +
            "purpose. You ALWAYS respond with a single valid JSON object and nothing else — " +
            "no explanation, no markdown, no code fences."

        val user = """Group these bookmarks into logical folders.

Respond with exactly this JSON shape:
{"folders":[{"name":"Folder Name","bookmarkIds":["id1","id2"]}]}

Rules:
- Create 2 to 8 folders; fewer is better — merge related topics rather than splitting.
- Every bookmark ID must appear in exactly one folder. Use only the IDs listed below verbatim.
- Folder names: 1-3 words, descriptive and specific (e.g. "AI Tools" not "Tools", "UI Libraries" not "Design").
- Group by real content category, for example:
  * AI / LLM tools and services -> "AI Tools"
  * Code editors, IDEs, dev environments -> "Dev Tools"
  * UI component libraries and design systems -> "UI Libraries"
  * Documentation and references -> "Docs"
  * News, blogs, articles -> "Reading"
  Use your own judgment for other patterns.
- Prefer fewer, richer folders over many tiny ones.

Bookmarks:
$bookmarkList"""

        return listOf(
            OAIMessage(role = "system", content = system),
            OAIMessage(role = "user", content = user),
        )
    }

    private fun requestCategorization(
        model: String,
        messages: List<OAIMessage>,
        validIds: Set<String>,
    ): CategorizeResult {
        val requestBody = json.encodeToString(OAIRequest(model = model, messages = messages))

        val request = HttpRequest.newBuilder()
            .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
            .header("Authorization", "Bearer $apiKey")
            .header("Content-Type", "application/json")
            .header("HTTP-Referer", "https://github.com/steffegit/bookmarkmanager")
            .header("X-Title", "Bookmarkr")
            .timeout(Duration.ofSeconds(60))
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build()

        val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())

        check(response.statusCode() in 200..299) {
            "HTTP ${response.statusCode()}: ${response.body().take(200)}"
        }

        val oaiResponse = json.decodeFromString<OAIResponse>(response.body())
        val content = oaiResponse.choices.firstOrNull()?.message?.content
            ?: error("empty response")

        val parsed = parseResult(content)

        // Drop any hallucinated IDs the model may have invented so the frontend
        // only ever receives assignments that map to real bookmarks.
        val sanitized = parsed.folders
            .map { folder ->
                folder.copy(bookmarkIds = folder.bookmarkIds.filter { it in validIds })
            }
            .filter { it.bookmarkIds.isNotEmpty() }

        return CategorizeResult(sanitized)
    }

    private fun parseResult(content: String): CategorizeResult {
        // Strip any markdown fences the model may have added despite instructions.
        val clean = content
            .replace(Regex("```json\\s*"), "")
            .replace(Regex("```\\s*"), "")
            .trim()

        val jsonStart = clean.indexOf('{')
        val jsonEnd = clean.lastIndexOf('}') + 1
        check(jsonStart >= 0 && jsonEnd > jsonStart) { "no JSON object in response" }

        return json.decodeFromString(clean.substring(jsonStart, jsonEnd))
    }
}
