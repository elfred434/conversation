plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.elfred434.fluentflow"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        // Identifiant applicatif definitif de FluentFlow.
        applicationId = "com.elfred434.fluentflow"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        // versionCode vient de pubspec, ou de --build-number en CI
        // (github.run_number => strictement croissant => mises a jour en place).
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        create("release") {
            // Signature stable depuis la CI : le keystore est dechiffre par le
            // workflow (secret KEYSTORE_PASS) et expose via ces variables d'env.
            val ksPath = System.getenv("FLUTTER_KEYSTORE_PATH")
            val ksPassword = System.getenv("FLUTTER_KEYSTORE_PASSWORD")
            if (ksPath != null && ksPassword != null) {
                storeFile = file(ksPath)
                storePassword = ksPassword
                keyAlias = System.getenv("FLUTTER_KEY_ALIAS") ?: "fluentflow"
                keyPassword = ksPassword
            }
        }
    }

    buildTypes {
        release {
            // Utilise la cle d'upload si disponible (CI), sinon debug (local).
            signingConfig =
                if (System.getenv("FLUTTER_KEYSTORE_PATH") != null)
                    signingConfigs.getByName("release")
                else
                    signingConfigs.getByName("debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
