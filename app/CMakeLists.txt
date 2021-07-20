# Project
project(Dreka LANGUAGES CXX)

# Find Qt libraries
find_package(Qt5 COMPONENTS Core Quick WebEngine REQUIRED)

# Executable target
add_executable(${PROJECT_NAME} "")

# Include
target_include_directories(${PROJECT_NAME} PUBLIC "include" PRIVATE "src")

# Sources
file(GLOB SOURCES "include/*" "src/*")
target_sources(${PROJECT_NAME} PRIVATE ${SOURCES})

# Compile resources
qt5_add_resources(QRC_SOURCES ${QRC_FILES})
target_sources(${PROJECT_NAME} PRIVATE ${QRC_SOURCES})

# Link with libraries
target_link_libraries(${PROJECT_NAME} Qt5::Core Qt5::Quick Qt5::WebEngine)
