package me.atsteffe.model

import kotlinx.serialization.Serializable
import me.atsteffe.util.UUIDSerializer
import java.util.UUID

@Serializable
data class Bookmark(
    @Serializable(with = UUIDSerializer::class)
    val id: UUID = UUID.randomUUID(),
    val url: String,
    val title: String?,
    val description: String?,
//    val tags: List<String> = emptyList()
)
