# Project
project(cesium_map)

# Find Qt libraries
find_package(Qt5 ${QT_REQUIRED_VERSION} COMPONENTS Core REQUIRED)

# Qt plugin definition
add_definitions(-DQT_PLUGIN)

# Target
add_library(${PROJECT_NAME} MODULE "")

# Include
target_include_directories(${PROJECT_NAME} PUBLIC "src")

# Sources
file(GLOB SOURCES "src/*")
target_sources(${PROJECT_NAME} PRIVATE ${SOURCES})

# Libraries
target_link_libraries(${PROJECT_NAME} PUBLIC dreka_core)
