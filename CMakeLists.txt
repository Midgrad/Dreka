# Dreka
# Project
project(Dreka)

# CMake version string
cmake_minimum_required(VERSION 3.16)

# Set default output directory
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_LIST_DIR}/result)

# Instruct CMake to run moc & rcc automatically when needed.
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

# Find includes in corresponding build directories
set(CMAKE_INCLUDE_CURRENT_DIR ON)

# Minimum Qt version
set(QT_REQUIRED_VERSION 5.12.8)

# Executable app target
add_subdirectory(app)
