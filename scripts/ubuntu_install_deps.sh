#!/bin/bash

# Launch from root
if [[ $EUID -ne 0 ]]; then
  SUDO='sudo'
else
  SUDO=''
fi

$SUDO apt update -qq
$SUDO apt install -y nodejs npm cmake google-mock googletest qttools5-dev qttools5-dev-tools qtbase5-dev qtchooser qtdeclarative5-dev qtmultimedia5-dev qtquickcontrols2-5-dev libqt5serialport5-dev libqt5websockets5-dev libqt5svg5-dev libqt5opengl5-dev libqt5sql5-psql qml-module-qtquick-controls2 qml-module-qtmultimedia qml-module-qtgraphicaleffects qml-module-qtquick-layouts qml-module-qt-labs-settings qml-module-qtquick-dialogs qml-module-qtwebchannel qtwebengine5-dev qml-module-qt-labs-qmlmodels qml-module-qtwebengine

