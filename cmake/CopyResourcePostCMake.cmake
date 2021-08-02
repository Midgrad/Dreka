# Copy with run cmake
macro(copy_post_cmake SRC DEST)
file(COPY ${SRC} DESTINATION ${DEST})
endmacro()
