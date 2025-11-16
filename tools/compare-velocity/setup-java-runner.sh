#!/bin/bash
# Setup script to download Velocity JARs and build the Java runner

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAR_DIR="$SCRIPT_DIR/jars"
VERSION="2.3"

mkdir -p "$JAR_DIR"

echo "Downloading Velocity Engine JARs..."

# Download Velocity Engine Core
if [ ! -f "$JAR_DIR/velocity-engine-core-$VERSION.jar" ]; then
    echo "Downloading velocity-engine-core..."
    curl -L -o "$JAR_DIR/velocity-engine-core-$VERSION.jar" \
        "https://repo1.maven.org/maven2/org/apache/velocity/velocity-engine-core/$VERSION/velocity-engine-core-$VERSION.jar"
fi

# Download Gson for JSON parsing
if [ ! -f "$JAR_DIR/gson-2.10.1.jar" ]; then
    echo "Downloading gson..."
    curl -L -o "$JAR_DIR/gson-2.10.1.jar" \
        "https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar"
fi

# Download SLF4J API and Simple (required by Velocity)
if [ ! -f "$JAR_DIR/slf4j-api-1.7.36.jar" ]; then
    echo "Downloading slf4j-api..."
    curl -L -o "$JAR_DIR/slf4j-api-1.7.36.jar" \
        "https://repo1.maven.org/maven2/org/slf4j/slf4j-api/1.7.36/slf4j-api-1.7.36.jar"
fi

if [ ! -f "$JAR_DIR/slf4j-simple-1.7.36.jar" ]; then
    echo "Downloading slf4j-simple..."
    curl -L -o "$JAR_DIR/slf4j-simple-1.7.36.jar" \
        "https://repo1.maven.org/maven2/org/slf4j/slf4j-simple/1.7.36/slf4j-simple-1.7.36.jar"
fi

# Download Apache Commons Lang (required by Velocity)
if [ ! -f "$JAR_DIR/commons-lang3-3.12.0.jar" ]; then
    echo "Downloading commons-lang3..."
    curl -L -o "$JAR_DIR/commons-lang3-3.12.0.jar" \
        "https://repo1.maven.org/maven2/org/apache/commons/commons-lang3/3.12.0/commons-lang3-3.12.0.jar"
fi

echo "JARs downloaded to $JAR_DIR"
echo "You can now compile the Java runner with:"
echo "  javac -cp \"$JAR_DIR/*\" VelocityRunner.java"
