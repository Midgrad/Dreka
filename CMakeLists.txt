# CMake version string
cmake_minimum_required(VERSION 3.16)

# Dreka project
set(PROJECT_NAME "Dreka")
set(PROJECT_ORGANIZATION "Midgrad")
project(${PROJECT_NAME})

# Tests
option(TESTS_ENABLED "Enable tests" ON)
if(TESTS_ENABLED)
    enable_testing()
endif(TESTS_ENABLED)

# Versions
set(VERSION_MAJOR 0)
set(VERSION_MINOR 1)
set(VERSION_PATCH 0)

# Cmake includes
include(cmake/CopyResourcePostCMake.cmake)
include(cmake/TrToQrc.cmake)

# Set default output directory
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_LIST_DIR}/${CMAKE_BUILD_TYPE})
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_CURRENT_LIST_DIR}/${CMAKE_BUILD_TYPE})

# Minimum Qt version
set(QT_REQUIRED_VERSION 5.12.8)

# Use C++20 standart by default
set(CMAKE_CXX_STANDARD 17)

# Instruct CMake to run moc & rcc automatically when needed.
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

# Find includes in corresponding build directories
set(CMAKE_INCLUDE_CURRENT_DIR ON)

# 2ndparty libraries
add_subdirectory(2ndparty/industrial-controls)
add_subdirectory(2ndparty/industrial-indicators)
add_subdirectory(2ndparty/jord)

# Core library
add_subdirectory(kjarni)

# Dynamic modules
add_subdirectory(modules)

# Executable app target
add_subdirectory(app)
