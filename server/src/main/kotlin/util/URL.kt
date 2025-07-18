package me.atsteffe.util

import java.util.regex.Pattern

@JvmInline
value class URL(private val value: String) {
    companion object {
        private val URL_REGEX = Pattern.compile(
            "^(https?://)?" + // optional http or https
            "([\\w-]+\\.)+[\\w-]+" + // domain name
            "(:\\d+)?(/\\S*)?$", // optional port and path
            Pattern.CASE_INSENSITIVE
        )
    }
    
    init {
        if (value.isBlank()) throw InvalidUrlException("URL cannot be empty")
        if (!URL_REGEX.matcher(value).matches()) throw InvalidUrlException("Invalid URL format: $value")
    }
    
    override fun toString(): String = value
    
    fun getValue(): String = value
} 