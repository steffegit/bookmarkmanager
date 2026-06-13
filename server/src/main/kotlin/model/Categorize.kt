package me.atsteffe.model

import kotlinx.serialization.Serializable

@Serializable
data class FolderSuggestion(
    val name: String,
    val bookmarkIds: List<String>
)

@Serializable
data class CategorizeResult(
    val folders: List<FolderSuggestion>
)
