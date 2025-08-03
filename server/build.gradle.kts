plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.ktor)
    alias(libs.plugins.kotlin.plugin.serialization)
}

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}

tasks.withType<ProcessResources> {
    val wasmOutput = file("../web/build/dist/wasmJs/productionExecutable")
    if (wasmOutput.exists()) {
        inputs.dir(wasmOutput)
    }

    from("../web/build/dist/wasmJs/productionExecutable") {
        into("web")
        include("**/*")
    }
    duplicatesStrategy = DuplicatesStrategy.WARN
}

dependencies {
    implementation(libs.ktor.server.html.builder)
    implementation(libs.kotlinx.html)
    implementation(libs.ktor.server.core)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.exposed.core)
    implementation(libs.exposed.jdbc)
    implementation(libs.exposed.java.time)
    implementation(libs.h2)
    implementation(libs.ktor.server.netty)
    implementation(libs.logback.classic)
    implementation(libs.ktor.server.config.yaml)
    implementation("io.ktor:ktor-serialization-gson:3.2.1")
    testImplementation(libs.ktor.server.test.host)
    testImplementation(libs.kotlin.test.junit)
    implementation("com.fleeksoft.ksoup:ksoup:0.2.4")
    implementation("com.fleeksoft.ksoup:ksoup-kotlinx:0.2.4")
    implementation("com.fleeksoft.ksoup:ksoup-network:0.2.4")
    implementation("io.ktor:ktor-server-auth")
    implementation("io.ktor:ktor-server-auth-jwt")
    implementation("de.mkammerer:argon2-jvm:2.12")
    implementation("io.ktor:ktor-server-call-logging")
    implementation("io.ktor:ktor-server-status-pages")
    implementation(project.dependencies.platform(libs.koin.bom))
    implementation(libs.koin.core)
    implementation(libs.koin.ktor)
    implementation(libs.koin.logger.slf4j)
    implementation("io.ktor:ktor-server-cors")
    implementation("org.postgresql:postgresql:42.7.7")
}

ktor {
    fatJar {
        archiveFileName.set("fat.jar")
    }
}