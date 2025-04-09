plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
}

val flutterVersionCode = "1"
val flutterVersionName = "1.0"

android {
    namespace = "com.enemprepai.app"
    compileSdk = rootProject.ext["flutter.compileSdkVersion"] as Int
    ndkVersion = rootProject.ext["flutter.ndkVersion"] as String

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    sourceSets {
        getByName("main").java.srcDirs("src/main/kotlin")
    }

    defaultConfig {
        applicationId = "com.enemprepai.app"
        minSdk = rootProject.ext["flutter.minSdkVersion"] as Int
        targetSdk = rootProject.ext["flutter.targetSdkVersion"] as Int
        versionCode = flutterVersionCode.toInt()
        versionName = flutterVersionName
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = ".."
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.7.10")
}
