package me.atsteffe.service

import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import me.atsteffe.model.Bookmark
import me.atsteffe.model.CategorizeResult
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

@Serializable
private data class OAIMessage(val role: String, val content: String)

@Serializable
private data class OAIResponseMessage(val content: String)

@Serializable
private data class OAIChoice(val message: OAIResponseMessage)

@Serializable
private data class OAIResponse(val choices: List<OAIChoice>)

class CategorizeService(private val apiKey: String) {
    private val json = Json { ignoreUnknownKeys = true }
    private val httpClient = HttpClient.newHttpClient()
    private val model = "openrouter/free"

    fun categorize(bookmarks: List<Bookmark>): CategorizeResult {
        if (bookmarks.isEmpty()) return CategorizeResult(emptyList())

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

        val prompt = """You are an expert bookmark organizer. Analyze these bookmarks and group them into meaningful, specific folders based on their actual content, domain, and purpose.

Return ONLY a JSON object — no explanation, no markdown, no code fences:
{"folders":[{"name":"Folder Name","bookmarkIds":["id1","id2"]}]}

Rules:
- Create 2 to 8 folders; fewer is better — merge related topics rather than splitting
- Every bookmark ID must appear in exactly one folder
- Folder names: 1-3 words, descriptive and specific (e.g. "AI Tools" not "Tools", "UI Libraries" not "Design")
- Group by actual content category:
  * AI/LLM tools and services → "AI Tools" or "LLM Services"
  * Code editors, IDEs, dev environments → "Dev Tools" or "Editors"
  * UI component libraries and design systems → "UI Libraries"
  * Docs and references → "Docs & Refs"
  * APIs and backend services → "APIs"
  * Use your judgment for other patterns
- Prefer fewer, richer folders over many small ones
- If nearly all bookmarks share a theme (e.g. all dev tools), still create meaningful sub-groupings

Bookmarks:
$bookmarkList"""

        val requestBody = buildString {
            append("""{"model":""")
            append(json.encodeToString(model))
            append(""","messages":[{"role":"user","content":""")
            append(json.encodeToString(prompt))
            append("""}]}""")
        }

        val request = HttpRequest.newBuilder()
            .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
            .header("Authorization", "Bearer $apiKey")
            .header("Content-Type", "application/json")
            .header("HTTP-Referer", "https://github.com/steffegit/bookmarkmanager")
            .header("X-Title", "Bookmarkr")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build()

        val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())

        check(response.statusCode() in 200..299) {
            "OpenRouter returned ${response.statusCode()}: ${response.body()}"
        }

        val oaiResponse = json.decodeFromString<OAIResponse>(response.body())
        val content = oaiResponse.choices.firstOrNull()?.message?.content
            ?: error("Empty response from AI model")

        // Strip any markdown fences the model may have added despite instructions
        val clean = content
            .replace(Regex("```json\\s*"), "")
            .replace(Regex("```\\s*"), "")
            .trim()

        val jsonStart = clean.indexOf('{')
        val jsonEnd = clean.lastIndexOf('}') + 1
        check(jsonStart >= 0 && jsonEnd > jsonStart) { "No JSON object found in AI response: $content" }

        return json.decodeFromString(clean.substring(jsonStart, jsonEnd))
    }
}
