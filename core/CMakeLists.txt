# Project
project(dreka_core)

# Find Qt libraries
find_package(Qt5 ${QT_REQUIRED_VERSION} COMPONENTS Core REQUIRED)

# Target
add_library(${PROJECT_NAME} SHARED "")

# Include
target_include_directories(${PROJECT_NAME} PUBLIC "include" PRIVATE "src")

# Sources
file(GLOB SOURCES "include/*" "src/*")
target_sources(${PROJECT_NAME} PRIVATE ${SOURCES})

# Link with libraries
target_link_libraries(${PROJECT_NAME} PUBLIC Qt5::Core)
