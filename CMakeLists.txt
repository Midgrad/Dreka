# CMake version string
cmake_minimum_required(VERSION 3.16)

# Dreka project
set(PROJECT_NAME "Dreka")
set(PROJECT_ORGANIZATION "Midgrad")
project(${PROJECT_NAME})

# Versions
set(FLT_PROJECT_VERSION_MAJOR 0)
set(FLT_PROJECT_VERSION_MINOR 1)
set(FLT_PROJECT_VERSION_PATCH 0)

# Cmake includes
include(cmake/TrToQrc.cmake)

# Set default output directory
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_LIST_DIR}/result)

# Use C++20 standart by default
set(CMAKE_CXX_STANDARD 20)

# Instruct CMake to run moc & rcc automatically when needed.
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

# Find includes in corresponding build directories
set(CMAKE_INCLUDE_CURRENT_DIR ON)

# Minimum Qt version
set(QT_REQUIRED_VERSION 5.12.8)

# 2ndparty libraries
add_subdirectory(2ndparty/industrial-controls)
add_subdirectory(2ndparty/industrial-indicators)

# Executable app target
add_subdirectory(app)
