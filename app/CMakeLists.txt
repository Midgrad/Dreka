# Project
project(DrekaApp)

# Copy resources
copy_post_cmake("theme.json" ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})
copy_post_cmake("layers.json" ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})
copy_post_cmake("../node_modules/cesium/Build/Cesium" "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/")
copy_post_cmake("web" "${CMAKE_RUNTIME_OUTPUT_DIRECTORY}/")

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
HEADER_DIRECTORIES(INCLUDES "include")
target_include_directories(${PROJECT_NAME} PUBLIC ${INCLUDES} PRIVATE "src")

# Sources
file(GLOB_RECURSE SOURCES "include/*" "src/*")
target_sources(${PROJECT_NAME} PRIVATE ${SOURCES})

# Create translations QRC file
file(GLOB TS_FILES "translations/*.ts")
tr_to_qrc("${CMAKE_CURRENT_BINARY_DIR}/cesium_map_ts.qrc")

# Local resources
file(GLOB LOC_QRC_FILES "qml/*.qrc" "resources/*.qrc")

# Compile resources
qt5_add_resources(QRC_SOURCES ${QRC_FILES} ${LOC_QRC_FILES})
target_sources(${PROJECT_NAME} PRIVATE ${QRC_SOURCES})

# Link with libraries
target_link_libraries(${PROJECT_NAME}
    PRIVATE industrial_controls industrial_indicators jord kjarni
    PRIVATE Qt5::Core Qt5::Quick Qt5::WebEngine Qt5::WebChannel
)
