# Project
project(DrekaApp)

# Copy theme config
copy_post_cmake("theme.json" ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})

# Get git revision hash
execute_process(
    COMMAND git rev-parse HEAD
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE GIT_REVISION
    OUTPUT_STRIP_TRAILING_WHITESPACE
)

# Get version from git
add_definitions(-DVERSION_MAJOR=${VERSION_MAJOR})
add_definitions(-DVERSION_MINOR=${VERSION_MINOR})
add_definitions(-DVERSION_PATCH=${VERSION_PATCH})
add_definitions(-DGIT_REVISION="${GIT_REVISION}")

# Version message
message(STATUS "Configuring ${PROJECT_NAME} ${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}(${GIT_REVISION})")

# Find Qt libraries
find_package(Qt5 ${QT_REQUIRED_VERSION} COMPONENTS Core Quick WebEngine WebChannel REQUIRED)

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
target_link_libraries(${PROJECT_NAME}
    PRIVATE industrial_controls industrial_indicators dreka_core
    PRIVATE Qt5::Core Qt5::Quick Qt5::WebEngine Qt5::WebChannel
)
