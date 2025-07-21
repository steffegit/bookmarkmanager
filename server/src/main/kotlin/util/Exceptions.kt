package me.atsteffe.util

// Bookmark exceptions
class BookmarkNotFoundException(message: String) : RuntimeException(message)
class DuplicateBookmarkUrlException(message: String) : RuntimeException(message)

// User & Auth exceptions
class UserAlreadyExists(message: String) : IllegalArgumentException(message)
class InvalidCredentials(message: String) : IllegalArgumentException(message)
class UnsupportedAuthenticationMethod(message: String) : IllegalArgumentException(message)

// JWT exceptions
abstract class JwtException(message: String) : RuntimeException(message)
class JwtTokenMissingException : JwtException("Authorization token required")
class JwtTokenInvalidFormatException : JwtException("Invalid token format")
class JwtTokenBlacklistedException : JwtException("Token has been invalidated")
class JwtTokenInvalidException(message: String = "Invalid or expired token") : JwtException(message)
class JwtTokenMissingClaimsException(message: String) : JwtException(message)
class JwtTokenRefreshFailedException : JwtException("Token refresh failed - invalid or expired")
class JwtPrincipalInvalidException : JwtException("Invalid JWT principal")

// Validation exceptions
class InvalidEmailException(message: String) : IllegalArgumentException(message)
class InvalidUrlException(message: String) : IllegalArgumentException(message) 