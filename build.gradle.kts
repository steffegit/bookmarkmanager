
plugins {
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.multiplatform) apply false
    alias(libs.plugins.ktor) apply false
    alias(libs.plugins.kotlin.plugin.serialization) apply false
}

subprojects {
    repositories {
        mavenCentral()
    }

    group = "me.atsteffe"
    version = "0.0.1"
}
