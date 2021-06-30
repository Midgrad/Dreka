#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QtWebEngine>

#include "map_viewport_controller.h"

int main(int argc, char* argv[]) {
  QCoreApplication::setOrganizationName("Midgrad");
  QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
  QCoreApplication::setAttribute(Qt::AA_ShareOpenGLContexts);

  QGuiApplication app(argc, argv);
  QtWebEngine::initialize();

  MapViewportController viewportController;

  QQmlApplicationEngine engine;
  engine.rootContext()->setContextProperty("viewportController",
                                           &viewportController);
  engine.load(QUrl(QStringLiteral("qrc:/Dreka/qml/MainWindow.qml")));

  return app.exec();
}
