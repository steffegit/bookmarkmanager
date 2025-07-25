package me.atsteffe.config

import io.ktor.server.application.*
import me.atsteffe.repository.BookmarkRepository
import me.atsteffe.repository.JwtRepository
import me.atsteffe.repository.UserRepository
import me.atsteffe.service.AuthenticationService
import me.atsteffe.service.BookmarkService
import me.atsteffe.service.DatabaseMigrationService
import me.atsteffe.service.JwtService
import me.atsteffe.service.UserService
import org.jetbrains.exposed.sql.Database
import org.koin.dsl.module
import org.koin.ktor.ext.get
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

val databaseModule = module {
    single<Database> {
        Database.connect(
            url = "jdbc:h2:mem:test;DB_CLOSE_DELAY=-1",
            user = "root",
            driver = "org.h2.Driver",
            password = "",
        )
    }

    single { DatabaseMigrationService(get()) }
    single { UserRepository(get()) }
    single { BookmarkRepository(get()) }
    single { JwtRepository(get()) }
}

val serviceModule = module {
    single { UserService(get()) }
    single { BookmarkService(get()) }
    single { AuthenticationService(get()) }
    single {
        JwtService(
            get<SecurityConfig>().jwtSecret,
            get<SecurityConfig>().jwtIssuer,
            get<SecurityConfig>().jwtAudience,
            get() // JwtRepository
        )
    }
}

fun createConfigModule(application: Application) = module {
    single { SecurityConfig.fromEnvironment(application) }
}

fun Application.configureDependencyInjection() {
    install(Koin) {
        slf4jLogger()
        modules(createConfigModule(this@configureDependencyInjection), databaseModule, serviceModule)
    }

    // Run database migrations at startup
    val migrationService = get<DatabaseMigrationService>()
    migrationService.runMigrations()
} 